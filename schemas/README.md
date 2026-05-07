# RAIA Protocol Schemas

Formal JSON Schema files. JSON Schema Draft 2020-12.

Field definitions in prose: [SPEC.md](../SPEC.md). v0.2 prose summary: [docs/listing-spec-v0.2.md](../docs/listing-spec-v0.2.md).

## Schemas

| Schema | Version | Description |
|---|---|---|
| [agent-card.json](agent-card.json) | 0.2 | Discovery document at `/.well-known/raia-agent.json` |
| [listing.json](listing.json) | 0.2 | Property listing — federated, snapshot, or aggregated |
| [enquiry.json](enquiry.json) | 0.2 | POST body for `endpoints.enquire` |
| [property.json](property.json) | 0.1 | Predecessor of `listing.json`. Retained for masked public-card use. |

Realistic fixtures conforming to each schema live in [`/examples`](../examples/).

## Versioning

Semantic MAJOR.MINOR. Breaking changes bump MAJOR with a 60-day deprecation notice. The active wire-format version is announced via the agent card's `schema_version` field. v1.0 is planned for Q3 2026.

## Join the working group

Open an issue labelled `schema-working-group` or contact protocol@estateaigents.org.
