# ADR-211: Property Card Authentication and Role-Gated Tiers

**Status:** Accepted — v0.2
**Date:** May 2026
**Deciders:** EstateAigents Ltd / MoveHome Foundation CIC

---

## Context

`schemas/property.json` includes an `x-raia-notes.authentication` field that references "Bearer delegation tokens (scope: `snapshot:tenant` or `snapshot:landlord`)" and a role-gated narrative tier system served at `/api/raia/property/{raia_id}`. This ADR documents the auth design that was previously undescribed, which blocked any implementer trying to build role-differentiated property views.

The public `PropertyCard` schema (served to anonymous MCP calls) deliberately masks location to district level and omits the full address. A second, role-gated tier exists for verified participants in an active enquiry session — tenants and landlords need access to different information at different stages.

---

## Decision

### Three access tiers

| Tier | Who | How authenticated | What they get |
|---|---|---|---|
| **Public** | Any MCP client / anonymous | No auth | District-level `PropertyCard` per schema. No address. |
| **Tenant** | Buyer/tenant agent in an active session | `Bearer {token}` with scope `snapshot:tenant` | District + postcode + property narrative. Still no full address. |
| **Landlord/Agent** | Estate agent or landlord | `Bearer {token}` with scope `snapshot:landlord` | Full address + private landlord notes. Only after `COMMITTED` state. |

### Token issuance — delegation model

Delegation tokens are short-lived JWT Bearer tokens issued by the estate agent's system (the `enquiry_endpoint` issuer) when a session advances to a state that warrants elevated access.

```
POST {enquiry_endpoint}
Authorization: Bearer {agent-to-agent credential}
Body: { "enquiry_id": "...", "state_assertion": "DATA_GATHERING" }

Response 200:
{
  "delegation_token": "eyJ...",
  "scope": "snapshot:tenant",
  "property_raia_id": "prop-gb-rlf-000031",
  "expires_at": "2026-07-10T11:00:00Z"
}
```

The delegation token is then passed to the property endpoint:

```
GET /api/raia/property/{raia_id}
Authorization: Bearer {delegation_token}
```

### Token constraints

| Constraint | Value |
|---|---|
| Algorithm | RS256 (asymmetric — estate agent holds private key) |
| Claims | `sub` (enquiry_id), `scope`, `property_raia_id`, `exp`, `iss` (estate agent raia_id) |
| TTL | 1 hour (tenant scope), 15 minutes (landlord scope) |
| Revocable | Yes — estate agent can revoke by enquiry_id |
| Rotation | New token issued on each state transition |

### State → scope mapping

| Enquiry state | Scope available | What is unlocked |
|---|---|---|
| `IDENTIFIED` | None | Public card only |
| `DATA_GATHERING` | `snapshot:tenant` | Postcode district + narrative description |
| `AWAITING_HUMAN_ASSERTION` | `snapshot:tenant` | Same as DATA_GATHERING |
| `COMMITTED` | `snapshot:tenant` + `snapshot:landlord` | Full address released to both parties |
| `SETTLED` | `snapshot:landlord` | Read-only archive access |

### Agent-to-agent credential (server-to-server)

Before a delegation token can be issued, the buyer agent must authenticate with the estate agent's system. Two options:

1. **Mutual TLS (mTLS)** — preferred for production. Each RAIA-registered agent has a TLS client certificate issued when they join the registry.
2. **API key** — acceptable for v0.2. Registry-issued key per org, scoped to `raia:enquiry`.

The `agent_card_url` (`/.well-known/raia-agent.json`) should include a `public_key` field (JWK format) for verifying JWT assertions signed by that agent. This field is defined in `agent.json` but deferred to v1.0.

---

## API endpoint spec

```
GET /api/raia/property/{raia_id}
Authorization: Bearer {delegation_token}

200 OK — returns PropertyCard with tier-appropriate fields populated
401 Unauthorized — missing or invalid token
403 Forbidden — token valid but scope insufficient for requested tier
404 Not Found — property not found
410 Gone — enquiry session expired or withdrawn
```

The response shape is the same `PropertyCard` schema with additional fields unlocked based on scope:

```jsonc
// snapshot:tenant adds:
{
  "location": {
    "district": "Hammersmith",
    "postcode_district": "W6",  // already public
    "postcode": "W6 9TA"        // unlocked at DATA_GATHERING
  }
}

// snapshot:landlord adds (COMMITTED only):
{
  "location": {
    "full_address": "42 King Street, London W6 9TA"  // unlocked at COMMITTED
  },
  "landlord_notes": "Keys with concierge. No shoes inside."
}
```

---

## Consequences

- Estate agent systems must implement token issuance at their `enquiry_endpoint`. This is not optional for v1.0.
- The MCP server reference implementation (`mcp/src/`) does not yet issue delegation tokens — it returns the public tier only. Token issuance is the responsibility of the estate agent's `enquiry_endpoint` implementation.
- A `public_key` field will be added to `schemas/agent.json` in v1.0 to enable verifiable JWT assertions between agents without a central authority.
- Anonymous MCP queries always receive the public tier — no auth flow is required for `raia_search` or `raia_get_property`.
