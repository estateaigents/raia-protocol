# RAIA Protocol Governance

## Maintainer

RAIA Protocol is maintained by EstateAigents Ltd (estateaigents.com).

## Direction of truth

**Protocol schema changes never drive platform DDL changes.**
**Platform DDL changes may drive protocol schema changes — at maintainer discretion and timing.**

The EstateAigents RAIA platform is the reference implementation. Schema changes require a corresponding platform implementation before merging to core.

## Decision making

| Change type | Process |
|---|---|
| Bug fixes, typos | Maintainer discretion |
| Jurisdictional module additions | Community PR, maintainer review |
| Core schema additions (non-breaking) | Issue + 2-week comment period |
| Breaking schema changes | Issue + 60-day deprecation + major version bump |
| Governance changes | Public discussion + maintainer decision |

## Versioning contract

- v0.x: draft, breaking changes expected, not for production
- v1.0: stable, semver from this point
- Maintainer has final merge authority on core schemas
- Jurisdictional modules are community-maintained

## Trademark

RAIA is a registered UK trademark (UK00003359082, Classes 36 + 42).

MIT license grants rights to the specification only — not the RAIA trademark.

Forks permitted under MIT. Forks may not use the RAIA name or claim registry membership.

## Registry

`estateaigents.org` operates the RAIA agent registry. Registry membership requires a valid agent card, verifiable compliance signals, and acceptance of registry terms.

Registry membership is separate from protocol implementation. Required only to receive verified enquiries.
