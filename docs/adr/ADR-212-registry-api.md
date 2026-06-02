# ADR-212: Registry API Design

**Status:** Accepted — v0.2
**Date:** May 2026
**Deciders:** EstateAigents Ltd / MoveHome Foundation CIC

---

## Context

The RAIA spec references a registry at `estateaigents.org/registry` in multiple places (SPEC §3 Discover, §7 Trust, `schemas/agent.json`), but the registry API was never specified. This left implementers unable to:

- Query which agents are verified and active
- Discover agents covering a specific city (UN/LOCODE)
- Submit a new agent for registration
- Understand admission criteria programmatically

This ADR defines the registry API contract.

---

## Decision

The registry is a read-mostly HTTP API. Writes (admission) are human-reviewed in v0.2. Automated admission is planned for v1.0.

**Base URL:** `https://estateaigents.org/registry/v1`

---

### Endpoints

#### `GET /agents`

List verified agents, optionally filtered.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `jurisdiction` | string | ISO 3166-1 alpha-2. e.g. `GB`, `TH` |
| `un_locode` | string | UN/LOCODE city. e.g. `GBLON` |
| `market` | string | `RESIDENTIAL_LETTINGS`, `RESIDENTIAL_SALES`, etc. |
| `verified` | boolean | Default `true`. Set `false` to include pending agents. |
| `page` | integer | Pagination page. Default 1. |
| `per_page` | integer | Results per page. Default 20, max 100. |

**Response 200:**

```json
{
  "meta": {
    "total": 42,
    "page": 1,
    "per_page": 20
  },
  "agents": [
    {
      "raia_id": "org-gb-rlf",
      "name": "RentLondonFlat",
      "jurisdiction": "GB",
      "markets": ["RESIDENTIAL_LETTINGS", "RESIDENTIAL_SALES"],
      "coverage": ["GBLON"],
      "verified": true,
      "registry_admitted": "2026-04-01",
      "active_listings": 127,
      "mcp_endpoint": "https://app.estateaigents.com/mcp",
      "enquiry_endpoint": "https://app.estateaigents.com/api/raia/enquiry",
      "agent_card_url": "https://app.estateaigents.com/.well-known/raia-agent.json"
    }
  ]
}
```

---

#### `GET /agents/{raia_id}`

Get a single agent record by their stable RAIA org identifier.

**Response 200:** Full `AgentCard` object per `schemas/agent.json`.

**Response 404:** Agent not found.

**Response 200 (suspended/expired):**

```json
{
  "raia_id": "org-gb-example",
  "verified": false,
  "status": "SUSPENDED",
  "suspension_reason": "CMP membership lapsed",
  "suspended_at": "2026-05-01"
}
```

---

#### `GET /agents/{raia_id}/verify`

Lightweight compliance verification check. Returns current status without the full agent card. Used by `raia_verify_agent` MCP tool.

**Response 200:**

```json
{
  "raia_id": "org-gb-rlf",
  "name": "RentLondonFlat",
  "verified": true,
  "status": "ACTIVE",
  "compliance_signals": {
    "GB": {
      "bodies": [
        {
          "name": "ARLA Propertymark",
          "membership_id": "M12345",
          "verify_url": "https://arla.co.uk/find-a-member",
          "expiry": "2027-03-31"
        }
      ],
      "client_money_protection": true,
      "redress_scheme": "TPO"
    }
  },
  "checked_at": "2026-05-24T13:00:00Z"
}
```

Cached for up to 1 hour. Add `?fresh=true` to bypass cache and re-verify against source bodies.

---

#### `POST /agents`

Submit an agent for registration. Human-reviewed in v0.2.

**Request body:** Full `AgentCard` object per `schemas/agent.json`.

**Response 202 Accepted:**

```json
{
  "application_id": "app-2026-00142",
  "status": "PENDING_REVIEW",
  "message": "Your application is under review. Expected decision within 5 business days.",
  "contact": "registry@estateaigents.org"
}
```

**Admission criteria (v0.2):**

1. Agent holds a valid licence or membership with at least one accepted body in their jurisdiction's module (`/modules/{CC}/README.md`)
2. Redress scheme membership confirmed (mandatory in GB)
3. Client Money Protection confirmed if handling client funds (mandatory in GB)
4. MCP endpoint returns a valid response to a test `raia_search` call
5. `/.well-known/raia-agent.json` is publicly accessible and validates against `schemas/agent.json`

---

#### `GET /jurisdictions`

List all supported jurisdictions and their module status.

**Response 200:**

```json
{
  "jurisdictions": [
    { "code": "GB", "name": "United Kingdom", "status": "ACTIVE", "module_url": "/modules/GB/README.md" },
    { "code": "TH", "name": "Thailand",        "status": "ACTIVE", "module_url": "/modules/TH/README.md" },
    { "code": "SG", "name": "Singapore",       "status": "PLANNED" },
    { "code": "US", "name": "United States",   "status": "PLANNED" },
    { "code": "EU", "name": "European Union",  "status": "PLANNED" }
  ]
}
```

---

### Authentication

**Read endpoints** (`GET /agents`, `GET /agents/{id}`, `GET /agents/{id}/verify`, `GET /jurisdictions`): **no authentication required**. The registry is publicly readable.

**Write endpoints** (`POST /agents`): Bearer token required. Issued after manual review of initial application. Contact registry@estateaigents.org.

**Rate limits:** 60 requests per minute per IP for unauthenticated reads. 300 per minute for authenticated agents.

---

### Caching recommendations

| Endpoint | Recommended cache TTL | Notes |
|---|---|---|
| `GET /agents` | 5 minutes | Changes infrequently |
| `GET /agents/{id}` | 1 hour | Full card |
| `GET /agents/{id}/verify` | 1 hour (or use `?fresh=true`) | Used per-transaction |
| `GET /jurisdictions` | 24 hours | Very stable |

---

### Discovery via `/.well-known/raia-agent.json`

Agents MUST publish their card at `/.well-known/raia-agent.json` on their primary domain. The registry indexes these cards; it does not store canonical copies — it validates and proxies them.

This means: if an agent updates their `mcp_endpoint` or `enquiry_endpoint`, the registry reflects the change within 1 hour (next re-validation cycle) without any action from the agent.

---

## Consequences

- The `raia_verify_agent` MCP tool in the reference server calls `GET /agents/{raia_id}/verify`. Implementers should configure `REGISTRY_BASE_URL` environment variable (default: `https://estateaigents.org/registry/v1`).
- Agent cards served at `/.well-known/raia-agent.json` are the source of truth. The registry is an index, not a database.
- In v0.2, admission is manual and takes up to 5 business days. Automated cryptographic verification of compliance body membership is deferred to v1.0.
- The `StubRegistryAdapter` in the MCP reference server does not call the live registry. To connect to the live registry, implement `RaiaRegistryAdapter` with HTTP calls to this API.
