# RAIA Protocol — Listing, Agent Card and Enquiry Schemas v0.2

**Status:** Draft
**Published:** May 2026
**Schema files:** `schemas/listing.json`, `schemas/agent-card.json`, `schemas/enquiry.json`
**Examples:** `examples/agent-card.json`, `examples/listing.json`, `examples/enquiry.json`

This document is a prose summary of the three schema files. The schema files are normative; this document is informational.

---

## What's new in v0.2

Six material changes since v0.1.

### 1. Schema versioning is now explicit

Every agent card declares the protocol version it implements via the required `schema_version` field. Aggregators and consumer agents read this once at discovery time and apply the matching schema to subsequent listings, enquiries and verification calls.

Versioning follows MAJOR.MINOR. Breaking changes bump MAJOR. v0.2 is backwards-compatible at the wire level for listings that do not depend on dropped or renamed v0.1 fields — see migration notes below.

### 2. `jurisdiction_extensions` block

Per RAIA's jurisdiction-neutral core principle, the listing schema only carries fields that are universal to every market. Country-specific compliance data lives under `jurisdiction_extensions.{cc}`.

v0.2 ships two sub-schemas:

- `jurisdiction_extensions.gb` — `tenure`, `lease_years_remaining`, `service_charge_pa`, `ground_rent_pa`, `council_tax_band`, `epc_rating`, `epc_register_url`, `hmo_licence_number`
- `jurisdiction_extensions.th` — `ownership_type`, `foreign_ownership_eligible`, `chanote_type`, `bts_station`, `bts_distance_m`, `mrt_station`, `mrt_distance_m`

Implementations populate only the sub-object that matches the listing's `un_locode` country.

Singapore, US and EU sub-schemas are planned for v0.3, contributable via the jurisdiction module process described in `CONTRIBUTING.md`.

### 3. `service_type` enum updated

| v0.1 | v0.2 |
|---|---|
| `longlet` | `long_term` |
| `shortlet` | `short_term` |
| `sale` | `sale` (unchanged) |

Rationale: the protocol is global. `longlet`/`shortlet` are British letting-agent jargon and read poorly to consumers in markets where the equivalent terms are different (US: long-term lease vs. short-term rental; TH: long stay vs. short stay).

### 4. `features` is now `TEXT[]` instead of a boolean object

v0.1 modelled features as `{ "balcony": true, "porter": true, "permit_parking": true }`. v0.2 stores them as `["balcony", "porter", "permit_parking"]`.

Rationale: the boolean-object form forces the schema to enumerate every feature anyone might ever want to express, which created a permanent list-management problem. The TEXT[] form treats features as community-curated tags. The registry maintains a recommended-tag list at `estateaigents.org/registry/feature-tags` (publishing with v1.0).

### 5. Standardised `provenance` block

Every listing carries an optional `provenance` object set by the receiving aggregator on ingest:

```json
{
  "provenance": {
    "agent_id": "org-gb-rlf",
    "received_at": "2026-05-07T09:14:02Z",
    "signature_hash": "..."
  }
}
```

`signature_hash` is reserved for v1.0 — for v0.2, treat it as an opaque string. Once the public-key infrastructure described in `agent-card.json` `provenance_signing` lands in v1.0, aggregators will be able to verify that a federated listing was published by the legitimate operator of the announced domain.

### 6. Capabilities discovery on the agent card

The `capabilities` array on the agent card lets the agency declare which protocol verbs it supports. Consumer agents now know — from a single fetch of `/.well-known/raia-agent.json` — whether the agent can take an enquiry, issue a delegation token, accept an offer, etc.

---

## Schema overview

### `schemas/listing.json`

The canonical shape of a property listing in the RAIA Protocol. Used by:

- Federated agencies hosting their own listings.
- The RAIA reference implementation's `snapshot_listing` JSONB column.
- The `raia-public.tbl_listings` mirror table.
- Consumers like MoveHome.org.

**Required fields:** `raia_id`, `agent_id`, `agent_card_url`, `un_locode`, `service_type`, `synced_at`.

**Strongly encouraged:** `headline`, `marketing_description`, `bedrooms`, `bathrooms`, `media`, `enquiry_endpoint`, and the matching `jurisdiction_extensions` block.

