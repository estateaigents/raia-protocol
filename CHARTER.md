# The RAIA Charter
## An Open Standard for Property AI

*Published April 2026 · estateaigents.org · RAIA™ Protocol*
*Version 1.0 — Founding document*

---

## Preamble

Property is shelter. Shelter is not a commodity. And yet the infrastructure through which people find homes — portals, platforms, databases — has been built to extract value from the transaction rather than to serve the people in it.

This Charter establishes the principles, the governance, and the invitation behind RAIA Protocol — the open standard for AI agents to transact property — and MoveHome.org, its public expression. Together they form a single argument: that the infrastructure of property transactions should be a commons, not a toll road.

We publish this now — before the protocol has commercial value — because that is the only moment such a commitment is credible.

---

## I. The problem

### The portal toll — a global phenomenon

In every country where residential property portals operate, the same dynamic plays out.

Portals aggregate listings from estate agents, landlords and developers. They charge agents — and increasingly, consumers — for access to that aggregated inventory. The fees compound across every branch, every market, every month.

Based on the publicly reported annual revenues of the world's largest listed property portal companies, we can credibly reason that **agents worldwide pay in excess of $10 billion annually to portal platforms** for the right to advertise properties they themselves own or manage.

That figure does not include the additional costs agents absorb from CRM systems, listing tools, compliance platforms, and social media management — all of which have grown up around the portal ecosystem and bill accordingly.

In 2025–26, a £1.5 billion class action lawsuit was filed at the UK Competition Appeal Tribunal against the UK's largest residential property portal — a matter of public record and the clearest legal articulation yet of what agents and consumers have experienced for years: that portal pricing has become systematically extractive.

The UK lawsuit is not an isolated event. It is the visible tip of a structural problem that exists in every market where portals have achieved dominant positions — Australia, the United States, Germany, France, Spain, the UAE, Southeast Asia, and beyond.

For the full evidence base and citations, see: [docs/portal-market-research.md](docs/portal-market-research.md)

### How the cost reaches tenants and buyers

The portal fee does not stay with the agent. It cannot. It flows through the transaction:

```
Portal charges agent → agent absorbs into operating costs
        ↓
Agent raises management fees to landlord
        ↓
Landlord factors cost into asking rent or sale price
        ↓
Tenant pays higher rent. Buyer pays more.
```

This is not a guarantee or a precise calculation. Markets are complex. But the mechanism is clear: **a cost that enters the transaction at the agent level does not disappear — it propagates upward through the price chain.**

Remove that cost from the equation and the saving becomes available — to the agent, to the landlord, and ultimately to the tenant or buyer. The market determines what happens to that saving. The protocol removes the cost. What flows from that is a market decision, not a protocol promise.

### The AI inflection

AI agents are now capable of finding a home, qualifying requirements, checking availability, requesting a viewing, and managing a transaction — without human intervention at each step. This is already happening. It is happening via web scraping, via fragile proprietary integrations, via informal workarounds.

The absence of a protocol is not preventing AI property transactions. It is making them slow, unverified, legally exposed — and creating the conditions for a new form of capture: not by portals, but by the AI platforms that will process property transactions at scale if no open standard exists.

**If the infrastructure layer of property AI is controlled by any single commercial actor, the toll booth moves but does not disappear.**

### The capture risk

The history of the internet is a history of open infrastructure being enclosed.

Email began as an open protocol — and was enclosed into surveillance advertising platforms. The web began as an open standard — and search was enclosed into a duopoly. Social connection began as an open idea — and was enclosed into data extraction machines.

In every case, the enclosure happened at the infrastructure layer — the protocol, the index, the identity system — before the community recognised what was being lost.

Property AI is at that moment now. The protocol layer is being built. The question is whether it is built as a commons or as the next enclosure.

---

## II. The response — two layers

### RAIA Protocol — the machine layer

