# RAIA Protocol

> **The open standard for AI agents to transact property.**

[![Status](https://img.shields.io/badge/status-draft-orange)](https://github.com/estateaigents/raia-protocol)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Trademark](https://img.shields.io/badge/trademark-UK00003359082-green)](https://trademarks.ipo.gov.uk/)

---

## The problem

Portals were built for humans.

In 2026, AI assistants are doing the searching. Personal AI agents are reading property listings, qualifying requirements, and making enquiries on behalf of buyers and tenants. Estate agents are deploying AI to handle inbound enquiries, qualify leads, and manage viewings.

But there is no standard for how these agents talk to each other.

Every AI-to-AI property interaction today is either a web scrape (fragile, unverified) or a proprietary integration (locked, expensive, non-portable). There is no open, structured, trusted way for an AI assistant to say:

> "My client needs a 2-bed in Battersea, £2,500/month, available June 2026. Who has verified stock?"

And get back a machine-readable, verified response from a licensed estate agent's AI.

**RAIA Protocol is that standard.**

---

## What RAIA defines

Five capabilities. Each is independently implementable.

| Capability | What it defines |
|---|---|
| **Discover** | How AI agents find verified estate agents and their live portfolios |
| **Query** | Structured property search — location, type, price, dates, tenure |
| **Verify** | Agent identity, licence status, jurisdiction compliance signals |
| **Transact** | Viewing requests, offer management, fee splits agent-to-agent |
| **Trust** | Participation rules — only licensed, verified agents list on the protocol |

---

## Built on open infrastructure

RAIA is not a new transport layer. It is a **vertical implementation** of two existing open standards:

- **[Google A2A Protocol](https://github.com/google-a2a/A2A)** — agent-to-agent communication (discovery, messaging, task routing)
- **[Anthropic MCP](https://github.com/modelcontextprotocol/servers)** — model-to-tool connections (structured data access, action execution)

```
Google A2A          →  General: any agent talks to any agent
  └── RAIA Protocol →  Vertical: estate agents + personal AI assistants
        └── MCP     →  Transport: how agents connect to RAIA tools
```

If you have already implemented A2A or MCP, RAIA adds a property schema layer on top. No new infrastructure required.

---

## Who this is for

**Estate agents** deploying AI to handle enquiries, manage viewings, and split fees with other agents.

**PropTech developers** building AI-native property products who need a standard data model.

**Personal AI assistant developers** (ChatGPT plugins, Claude tools, Gemini extensions) who need a verified property data source.

**Portals and CRMs** who want to expose their listings to AI-agent traffic without bespoke integrations.

---

## Jurisdictions

| Code | Country | Module status |
|---|---|---|
| GB | United Kingdom | Draft |
| TH | Thailand | Draft |
| SG | Singapore | Planned |
| US | United States | Planned |
| EU | European Union | Planned |

Jurisdictional modules are community-contributed. See `/modules/`.

---

## Status

| Version | Status | Date |
|---|---|---|
| v0.1 | **DRAFT — NOT FOR PRODUCTION** | April 2026 |
| v1.0 | Planned — JSON schemas + MCP server | Q3 2026 |

Formal JSON Schema files will be published with v1.0.
Early implementers: open an issue or email protocol@estateaigents.org

---

## Reference implementation

[EstateAigents.com](https://estateaigents.com) is the reference marketplace built on RAIA Protocol — used by agents managing 5,000+ properties across GB and TH.

---

## Get started

Read the spec: [SPEC.md](SPEC.md)

Full documentation: [estateaigents.org](https://estateaigents.org)

---

## Contribute

- **Issues** — challenge the spec, flag jurisdiction gaps, propose capabilities
- **PRs** — jurisdictional module contributions, documentation improvements
- **Schema review** — join the v1.0 working group via issue label `schema-working-group`

See [CONTRIBUTING.md](CONTRIBUTING.md) and [GOVERNANCE.md](GOVERNANCE.md).

---

## Trademark

RAIA is a registered UK trademark (UK00003359082, Classes 36 + 42). MIT licensed. The RAIA name may not be used to imply endorsement without permission.

---

## License

MIT — see [LICENSE](LICENSE)

Protocol specification © 2026 EstateAigents Ltd.
