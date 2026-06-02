from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen


class RaiaClientError(RuntimeError):
    """Raised when a RAIA endpoint returns a non-success response."""


@dataclass(frozen=True)
class RaiaClient:
    base_url: str
    api_key: str | None = None
    agent_id: str | None = None
    timeout_seconds: float = 30.0

    def search(self, **params: Any) -> list[dict[str, Any]]:
        payload = self._request("POST", "/properties/search", params)
        if isinstance(payload, list):
            return payload
        return payload.get("properties", [])

    def get_property(self, raia_id: str) -> dict[str, Any] | None:
        return self._request("GET", f"/properties/{quote(raia_id)}", none_on={404})

    def verify_agent(self, raia_id: str) -> dict[str, Any]:
        return self._request("GET", f"/agents/{quote(raia_id)}/verify")

    def request_viewing(
        self,
        *,
        property_raia_id: str,
        buyer_agent_raia_id: str,
        proposed_slots: list[dict[str, str]],
        viewing_type: str = "IN_PERSON",
        qualification: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        return self._request(
            "POST",
            "/enquiries/viewings",
            {
                "property_raia_id": property_raia_id,
                "buyer_agent_raia_id": buyer_agent_raia_id,
                "proposed_slots": proposed_slots,
                "viewing_type": viewing_type,
                "qualification": qualification,
            },
        )

    def issue_consent_token(
        self,
        *,
        data_subject_id: str,
        audience: str,
        purpose: str,
        level: int,
        property_ref: str,
        scopes: list[str],
        expires_in_seconds: int | None = None,
    ) -> dict[str, Any]:
        return self._request(
            "POST",
            "/consent-tokens",
            {
                "data_subject_id": data_subject_id,
                "audience": audience,
                "purpose": purpose,
                "level": level,
                "property_ref": property_ref,
                "scopes": scopes,
                "expires_in_seconds": expires_in_seconds,
            },
        )

    def _request(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
        *,
        none_on: set[int] | None = None,
    ) -> Any:
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        headers = {"Accept": "application/json"}
        if body is not None:
            headers["Content-Type"] = "application/json"
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        if self.agent_id:
            headers["X-RAIA-Agent-Id"] = self.agent_id

        request = Request(
            f"{self.base_url.rstrip('/')}{path}",
            data=body,
            headers=headers,
            method=method,
        )

        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                data = response.read()
        except HTTPError as exc:
            if none_on and exc.code in none_on:
                return None
            detail = exc.read().decode("utf-8", errors="replace")
            raise RaiaClientError(f"RAIA request failed {exc.code}: {detail}") from exc

        if not data:
            return None
        return json.loads(data.decode("utf-8"))