RAIA (Real Estate Artificial Intelligence Agent Protocol) is the open standard for AI agents to discover, verify, and transact property — lettings, sales, and management — directly between agents, without a portal in the middle.

Built on Google's A2A Protocol (donated to the Linux Foundation) and Anthropic's Model Context Protocol (MCP), RAIA adds the property-specific vocabulary and trust layer that general AI infrastructure does not provide.

```
Google A2A    →  How agents find and talk to each other
RAIA Protocol →  What property agents say — property vocabulary and trust
Anthropic MCP →  How agents connect to property data tools
```

Any AI assistant that speaks MCP can query any RAIA-compliant agent's portfolio. Any AI agent that speaks A2A can transact with any other RAIA participant. No portal required. No proprietary integration required. No monthly fee to a listing aggregator required.

The protocol is MIT licensed. Anyone can implement it. The schemas, the agent card format, the enquiry lifecycle — all open, all free.

### MoveHome.org — the human layer

RAIA Protocol enables AI-to-AI property transactions. MoveHome.org is the human face of the same infrastructure.

MoveHome.org is a free, not-for-profit property listings portal — for tenants looking for homes, buyers searching for properties, landlords marketing their portfolio, and agents publishing their listings. No listing fees. No lead generation charges. No subscription tiers.

Agents who implement RAIA Protocol receive automatic free listings on MoveHome.org. The portal is funded by the community it serves — not by charging agents for access to their own market.

Together, RAIA Protocol and MoveHome.org form a complete response to the portal problem:
- **RAIA** handles AI-to-AI transactions — the future of how property is found
- **MoveHome** handles human search — the present, made free

---

## III. The principles

### 1. The protocol is infrastructure, not a product

RAIA Protocol is not a marketplace. It is not a portal. It is infrastructure — like HTTP, like SMTP, like Ethernet — that enables other things to be built on top of it. Infrastructure that works does not charge for its existence.

### 2. No single actor controls it

No company, no individual, no government body holds a controlling position in RAIA Protocol governance. This is not a policy preference. It is a structural requirement encoded in the governance of MoveHome Foundation CIC, the entity that holds the protocol in trust.

### 3. The community it serves governs it

Estate agents, PropTech developers, tenants, buyers, and regulators all have a stake in how property transactions work. All have a seat in how this protocol evolves. Governance is multi-stakeholder by design.

### 4. Compliance is local, mechanics are global

Property law is hyperlocal. The protocol's mechanics — how agents find each other, query data, verify identity, and execute transactions — are globally uniform. The compliance layer is locally defined and community-contributed through jurisdictional modules. No jurisdiction is subordinate to any other.

### 5. Transparency is non-negotiable

Every governance decision is made in public and logged permanently. No private sessions. No commercial side-agreements that affect the protocol's behaviour.

### 6. The end client is always protected

AI agents transacting property on behalf of buyers and tenants never expose end-client identity in protocol messages. Qualification signals are transmitted. Personal data is not. The protocol enforces data minimisation at the schema level.

---

## IV. The historical context

Every protocol that became infrastructure followed the same path: published openly, adopted freely, governed collectively, and eventually so embedded that no single actor could capture it.

**SMTP (1982)** — Jon Postel published RFC 821. No company owns email. Every company uses it.

**HTTP (1991)** — Tim Berners-Lee published the web proposal at CERN. The W3C — a multi-stakeholder body — governs its evolution. No company owns the web.

**TCP/IP (1974)** — Cerf and Kahn published the protocol. It became the internet.

**Bitcoin (2008)** — Published without institutional backing. No company owns it. The protocol survives because there is no single point of capture.

**Linux (1991)** — Torvalds started it. The Linux Foundation governs it. Hundreds of companies contribute. None controls it.

In each case, the founding decision — to publish openly, to govern collectively, to refuse enclosure — determined everything that followed.

### Why previous property protocol attempts failed

