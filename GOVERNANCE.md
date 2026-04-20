# RAIA Protocol Governance

---

## Founding commitment

RAIA Protocol exists to serve the property industry as a whole — estate agents, tenants, buyers, developers, and regulators — not to create a new form of infrastructure capture.

Our founding commitment is this:

> **No single commercial actor, including EstateAigents Ltd, will hold a controlling position in the governance of RAIA Protocol or MoveHome.org. The protocol and the portal belong to the community they serve.**

This commitment is not aspirational language. It is the structural intent behind every decision we make about governance, trademark custody, and registry control. We make this commitment now — before the protocol has commercial value — because that is the only moment the commitment is credible.

---

## Governing entity — MoveHome Foundation CIC

RAIA Protocol and MoveHome.org are both governed by **MoveHome Foundation CIC** — a UK Community Interest Company incorporated for this purpose.

A CIC is a legal structure designed specifically for organisations that exist to benefit a community rather than generate profit for members or shareholders. The community interest test is enforced by the CIC Regulator — it cannot be waived, restructured away, or circumvented by a future board.

**Community interest statement:**

> "MoveHome Foundation CIC exists to develop and maintain free, open infrastructure for property transactions for the benefit of the public — including a free not-for-profit property listings portal accessible without charge, and an open AI agent protocol standard for property transactions held in trust for the property industry and not exclusively licensed to any commercial entity."

**Assets held by MoveHome Foundation CIC:**
- RAIA™ trademark (UK00003359082) — transferred from founding contributor
- `estateaigents.org` domain
- `movehome.org` domain
- Governance authority over the RAIA agent registry

**Asset lock:** All CIC assets are permanently locked for community benefit. On winding up, all assets transfer to another CIC or registered charity with equivalent objects — not to members, directors, or any commercial entity.

---

## Current governance structure (transitional)

MoveHome Foundation CIC is in formation as of April 2026. During the transitional period, EstateAigents Ltd acts as founding contributor and interim steward.

| Role | Current holder | Intended holder |
|---|---|---|
| Trademark (RAIA™) | Founding contributor (personal) | MoveHome Foundation CIC |
| GitHub organisation | estateaigents | estateaigents (unchanged) |
| estateaigents.org domain | Founding contributor | MoveHome Foundation CIC |
| movehome.org domain | Founding contributor | MoveHome Foundation CIC |
| Registry governance | EstateAigents Ltd | MoveHome Foundation CIC |
| Protocol maintainer | EstateAigents Ltd | MoveHome Foundation CIC (board + committees) |

All transfers complete within 90 days of CIC incorporation.

---

## Board structure

Five seats. One vote each. No casting vote. Simple majority for operational decisions. Supermajority (4/5) for constitutional changes.

| Seat | Represents |
|---|---|
| Estate agent representative | Licensed agents actively implementing RAIA |
| PropTech developer representative | Developers building on the protocol |
| Tenant / home mover representative | End users of property transactions |
| Independent technical maintainer | Protocol integrity and standards |
| Founding contributor seat | EstateAigents Ltd |

No single commercial entity holds more than one seat. The founding contributor seat lapses if EstateAigents Ltd ceases to make annual contributions to the CIC's objects.

---

## Two-committee structure

**Portal Committee — MoveHome.org**
Decisions about portal features, listing criteria, geographic expansion, tenant and buyer experience.
Membership: tenant/home mover representative (chair), estate agent representative, one independent.

**Protocol Committee — RAIA Protocol**
Decisions about schema evolution, registry admission criteria, jurisdictional modules, MCP server, SDK releases.
Membership: independent technical maintainer (chair), PropTech developer representative, founding contributor.

Committee decisions are recommendations to the board. The board ratifies. No committee can override the board.

---

## Protocol evolution process

| Change type | Process | Minimum period |
|---|---|---|
| Bug fixes, typos | Protocol Committee discretion | None |
| Jurisdictional module additions | Community PR + Protocol Committee review | 14 days |
| Core schema additions (non-breaking) | Public proposal + Protocol Committee + board ratification | 30 days |
| Breaking schema changes | Public proposal + Protocol Committee + board supermajority | 60 days + deprecation notice |
| Governance / constitutional changes | Public discussion + full board supermajority | 60 days |

All decisions are logged publicly in this repository.

---

## Registry governance

The RAIA agent registry (`estateaigents.org/registry`) lists verified agents whose agent cards have been validated against published criteria.

**Admission criteria (v0.1):**
- Valid agent card published at `/.well-known/raia-agent.json`
- Verifiable compliance signal for declared jurisdiction
- Acceptance of registry terms

Registry fees: None. Participation is always free.

---

## Trademark

**RAIA™** — UK registered word mark, UK00003359082, Classes 36 and 42. Registered 2018.

Current holder: founding contributor (personal)
Intended holder: MoveHome Foundation CIC (transfer in progress)

The trademark is held in trust for the property industry. It will not be exclusively licensed to any commercial entity, including EstateAigents Ltd.

---

## MoveHome.org — permanent commitments

- Listing on MoveHome.org is always free for agents, landlords, and private sellers
- No listing fees, lead generation charges, or subscription tiers — ever
- Agents implementing RAIA Protocol receive automatic free listings
- Consumer access is always free

These commitments are enshrined in the CIC's community interest statement and cannot be amended without a supermajority board vote and CIC Regulator notification.

---

## Relationship with EstateAigents Ltd

EstateAigents Ltd is the founding contributor and reference implementer. It operates the commercial B2B platform (`estateaigents.com`) on top of the open protocol.

- EstateAigents Ltd makes an annual contribution to the CIC
- EstateAigents Ltd holds one board seat as founding contributor
- EstateAigents Ltd receives free listings on MoveHome.org
- EstateAigents Ltd may use the RAIA™ name under a non-exclusive licence from the CIC
- EstateAigents Ltd has no veto rights over protocol or portal decisions

If EstateAigents Ltd ceases to exist, all rights revert to the CIC. The protocol continues without interruption.

---

## The precedents we follow

**W3C** — governs HTML, CSS, HTTP. Multi-stakeholder. No single company controls it.
**Linux Foundation** — governs Linux, A2A Protocol. Commercial companies contribute. None controls.
**Apache Software Foundation** — governed by merit and community contribution. No corporate capture.
**Ethereum Foundation** — founder retains influence. Protocol governance progressively decentralised.

RAIA follows this lineage. The property industry deserves infrastructure it owns collectively.

---

## Contact

Protocol governance: protocol@estateaigents.org
CIC status updates: published here as they occur
Board applications: open once CIC is constituted

---

*MoveHome Foundation CIC — in formation, April 2026*
*Founding contributor: EstateAigents Ltd*
*RAIA™ UK00003359082 · MIT licensed protocol specification*
*github.com/estateaigents/raia-protocol · estateaigents.org · movehome.org*
