# RAIA Protocol Schemas

Published with v0.2 (May 2026). Field definitions in prose are in [SPEC.md](../SPEC.md).

## Published Schemas

| Schema | Version | Description |
|---|---|---|
| `property.json` | 0.2.0 | Public property card for lettings and sales |
| `agent.json` | 0.1.0 | Discovery card with compliance, endpoints, A2A interop, consent endpoint, and max data level |
| `enquiry.json` | 0.2.0 | Transaction lifecycle plus L0/L1/L2/L3 data-level envelopes |

## property.json

Public-facing listing card. Full address is never included; location is masked to district/postcode district. Required fields include `raia_id`, `agent_card_url`, `transaction_type`, `status`, `location`, `headline`, `listing_agent`, and `enquiry_endpoint`.

## agent.json

Discovery card exposed at `/.well-known/raia-agent.json`. Key fields:

- `raia_id` - stable org identifier
- `jurisdiction`, `additional_jurisdictions`, `markets`, `coverage`
- `compliance` - jurisdiction-keyed compliance signals
- `verified`, `registry_admitted`, `max_data_level`
- `agent_identity_credential` - registry-issued credential summary for L1+ exchanges
- `mcp_endpoint`, `enquiry_endpoint`, `consent_endpoint`
- `a2a_endpoint`, `a2a_agent_card_url` - native Google A2A interop

Example card: [../.well-known/raia-agent.json](../.well-known/raia-agent.json).

## enquiry.json

The enquiry schema now covers both the lifecycle workflow and SECURITY.md's data-level architecture.

Lifecycle fields:

- `state` - `IDENTIFIED` -> `DATA_GATHERING` -> `AWAITING_HUMAN_ASSERTION` -> `COMMITTED` -> `SETTLED`
- `qualification`, `viewing`, `offer`, `offer_history`, `fee_split`
- `session_ttl_hours`, `created_at`, `updated_at`, `expires_at`

Data-level fields:

- `l0` - public listing context; no personal data
- `l1` - enquiry identity/contact data with `ct_l1_...` consent
- `l2` - KYC assertions, GPG45/eIDAS/NIST assurance, Right to Rent `share_code_hash`, CDD sanctions/PEP screening
- `l3` - AML/proof-of-funds, `edd_required`, source-of-funds assertion hash, document content hashes, payment references

Every L1+ module carries `data_subject_id`, `data_residency`, and a scoped consent token reference. Raw identity documents, bank details, Right to Rent share codes, and raw source-of-funds evidence are out of protocol.

## Compatibility Notes

Breaking changes from `enquiry.json` v0.1.0:

- Added `l0`, `l1`, `l2`, and `l3` modules.
- Added `transaction_id` and `property_ref` aliases used by consent and AML assertions.
- Added Agent Identity Credential summaries on agent references.
- Added consent token, data residency, erasure, KYC, CDD, AML, document reference, and payment reference structures.

## Working Group

Open an issue labelled `schema-working-group` at github.com/estateaigents/raia-protocol or contact protocol@estateaigents.org.