Four serious attempts have been made to create open property data standards. All failed for the same structural reasons: designed for one market's legal model, built for portal syndication not agent-to-agent transactions, and governed by bodies with conflicting commercial interests that converged on the lowest common denominator — the status quo.

RAIA is not governed by a working group of incumbents. It is governed by a community interest company whose legal structure prevents any single commercial actor from capturing it.

### Why now

Two things changed between 2024 and 2026 that make this possible for the first time.

**The transport layer now exists.** Google's A2A Protocol and Anthropic's MCP provide the infrastructure for AI agents to find each other and communicate. RAIA only needs to define what property agents say to each other on top of existing open infrastructure.

**The demand is real and growing.** AI assistants are already attempting property transactions. The scraping, the workarounds, the bespoke integrations are the market signalling that a standard is needed.

---

## V. The invitation

### To estate agents

Your data is your most valuable asset. Open protocol infrastructure means your portfolio is accessible to every AI assistant that queries RAIA — without paying a portal for the privilege.

MoveHome.org gives your listings a free public presence. RAIA Protocol gives your AI agent a standard interface to every other participating agent. Together they replace the portal dependency with an open alternative.

Join the waitlist at **estateaigents.com**. List for free at **movehome.org** (launching 2026).

### To PropTech developers

The schemas are in development. The MCP server is being built. Join the schema working group now.

Open an issue at **github.com/estateaigents/raia-protocol** with the label `schema-working-group`.

### To portal operators

RAIA is not a competitor to your product. It is the transport layer that makes your product interoperable with the AI ecosystem. The portal that implements RAIA first stops being a toll booth and starts being a node.

Contact us at **admin@estateaigents.org**.

### To AI developers

If your assistant speaks MCP, it can query any RAIA-compliant agent's portfolio. The reference MCP server publishes at `mcp.estateaigents.com` with v1.0 in Q3 2026.

### To regulators and industry bodies

The protocol's jurisdictional module architecture was designed with regulatory compliance in mind. Every jurisdiction's compliance requirements are encoded in a separate module that plugs into the global core.

We are actively seeking input from professional bodies and regulatory authorities in every market where RAIA is being implemented. Contact us at **admin@estateaigents.org**.

### To the community

MoveHome Foundation CIC — the entity that holds the trademark and governs the registry — is being incorporated now. Board seats will be open. Governance criteria will be published.

If you believe that property infrastructure should be a commons — this is where that belief becomes a structure rather than a sentiment.

---

## VI. The commitment

We commit to the following, publicly and permanently:

**1.** The protocol will be governed by a multi-stakeholder community foundation. MoveHome Foundation CIC holds the trademark. EstateAigents Ltd has one seat on the board — not a controlling seat.

**2.** The RAIA™ trademark will be held by MoveHome Foundation CIC in trust for the property industry. It will not be exclusively licensed to any commercial entity.

**3.** The registry criteria will be published and enforced transparently. Admission will not be at the discretion of any single commercial actor.

**4.** The core protocol schema will evolve through open community process. No private amendments.

**5.** If EstateAigents Ltd ceases to exist, the protocol continues. The CIC holds the trademark. The GitHub repo is public. The schemas are MIT licensed.

**6.** MoveHome.org will remain free to list on. No agent listing fees. No consumer access charges. Ever.

---

## VII. What we ask

Read the spec. Implement the protocol. Find what it gets wrong. Tell us in a GitHub issue.

Join the schema working group. Contribute a jurisdiction module. Apply for a board seat when MoveHome Foundation CIC is constituted.

This Charter is the beginning of that conversation.

---

*RAIA™ is a registered UK trademark (UK00003359082, Classes 36 + 42, registered 2018).*
*Protocol specification MIT licensed.*
*MoveHome Foundation CIC — in formation, April 2026.*
*Founding contributor: EstateAigents Ltd.*

*github.com/estateaigents/raia-protocol · estateaigents.org · movehome.org*
