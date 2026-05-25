# RAIA Protocol
### Real Estate Artificial Intelligence Agent Protocol

> The open standard for AI agents to discover, verify, enquire about, and transact property.

[![Status](https://img.shields.io/badge/status-v0.2%20implementer%20release-blue)](https://github.com/estateaigents/raia-protocol)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Trademark](https://img.shields.io/badge/trademark-UK00003359082-green)](https://trademarks.ipo.gov.uk/)

## What RAIA Defines

| Capability | What it defines |
|---|---|
| Discover | How AI agents find verified estate agents and their live portfolios |
| Query | Structured property search by location, type, price, dates, tenure, and local signals |
| Verify | Agent identity, licence status, jurisdiction compliance, and max permitted data level |
| Transact | Viewing requests, offers, session state, human approval gates, and fee splits |
| Trust | Participation rules, consent tokens, agent credentials, KYC/AML assertion envelopes |

RAIA is a vertical property schema and trust layer on top of existing transport standards:

- Google A2A for agent-to-agent communication
- Anthropic MCP for model-to-tool connections
- Direct HTTPS for registry, consent-token, and application endpoints

## Current Status

| Version | Status | Date | Notes |
|---|---|---|---|
| v0.1 | Historical draft | April 2026 | Superseded |
| v0.2 | Implementer release | May 2026 | Schemas, MCP server, SDKs, consent-token contract, and initial jurisdiction modules published |
| v1.0 | Certification target | Planned | Compatibility freeze, conformance tests, registry certification process |

The formal JSON Schemas are published now in [schemas/](schemas/). The reference MCP server is published now in [mcp/](mcp/). Client SDKs are published now in [sdk/](sdk/).

Production implementations should use v0.2 only with registry-issued credentials and jurisdiction-specific legal review. L1+ personal data requires consent tokens and Agent Identity Credentials as specified in [SECURITY.md](SECURITY.md).

## Published Schemas

| Schema | Version | Description |
|---|---|---|
| [agent.json](schemas/agent.json) | 0.1.0 | RAIA discovery card, compliance signals, MCP/A2A endpoints, consent endpoint, max data level |
| [property.json](schemas/property.json) | 0.2.0 | Public property card for lettings and sales |
| [enquiry.json](schemas/enquiry.json) | 0.2.0 | Transaction lifecycle plus L0/L1/L2/L3 data-level envelopes |

Providers expose a RAIA card at:

```text
GET /.well-known/raia-agent.json
```

A copy-pasteable example is available at [.well-known/raia-agent.json](.well-known/raia-agent.json).

## Reference Implementations

- [mcp/](mcp/) - MCP server exposing `raia_search`, `raia_get_property`, `raia_verify_agent`, and `raia_request_viewing`
- [sdk/typescript/](sdk/typescript/) - TypeScript HTTP client SDK
- [sdk/python/](sdk/python/) - Python HTTP client SDK

The MCP server defaults to stub data for local testing. Set `RAIA_REGISTRY_BASE_URL` and credentials from [mcp/.env.example](mcp/.env.example) to connect it to a live registry or CRM adapter.

## Jurisdictions

| Code | Jurisdiction | Module status |
|---|---|---|
| [GB](modules/GB/README.md) | United Kingdom | Draft module |
| [TH](modules/TH/README.md) | Thailand | Draft module |
| [SG](modules/SG/README.md) | Singapore | Initial module |
| [US](modules/US/README.md) | United States | Initial module |
| [EU](modules/EU/README.md) | European Union | Initial module |

Jurisdictional modules define accepted compliance bodies, local lifecycle mappings, property signals, and data-handling constraints.

## A2A Interop

RAIA does not replace Google A2A agent cards. A provider may publish both:

- `/.well-known/raia-agent.json` for RAIA-specific property, compliance, consent, MCP, and data-level metadata
- `/.well-known/agent.json` for the native Google A2A agent card

The RAIA card links to the native A2A card with `a2a_agent_card_url` and to the A2A service with `a2a_endpoint`.

## Consent Tokens

L1+ exchanges require scoped, non-transferable, time-bounded consent tokens:

```text
POST /consent-tokens
```

See [SPEC.md](SPEC.md) and [SECURITY.md](SECURITY.md) for issuer rules, JWT claims, scopes, expiry, and error semantics.

## Get Started

1. Read [SPEC.md](SPEC.md).
2. Validate your cards against [schemas/](schemas/).
3. Run the MCP reference server in [mcp/](mcp/).
4. Use the TypeScript or Python SDK in [sdk/](sdk/) for buyer-agent integrations.
5. Follow the jurisdiction module for each market you operate in.

## Contribute

We welcome schema review, SDK improvements, MCP adapter work, conformance tests, and jurisdiction modules.

1. Fork [estateaigents/raia-protocol](https://github.com/estateaigents/raia-protocol)
2. Branch using `<type>/<scope>-<description>` (e.g. `feat/schemas-property-v0-2`)
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/)
4. Open a PR to `master`

Full workflow and naming rules: [CONTRIBUTING.md](CONTRIBUTING.md). Governance: [GOVERNANCE.md](GOVERNANCE.md).

## Trademark

RAIA is a registered UK word mark (UK00003359082, Classes 36 + 42, registered 2018).

The protocol specification is MIT licensed. The RAIA name may not be used to claim registry membership or official endorsement without written permission from EstateAigents Ltd.

## License

MIT - see [LICENSE](LICENSE).

Protocol specification (c) 2026 EstateAigents Ltd.
