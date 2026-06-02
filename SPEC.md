# RAIA Protocol Specification
## Version 0.2 - Implementer Release

**Published:** May 2026
**Trademark:** UK00003359082 (Classes 36 + 42)
**License:** MIT
**Status:** Implementer release. Core schemas, reference MCP server, client SDKs, and consent-token contract are published. Breaking changes remain possible before v1.0 certification.

---

## 1. Overview

RAIA (Real Estate Artificial Intelligence Agent) Protocol defines how AI agents discover, query, verify and transact property — lettings, sales and management — agent to agent, without human intervention at each step.

Built on:
- **Google A2A** (https://github.com/google-a2a/A2A) — agent-to-agent messaging and task routing
- **Anthropic MCP** (https://github.com/modelcontextprotocol/servers) — model-to-tool connections

RAIA sits on top of both as the property-specific schema and trust layer.

**Breaking changes from v0.1:** `property.json` now requires `transaction_type` (LETTINGS | SALES) and `status`. Field `letting_agent` renamed to `listing_agent`.

---

## 2. Core Concepts

### 2.1 Agent Types

| Type | Description |
|---|---|
| `estate_agent` | A licensed property professional or their AI representative |
| `buyer_agent` | A personal AI assistant acting on behalf of a buyer or tenant |

Every `estate_agent` must carry verifiable compliance signals for their jurisdiction. Accepted bodies are defined per-jurisdiction in `/modules/`.

### 2.2 Property Identifier

Stable `raia_id`. Format: `prop-{jurisdiction}-{org-slug}-{sequence}`.

### 2.3 Session

Stateful exchange between two agents. TTL: 24 hours (lettings), 30 days (sales).

### 2.4 End-Client Privacy

Buyer agents never expose end-client identity in protocol messages. Qualification signals only (employment status, income band, household size). PII held by buyer agent locally — shared directly between agents over TLS at identity verification stage only.

---

## 3. Discover

Every RAIA-compliant estate agent exposes a discovery card at:

```
GET /.well-known/raia-agent.json
```

The RAIA agent card declares identity, jurisdiction, UN/LOCODE coverage, markets, compliance signals, max permitted data level, MCP endpoint, consent endpoint, and A2A endpoint.

Registry of verified agent cards: `estateaigents.org/registry`

### 3.1 A2A agent card relationship

RAIA and Google A2A cards coexist.

| Card | Path | Purpose |
|---|---|---|
| RAIA Agent Card | `/.well-known/raia-agent.json` | Property/compliance metadata, RAIA registry status, MCP endpoint, consent endpoint, data-level credential summary |
| Google A2A Agent Card | `/.well-known/agent.json` | Native A2A discovery, skills, messaging, and task-routing metadata |

The RAIA card is not a replacement for the native A2A card. It links to the native card with `a2a_agent_card_url` and to the A2A service with `a2a_endpoint`. A2A messages carrying RAIA payloads MUST use the schemas in `/schemas/` unchanged.

---

## 4. Query

Buyer agents submit structured search requests to estate agent MCP endpoints via the `raia_search` MCP tool.

### Query parameters

| Parameter | Type | Applies to | Description |
|---|---|---|---|
| `un_locode` | string | both | UN/LOCODE city code. e.g. `GBLON`, `THBKK`. Required. |
| `transaction_type` | enum | both | `LETTINGS` or `SALES`. Required. |
| `property_type` | enum | both | `FLAT`, `APARTMENT`, `TERRACED`, `SEMI_DETACHED`, `DETACHED`, `BUNGALOW`, `STUDIO`, `MAISONETTE`, etc. Optional. |
| `min_bedrooms` | integer | both | Minimum number of bedrooms. |
| `max_bedrooms` | integer | both | Maximum number of bedrooms. |
| `min_rent_pcm` | number | lettings | Minimum asking rent per calendar month. |
| `max_rent_pcm` | number | lettings | Maximum asking rent per calendar month. |
| `min_price` | number | sales | Minimum asking price. |
| `max_price` | number | sales | Maximum asking price. |
| `currency` | string | both | ISO 4217 currency code. Defaults to jurisdiction default. |
| `available_from` | date | both | ISO 8601 date — property must be available on or before this date. |
| `furnishing` | enum | lettings | `FURNISHED`, `PART_FURNISHED`, `UNFURNISHED`, `FURNISHED_OR_UNFURNISHED`. |
| `parking` | enum array | both | One or more of: `OFF_STREET`, `GARAGE`, `ALLOCATED`, `RESIDENTS_PERMIT`. |
| `outside_space` | enum array | both | One or more of: `PRIVATE_GARDEN`, `BALCONY`, `TERRACE`, `ROOF_TERRACE`. |
| `tenure` | enum | sales | `FREEHOLD`, `LEASEHOLD`, `SHARE_OF_FREEHOLD`, `COMMONHOLD`. |
| `epc_min_rating` | enum | both | Minimum EPC letter rating. e.g. `C` returns C, B, and A. |
| `min_floor_area_sqm` | number | both | Minimum floor area in square metres. |
| `term_months` | integer | lettings | Preferred minimum tenancy length in months. |

Responses return property cards (`schemas/property.json`) at suburb/district level. Full address is only released when session state reaches COMMITTED.

---

## 5. Verify

Agents verify each other's compliance status before transacting.

Returns: compliance signals, status (active/suspended/expired), expiry date.

Protocol does not mandate specific regulatory bodies. Each jurisdictional module defines accepted bodies. See `/modules/`.

---

## 6. Transact

### Task State Machine

```
IDENTIFIED
  → DATA_GATHERING
    → AWAITING_HUMAN_ASSERTION  (mandatory human approval gate)
      → COMMITTED
        → SETTLED

  → WITHDRAWN  (any stage before COMMITTED)
  → EXPIRED    (session TTL exceeded)
```

`AWAITING_HUMAN_ASSERTION` is mandatory for:
- Offer acceptance (landlord or vendor must approve)
- Fee split finalisation (both agents must explicitly approve)
- AI confidence score below threshold

### Viewing request
Buyer agent proposes up to three slots. Estate agent confirms one.

### Offer
Structured offer with amount, term, start date, expiry window. Routes to human for approval. Counter-offers follow the same structure.

### Fee split
Negotiable between agents — no default percentage defined by the protocol. Both agents must explicitly approve. Finalised splits are immutable.

---

## 7. Trust

| Tier | Who | Requirement |
|---|---|---|
| Verified | Licensed estate agents | Compliance signal + registry admission |
| Unverified | Anyone | Can query. Cannot list. Cannot receive enquiries. |

No PII in search or property card responses. Jurisdiction scoping mandatory on every message.

---

## 8. MCP Tools (v0.2)

| Tool | Description |
|---|---|
| `raia_search` | Search properties by structured requirements (see §4 for query parameters) |
| `raia_verify_agent` | Verify an estate agent's compliance status against registry |
| `raia_request_viewing` | Submit a viewing request (initiates or advances the enquiry state machine) |
| `raia_get_property` | Get full property card by `raia_id` |

The reference MCP server is published in [mcp/](mcp/). It runs against stub data by default and switches to a live registry/private CRM adapter when `RAIA_REGISTRY_BASE_URL` is configured. Hosted reference endpoint: `mcp.estateaigents.com`.

---

## 9. Schemas (v0.2)

All three schemas are now published.

| Schema | Version | Description |
|---|---|---|
| `schemas/agent.json` | 0.1.0 | Agent Card — identity, jurisdiction, compliance signals, MCP/A2A endpoints |
| `schemas/property.json` | 0.2.0 | Property Card — lettings and sales, all queryable fields |
| `schemas/enquiry.json` | 0.2.0 | Enquiry - transaction lifecycle plus L0/L1/L2/L3 data-level envelopes |

See [schemas/README.md](schemas/README.md) for field-level summaries and breaking change notes. Example RAIA agent card: [.well-known/raia-agent.json](.well-known/raia-agent.json).

---

## 10. Consent Token Service

All L1+ exchanges require a scoped consent token issued by the data subject or an authorised buyer agent acting for the data subject. The issuing service is advertised by `consent_endpoint` on the RAIA agent card.

```text
POST /consent-tokens
Authorization: Bearer {agent_api_token}
Content-Type: application/json
```

Request:

```json
{
  "data_subject_id": "ds_123",
  "audience": "org-gb-listingagent",
  "purpose": "viewing",
  "level": 1,
  "property_ref": "prop-gb-rlf-000031",
  "scopes": ["enquirer.name", "enquirer.email"],
  "expires_in_seconds": 604800
}
```

Response:

```json
{
  "token": "ct_l1_...",
  "token_type": "Bearer",
  "level": 1,
  "scopes": ["enquirer.name", "enquirer.email"],
  "issued_at": "2026-05-24T00:00:00Z",
  "expires_at": "2026-05-31T00:00:00Z"
}
```

Token issuers MUST verify the presenting agent identity, bind `audience` to the receiving agent, reject scope escalation, and produce JWT claims matching [SECURITY.md](SECURITY.md). Standard errors: `400 INVALID_SCOPE`, `401 INVALID_AGENT_CREDENTIAL`, `403 LEVEL_NOT_PERMITTED`, `409 CONSENT_REVOKED`.

---

## 11. Versioning

Semantic versioning MAJOR.MINOR. Breaking changes: 60-day deprecation notice + MAJOR bump. All messages carry `raia_version`.

---

## 12. Out of scope for v0.2

Payment processing execution, conveyancing, biometric liveness, raw identity-document transmission, raw Right to Rent share-code transmission, raw bank statement transmission, blockchain attestations, automated compliance body verification.
