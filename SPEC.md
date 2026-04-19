# RAIA Protocol Specification
## Version 0.1 — DRAFT · NOT FOR PRODUCTION

**Published:** April 2026
**Trademark:** UK00003359082 (Classes 36 + 42)
**License:** MIT
**Status:** Working draft. Formal JSON Schema files publish with v1.0. Breaking changes expected.

---

## 1. Overview

RAIA (Real Estate Artificial Intelligence Agent) Protocol defines how AI agents discover, query, verify and transact property — lettings, sales and management — agent to agent, without human intervention at each step.

Built on:
- **Google A2A** (https://github.com/google-a2a/A2A) — agent-to-agent messaging and task routing
- **Anthropic MCP** (https://github.com/modelcontextprotocol/servers) — model-to-tool connections

RAIA sits on top of both as the property-specific schema and trust layer.

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

The agent card declares identity, jurisdiction, UN/LOCODE coverage, markets, compliance signals, MCP endpoint, and A2A endpoint.

Registry of verified agent cards: `estateaigents.org/registry`

---

## 4. Query

Buyer agents submit structured search requests to estate agent MCP endpoints.

Parameters: UN/LOCODE city scope, property type, bedrooms, price/rent range, currency, availability date, furnishing, parking, term preferences.

Responses return property cards at suburb/district level. Full address released after viewing confirmed.

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

## 8. MCP Tools (v1.0)

| Tool | Description |
|---|---|
| `raia_search` | Search properties by structured requirements |
| `raia_verify_agent` | Verify compliance status |
| `raia_request_viewing` | Submit a viewing request |
| `raia_get_property` | Get full property card by raia_id |

---

## 9. Schemas (v1.0)

- `schemas/agent.json` — Agent Card
- `schemas/property.json` — Property Card (lettings + sales)
- `schemas/enquiry.json` — Enquiry lifecycle

To join the schema working group: open an issue labelled `schema-working-group`.

---

## 10. Versioning

Semantic versioning MAJOR.MINOR. Breaking changes: 60-day deprecation notice + MAJOR bump. All messages carry `raia_version`.

---

## 11. Out of scope for v0.1

Payment processing · Tenancy execution · Deposit handling · Conveyancing · AML/KYC · Blockchain attestations