**Address masking:** anonymous (pre-COMMITTED) responses MUST omit `street_name`, `building_number`, `postcode_full`, and the precise `location` point. Use a district centroid for `location` and the outward postcode for `postcode_district`.

### `schemas/agent-card.json`

The discovery document published at `/.well-known/raia-agent.json`. Required at every RAIA-compliant agency's primary domain.

**Required fields:** `schema_version`, `agent_id`, `name`, `endpoints.search`, `endpoints.property`.

`endpoints.property` is a URL template containing the literal substring `{raia_id}`, which the consumer substitutes before fetching. This follows RFC 6570 Level 1.

### `schemas/enquiry.json`

The body of an enquiry POSTed to `endpoints.enquire`. This is the first message in the protocol that contains end-client PII.

**Required fields:** `enquiry_id` (UUID, sender-generated for idempotency), `raia_id`, `enquirer.name`, `enquirer.email`, `message`, `submitted_at`.

A successful POST creates a session in state `IDENTIFIED` per SPEC.md section 6.

---

## Migration from v0.1

v0.1 was prose-only — formal schema files arrived in v0.2. If your implementation tracked the v0.1 prose closely, the changes you need to make are:

1. **Rename `service_type` values:** `longlet` -> `long_term`, `shortlet` -> `short_term`. `sale` is unchanged.
2. **Convert `features` to TEXT[]:** flatten `{balcony: true}` to `["balcony"]`. Boolean-false values disappear (a feature absent from the array means absent).
3. **Move EPC rating into `jurisdiction_extensions.gb.epc_rating`.** Same for HMO licence, council tax band, tenure, lease years, service charge, ground rent.
4. **Move BTS/MRT distances and chanote type into `jurisdiction_extensions.th`.**
5. **Add `schema_version: "0.2"` to your agent card.** Add `capabilities` reflecting your actual endpoints.
6. **Generate `enquiry_id` UUIDs on the sender side** if your v0.1 enquiry pipeline relied on receiver-side IDs.

Receiving aggregators that need to accept v0.1 traffic during the transition can dual-decode at the API edge. The reference implementation publishes a translation shim at `src/lib/raia-protocol/v01-shim.ts` (RAIA reference repo).

---

## Validating a payload

Any JSON Schema Draft 2020-12 validator works. Two starting points:

```bash
# Node + ajv
npm install ajv ajv-formats
node -e "const Ajv = require('ajv/dist/2020'); const addFormats = require('ajv-formats'); const ajv = new Ajv({allErrors: true}); addFormats(ajv); const ok = ajv.validate(require('./schemas/listing.json'), require('./examples/listing.json')); console.log(ok ? 'OK' : ajv.errors);"
```

```bash
# Python + jsonschema
pip install jsonschema
python -c "import json, jsonschema; jsonschema.Draft202012Validator(json.load(open('schemas/listing.json'))).validate(json.load(open('examples/listing.json'))); print('OK')"
```

The fixtures in `examples/` are the canonical conformance set — they validate against the schemas in this directory and should be updated alongside any schema change.

---

## Roadmap to v1.0

| Item | Status |
|---|---|
| Provenance signing — public-key URL on agent card, signature_hash on listings | Reserved fields in v0.2; verification logic lands in v1.0 |
| Singapore, US, EU jurisdiction extensions | v0.3 |
| Wildcard jurisdiction coverage (e.g. `GB***`) | v1.0 |
| MCP tool definitions: `raia_search`, `raia_verify_agent`, `raia_request_viewing`, `raia_get_property` | v1.0 — see SPEC.md section 8 |
| Offer + counter-offer schemas | v1.0 |
| Fee-split schema | v1.0 |
| Registry admission criteria — formalised | v1.0 |

Working group: open an issue with label `schema-working-group` at `github.com/estateaigents/raia-protocol`.

---

## Trademark and licence

Schema files are MIT licensed.
RAIA™ is a registered UK trademark (UK00003359082, Classes 36 + 42).
Implementations may reference RAIA but may not use the RAIA™ mark to claim registry membership without admission via the process described in `GOVERNANCE.md`.
