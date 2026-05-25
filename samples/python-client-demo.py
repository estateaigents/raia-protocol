#!/usr/bin/env python
from __future__ import annotations

import json
import os
from urllib.request import Request, urlopen


BASE_URL = os.environ.get("RAIA_BASE_URL", "http://localhost:8787/api/raia/v0.2")


def request(path: str, payload: dict | None = None) -> dict:
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    req = Request(
        f"{BASE_URL}{path}",
        data=body,
        method="GET" if payload is None else "POST",
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer dev-key",
            "X-RAIA-Agent-Id": "org-gb-buyeragent",
        },
    )
    with urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


search = request(
    "/properties/search",
    {
        "un_locode": "GBLON",
        "transaction_type": "LETTINGS",
        "min_bedrooms": 2,
        "max_rent_pcm": 2500,
        "limit": 5,
    },
)

property_card = search["properties"][0]
print("Search result:", property_card["raia_id"], "-", property_card["headline"])

verification = request("/agents/org-gb-example/verify")
print("Agent verified:", verification["verified"], verification["status"])

consent = request(
    "/consent-tokens",
    {
        "data_subject_id": "ds_sample_001",
        "audience": "org-gb-example",
        "purpose": "viewing",
        "level": 1,
        "property_ref": property_card["raia_id"],
        "scopes": ["enquirer.name", "enquirer.email"],
        "expires_in_seconds": 3600,
    },
)
print("Consent token:", consent["token"])

viewing = request(
    "/enquiries/viewings",
    {
        "property_raia_id": property_card["raia_id"],
        "buyer_agent_raia_id": "org-gb-example",
        "proposed_slots": [
            {
                "start": "2026-07-10T10:00:00Z",
                "end": "2026-07-10T10:30:00Z",
            }
        ],
        "viewing_type": "IN_PERSON",
        "qualification": {
            "employment_status": "EMPLOYED",
            "income_band": "BAND_75_100K",
            "household_size": 2,
            "move_in_date": "2026-08-01",
        },
    },
)
print("Viewing enquiry:", viewing["enquiry_id"], viewing["state"])
