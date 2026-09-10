# Personal AI Agent Wave: Scoping Document
## Meta Muse & Google Gemini Spark — Reachability Assessment for RAIA Protocol

**Published:** September 2026
**Status:** Scoping Document / Research Memo
**Audience:** RAIA Protocol Working Group, EstateAigents Engineering
**GitHub Issue:** [#18](https://github.com/estateaigents/raia-protocol/issues/18)

---

## 1. Landscape: The Personal Agent Wave Arrives

The "personal buyer agent" persona predicted in the [RAIA A2A Protocol GTM whitepaper](./A2A_PROTOCOL_GTM.md) is no longer theoretical. In 2026, two of the world's largest AI platforms shipped consumer-facing personal AI agents that can browse the web, fill forms, negotiate, and transact on behalf of individual users — without requiring the user to be present.

### 1.1 Meta Muse

On **September 8, 2026**, Meta introduced [Muse](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent), a secure, private personal AI agent that proactively helps with people's goals and suggests ideas. Muse is a product of [Meta Superintelligence Labs](https://www.wired.com/story/mark-zuckerberg-welcomes-superintelligence-team/), the AI unit CEO Mark Zuckerberg formed to compete with OpenAI and Anthropic.

**Availability (as of September 2026):**
- US-only, age 18+
- iOS and Android via the Muse app
- Web at [muse.ai](https://muse.ai)
- Direct messaging in WhatsApp
- Meta AI glasses integration planned
- Free tier available; paid tiers at $20/mo and $100/mo for heavier automation ([TechCrunch](https://techcrunch.com/2026/05/27/meta-officially-launches-instagram-facebook-and-whatsapp-subscriptions-with-more-to-come-including-ai-plans/))

**Architecture:**
Muse introduces a novel dual-agent architecture running inside a dedicated per-user virtual machine:

| Component | Role |
|---|---|
| **Muse Secure VM** | Dedicated per-user cloud VM housing the agent, user data, and credentials. Own browser instance. Persists after the user closes the app — Muse keeps working on long-running tasks and returns when it needs approval. |
| **Muse Spark** | The reasoning engine. [Muse Spark 1.1](https://ai.meta.com/blog/introducing-muse-spark-meta-model-api/) (July 2026) is a multimodal reasoning model built for agentic tasks, with "zero-shot generalization to new native tools, MCP servers, and custom skills." 1M-token context window. Supports multi-agent orchestration — can act as a main agent that delegates to parallel subagents. |
| **Sentinel** | A separate agent co-located on the same VM that gates EVERYTHING sent to the internet. Human approval prompts are delivered directly to the user, bypassing the model entirely — an explicit countermeasure against prompt injection attacks ([Wired](https://wired.com/story/meta-releases-muse-a-personal-ai-agent-with-privacy-built-into-it)). |
| **Confidential VM** (promised) | Future architecture where each VM runs in a "trusted execution environment" with user-managed access keys. Designed with [Moxie Marlinspike](https://www.wired.com/story/signals-creator-is-helping-encrypt-meta-ai/) (creator of Signal). Source code auditable by third-party security firms, published binaries, transparency log. |

**Payment infrastructure:**
- [Stripe Link](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent) for agents: generates one-time-use card numbers so the agent never exposes real financial data
- First AI agent covered by Link's purchase protections (damage/loss, price drops, no-fee returns, return guarantee)
- Shop Pay and 1Password integration coming

**How it reaches services:**
Muse acts through **browser automation** inside its Secure VM. It opens a browser, fills out forms, and negotiates. It can also use MCP servers where the harness supports them — [Muse Code](https://dev.meta.ai/docs/muse-code/extending/) supports `stdio` and `streamable_http` MCP transports, plus skills and hooks. Meta publishes at least one [official remote MCP server](https://developers.facebook.com/documentation/mcp) (Meta Social Technologies MCP for developer tools) with OAuth-based authentication.

**Model API:**
The [Meta Model API](https://ai.developer.meta.com/docs) (`api.meta.ai/v1`) serves Muse Spark 1.1/1.2/1.3 with drop-in OpenAI and Anthropic SDK compatibility. This means third-party developers CAN build agents powered by the same model that drives Muse — but there is no "register as a Muse service provider" program.

### 1.2 Google Gemini Spark

Google launched [Gemini Spark](https://gemini.google/overview/agent/spark/) at Google I/O 2026 (May 19, 2026) as a 24/7 personal AI agent within the Gemini app ecosystem.

**Availability (as of September 2026):**
- Google AI Pro or Ultra subscription required
- Available wherever Gemini Apps are supported, EXCEPT: European Economic Area, Nigeria, Switzerland, and the United Kingdom
- Gemini mobile app, Gemini app on Mac, and [gemini.google.com](https://gemini.google.com) web app
- Desktop Chrome auto-browse integration — Spark can use the user's local Chrome browser or a remote cloud browser

**Architecture:**
Gemini Spark is a cloud-side agent that operates asynchronously — it "works in the background 24/7, even if your phone and laptop are turned off" ([Gemini Spark Overview](https://gemini.google/overview/agent/spark/)). Key architectural features:

| Feature | Description |
|---|---|
| **Tasks & Schedules** | Users define tasks in natural language. Spark can run on recurring schedules (e.g. "Every Monday at 9:00 AM, scan my inbox"). Tasks persist across sessions. |
| **Skills** | Users can create custom skills — e.g. "Read through the last 50 emails that I wrote and turn it into a style guide" ([Google Support](https://support.google.com/gemini/answer/17094507)). |
| **Browser Access** | Two modes: (a) local Chrome browser (Spark uses the user's actual Chrome, with access to signed-in sites, Password Manager, and cookies), (b) remote cloud browser (task continues even with device off; stops for manual sign-in). |
| **Connected Apps** | Integrates with Google Workspace (Gmail, Drive, Docs, Sheets, Slides, Keep, Tasks) via "Personal Intelligence." Can extract data, create documents, organize files, and trigger automation from email triggers. |
| **Custom Connected Apps** | Users can connect third-party apps ([Google Support](https://support.google.com/gemini/answer/17209137)). |

**How it reaches services:**
Gemini Spark's primary surface for reaching external services is the **browser** — both the user's local Chrome (with full credential access) and a remote cloud browser. It can also integrate through Connected Apps (Google Workspace today; custom connected apps are documented but limited). There is no public MCP integration surface for Gemini Spark, and no "register your service with Spark" developer program.

### 1.3 Side-by-Side Comparison

| Dimension | Meta Muse | Google Gemini Spark |
|---|---|---|
| **Launch date** | September 8, 2026 | May 19, 2026 |
| **Availability** | US only, 18+ | Global except EEA, Nigeria, Switzerland, UK |
| **Access surfaces** | Muse app (iOS/Android), muse.ai, WhatsApp, Meta glasses (planned) | Gemini mobile app, Mac app, gemini.google.com |
| **Pricing** | Free / $20/mo / $100/mo | Google AI Pro or Ultra subscription required |
| **Engine model** | Muse Spark 1.1/1.2/1.3 (Meta Superintelligence Labs) | Gemini 3.5 Flash (Google DeepMind) |
| **Execution environment** | Muse Secure VM — dedicated cloud VM per user | Remote cloud agent + optional local Chrome browser |
| **Persists after close?** | Yes — keeps working, returns when it needs approval | Yes — "24/7, even if your phone and laptop are turned off" |
| **Browser automation** | Own browser inside Secure VM | Local Chrome (auto browse) + remote cloud browser |
| **Payment infrastructure** | Stripe Link one-time-use cards + purchase protections | Not disclosed / not a marketed feature |
| **MCP support** | Yes — stdio + streamable_http via Muse Code; Meta publishes remote MCP servers | Not publicly documented |
| **Third-party developer program** | None — no "build for Muse" integration program | None — no "build for Spark" integration program |
| **Security model** | Dual-agent (Muse + Sentinel); human approval bypasses model; Confidential VM promised | User-directed; "designed to check with you before taking major actions" |
| **Identity** | User's own credentials to services | User's Google Account + Chrome Profile credentials |

---

## 2. Integration Surfaces Analysis

How can a personal AI agent like Muse or Gemini Spark actually reach a property service today? This section maps every viable surface — regardless of whether RAIA supports it yet — and assesses its current state.

### 2.1 Browser / HTML (Human Web)

**Mechanism:** The agent opens a browser (real or virtual), navigates to a property portal website, reads the DOM, fills forms, clicks buttons.

**Current state:** This is the **only universally available surface today**. Both Muse and Gemini Spark use browser automation as their primary mechanism for interacting with third-party services that lack a structured API.

**Strengths:** Zero integration work required by the service. Works with any website. Agents can search, read listings, fill enquiry forms, and even negotiate via web chat widgets.

**Weaknesses:** Brittle — DOM parsing breaks on site redesigns. Inefficient — parsing HTML for structured property data is wasteful compared to JSON. No trust layer — agent cannot verify the listing agent is licensed. No standard enquiry format — every site's contact form is different.

**RAIA relevance:** This is the baseline threat and opportunity. If RAIA provides structured, machine-readable endpoints, personal agents will prefer them over screen-scraping HTML. But in the absence of RAIA adoption, agents WILL screen-scrape — and they will get value from portals, not from agencies.

### 2.2 Structured Data for AI Agents: `llms.txt` / `skills.md` Pattern

**Mechanism:** A website exposes a machine-readable file at a well-known path that describes how an AI agent should interact with it. The pattern was popularized by [llms.txt](https://llms.txt/) and by the [movehome.org/skills.md](https://movehome.org/skills.md) (the property industry's first AI-consumable instruction file).

**Current state:** Emerging but not standardized. No major AI platform (Meta, Google, OpenAI) has committed to consuming `llms.txt` as a built-in protocol. However, agents with browser access CAN be prompted to "first check for llms.txt or skills.md" — this is a prompt-engineering pattern, not a protocol.

**Strengths:** Extremely simple to implement. A single markdown file. Teaches the agent how to use the site without scraping. Works on any static host.

**Weaknesses:** Not discoverable via DNS or agent card — relies on the agent knowing to look for it. No authentication, no trust signals, no structured schema validation. No versioning. Not part of any agent platform's built-in capabilities.

**RAIA relevance:** Complementary to RAIA agent cards. A `skills.md` file could describe how to interact with RAIA endpoints, but it is not a substitute for structured schemas.

### 2.3 Agent Cards (`/.well-known/`)

**Mechanism:** A domain hosts a standardized JSON file at a well-known path declaring its AI-agent capabilities, endpoints, and identity. Google's A2A protocol defines `/.well-known/agent.json`. RAIA defines `/.well-known/raia-agent.json`.

**Current state:** Google A2A's agent card is the closest thing to a standard. RAIA's agent card is a property-specific extension. However, **neither Muse nor Gemini Spark currently consume agent cards as part of their built-in discovery flow**. An agent card is useful for a developer building a custom agent — it is NOT currently consumed automatically by the major personal AI platforms.

**Strengths:** Standardized, machine-readable, domain-authenticated. Supports capability discovery and endpoint routing. RAIA cards add compliance signals and jurisdictional scoping.

**Weaknesses:** Not natively consumed by Muse or Gemini Spark as of September 2026. Requires the agent to either (a) be programmed to look for cards, or (b) integrate via a separate MCP or A2A client.

### 2.4 MCP Servers (Model Context Protocol)

**Mechanism:** An MCP-compatible server exposes tools (functions) over `stdio` or `streamable_http`. AI agents that support MCP can discover and call these tools at runtime. [Anthropic's MCP](https://github.com/modelcontextprotocol/servers) is the reference implementation.

**Current state:** 
- **Muse / Muse Code:** Supports MCP `stdio` and `streamable_http` ([Muse Code Extending docs](https://dev.meta.ai/docs/muse-code/extending/)). A user can configure their Muse to connect to external MCP servers. Meta publishes at least one official remote MCP server ([Facebook MCP docs](https://developers.facebook.com/documentation/mcp)).
- **Gemini Spark:** No public MCP support documented.
- **Claude Desktop / Claude Code:** Full MCP support. Users can add MCP servers to their Claude config.
- **OpenAI ChatGPT / Codex:** MCP support via third-party connectors.

**Strengths:** Strongly typed tool definitions. Runtime discovery — the agent sees available tools and their parameter schemas. Supports authentication. RAIA already ships a reference MCP server.

**Weaknesses:** User must manually configure MCP server connections. Not a "zero-touch" discovery mechanism. Fragmented — different platforms have different MCP transport support. Muse supports it; Gemini Spark does not.

### 2.5 A2A JSON-RPC (Agent-to-Agent Protocol)

**Mechanism:** [Google's A2A protocol](https://github.com/google-a2a/A2A) enables direct agent-to-agent communication via JSON-RPC over HTTPS. Agents discover each other via agent cards, then exchange structured task messages.

**Current state:** Google A2A is an open standard with growing adoption but is not yet natively consumed by the consumer personal agents (Muse, Gemini Spark). It is targeted at enterprise and developer-built agent ecosystems. RAIA is designed as a vertical implementation on top of A2A.

**Strengths:** Full task routing, stateful sessions, capability negotiation. RAIA already defines A2A-compatible schemas.

**Weaknesses:** Requires both agents to speak A2A. Consumer personal agents do not yet consume A2A natively. This is an agent-to-agent protocol, not an agent-to-website protocol — it requires the service to run an A2A-compatible agent.

---

## 3. RAIA Reachability Assessment

For each integration surface, this section maps what raia-protocol already ships and grades readiness for a personal AI agent to reach a RAIA-compliant property service through that surface.

### Grading scale

| Grade | Meaning |
|---|---|
| **A** | Ready today — a personal agent can use this surface to reach a RAIA service with zero additional work |
| **B** | Partially covered — works with configuration or a thin adapter |
| **C** | Spec exists, no implementation ready for consumer agents |
| **D** | Gap — no spec or implementation |

### 3.1 Surface-by-Surface Assessment

#### 3.1.1 Browser / HTML

| Attribute | Assessment |
|---|---|
| **Grade** | **A** (baseline) |
| **What exists** | N/A — this surface bypasses RAIA entirely. The agent just browses the property service's website. |
| **RAIA role** | RAIA provides the structured data that makes browser scraping unnecessary. RAIA's portal feed API ([`openapi/raia-portal-feed-api.yaml`](../openapi/raia-portal-feed-api.yaml)) and agent card ([`.well-known/raia-agent.json`](../.well-known/raia-agent.json)) are the structured alternatives. |
| **Readiness** | A personal agent can already browse EstateAigents.com or movehome.org today using browser automation. RAIA adoption improves this experience but is not a prerequisite. |
| **Repo artifacts** | `docs/raia-portal-feed-api.md`, `openapi/raia-portal-feed-api.yaml` |

#### 3.1.2 `llms.txt` / `skills.md` Pattern

| Attribute | Assessment |
|---|---|
| **Grade** | **D** |
| **What exists** | Nothing in raia-protocol. movehome.org has an independent [`skills.md`](https://movehome.org/skills.md) file. |
| **What's needed** | A standard location and format within the RAIA spec for an AI-consumable instruction file. Could be `/.well-known/raia-skills.md` or an `llms.txt` at the domain root. |
| **Repo artifacts** | None |

#### 3.1.3 Agent Cards (`/.well-known/`)

| Attribute | Assessment |
|---|---|
| **Grade** | **B** |
| **What exists** | Full agent card specification at [`SPEC.md`](../SPEC.md) §3. Reference implementation at [`.well-known/raia-agent.json`](../.well-known/raia-agent.json). Schema at [`schemas/agent.json`](../schemas/agent.json). Declares: identity, jurisdiction, UN/LOCODE coverage, compliance signals, MCP endpoint, A2A endpoint, consent endpoint, enquiry endpoint. |
| **What's needed** | Consumer personal agents (Muse, Gemini Spark) do not natively consume agent cards. Until they do, RAIA agent cards are useful for developer-built custom agents and for the RAIA Global Indexer — not for zero-touch discovery by consumer agents. |
| **Repo artifacts** | `SPEC.md` §3, `.well-known/raia-agent.json`, `schemas/agent.json` |

#### 3.1.4 MCP Servers

| Attribute | Assessment |
|---|---|
| **Grade** | **B** |
| **What exists** | Reference MCP server at [`mcp/`](../mcp/) with four tools: `raia_search`, `raia_get_property`, `raia_verify_agent`, `raia_request_viewing`. Production-ready TypeScript codebase. Supports stdio and streamable_http transports. Stub adapter for testing; `RegistryHttpAdapter` for live registry connection. Hosted reference endpoint at `mcp.estateaigents.com`. |
| **What's needed** | A Muse Code user CAN connect to a RAIA MCP server today by adding it to their Muse Code config. But this requires: (a) the user knows about RAIA, (b) the user knows how to configure MCP servers, (c) the MCP server URL is publicly available. This is a power-user workflow, not a consumer experience. |
| **Repo artifacts** | `mcp/` (full reference server), `mcp/README.md`, `mcp/src/tools/` (four tools) |

#### 3.1.5 A2A JSON-RPC

| Attribute | Assessment |
|---|---|
| **Grade** | **C** |
| **What exists** | SPEC.md defines A2A integration (§3.1): RAIA agent cards link to native A2A cards via `a2a_agent_card_url` and `a2a_endpoint`. RAIA schemas are designed to be carried inside A2A messages. |
| **What's needed** | No reference A2A server implementation in the repo. No A2A client SDK. The spec is clear about the relationship, but a developer arriving today cannot run a RAIA-over-A2A service from this repo. Furthermore, consumer personal agents do not speak A2A — this surface is for agent-to-agent ecosystems, not consumer-to-agent. |
| **Repo artifacts** | `SPEC.md` §3.1 |

#### 3.1.6 Portal Feed API (Structured HTTP)

| Attribute | Assessment |
|---|---|
| **Grade** | **B** |
| **What exists** | Complete portal feed API specification at [`docs/raia-portal-feed-api.md`](../docs/raia-portal-feed-api.md). OpenAPI 3.0 spec at [`openapi/raia-portal-feed-api.yaml`](../openapi/raia-portal-feed-api.yaml). Covers listing syndication, branch reconciliation, performance reporting, enquiry polling, and product activations. |
| **What's needed** | This API is designed for portal-to-portal and agent-to-portal integrations. A personal agent could call it — the spec is clean REST with Bearer auth — but it requires the agent to be programmed to do so. No consumer agent today ships with knowledge of this API. |
| **Repo artifacts** | `docs/raia-portal-feed-api.md`, `openapi/raia-portal-feed-api.yaml`, `docs/raia-portal-feed-api-implementer-guide.md` |

#### 3.1.7 SDKs

| Attribute | Assessment |
|---|---|
| **Grade** | **B** |
| **What exists** | Python SDK ([`sdk/python/`](../sdk/python/)) and TypeScript SDK ([`sdk/typescript/`](../sdk/typescript/)). Client implementations for RAIA search and enquiry. |
| **What's needed** | SDKs are for developers building custom agents. A consumer user of Muse or Gemini Spark will never install an SDK. SDKs are the right tool for the developer persona, not the consumer persona. |
| **Repo artifacts** | `sdk/python/`, `sdk/typescript/` |

### 3.2 Summary Matrix

| Surface | Grade | Consumer-ready? | Developer-ready? | RAIA shipping? |
|---|---|---|---|---|
| Browser/HTML | **A** | Yes | N/A | N/A (baseline) |
| Agent Cards | **B** | No (not natively consumed) | Yes | Yes — full spec + schema + example |
| MCP Server | **B** | No (manual config required) | Yes | Yes — reference server + 4 tools |
| Portal Feed API | **B** | No (requires agent programming) | Yes | Yes — full OpenAPI spec |
| SDKs | **B** | No (developer tool) | Yes | Yes — Python + TypeScript |
| A2A JSON-RPC | **C** | No | Partial (no reference server) | Partial — spec only |
| llms.txt/skills.md | **D** | No | No | No |

---

## 4. Gaps & Recommendations

This section is scoped to **analysis and recommendations only** — no implementation work is proposed here. Each recommendation is a candidate for a future kanban card, subject to Eugin's prioritization.

### Priority 1: Ship a Public `llms.txt` / Agent Instruction File

**Gap:** Neither the RAIA spec nor any RAIA-compliant domain publishes an AI-consumable instruction file (`llms.txt`, `skills.md`, or equivalent). This is the single lowest-effort, highest-reach surface available.

**Recommendation:** Define a standard path within the RAIA spec (proposed: `/.well-known/raia-instructions.md`) and publish a reference implementation. The file should describe in plain markdown: what RAIA is, what endpoints are available, how to search properties, how to make an enquiry, and where to find an MCP server. This costs a single markdown file but gives every AI agent that reads `llms.txt` (a growing pattern) a structured on-ramp to RAIA services.

**Effort:** Very low (one spec section + one markdown file).

### Priority 2: Consumer-Agent Quickstart Guide for RAIA MCP

**Gap:** The RAIA MCP server works and is well-documented for developers. But there is no guide that shows a non-technical Muse or Claude user how to connect it.

**Recommendation:** Write a "Connect RAIA to Your Muse" quickstart: a step-by-step guide with the exact MCP config JSON to paste, the server URL to use, and example prompts. Publish at `mcp.estateaigents.com/quickstart` and in the repo README. This bridges the gap between "developer-ready" and "consumer-accessible."

**Effort:** Low (one guide document).

### Priority 3: Monitor for Muse "Business Integrations" or "Agent Store"

**Gap:** As of September 2026, there is no "build for Muse" developer program. This is the single most important watch item. If Meta launches a business integration surface or agent directory, RAIA should be among the first property services registered.

**Recommendation:** No action to take now. This is a pure watch item. When a program is announced, the response should be: register RAIA schemas, MCP tools, and taxonomy; publish a Muse-specific integration guide; and ensure the registry at `estateaigents.org` serves as the authoritative agent directory.

**Effort:** Zero now; prepare for fast follow when announced.

### Priority 4: A2A Reference Server

**Gap:** The RAIA spec defines the relationship with Google A2A, but there is no reference A2A server implementation in the repo. A developer wanting to build a RAIA-over-A2A integration must implement both sides from the spec.

**Recommendation:** Build a reference A2A server (similar to the MCP reference server) that speaks the RAIA schemas over A2A JSON-RPC. This makes the A2A surface go from "spec-only" (grade C) to "developer-ready" (grade B).

**Effort:** Medium (new server implementation, similar scope to `mcp/`).

### Priority 5: `llms.txt` at movehome.org and EstateAigents.com

**Gap:** Neither consumer-facing RAIA property site publishes an AI-consumable instruction file.

**Recommendation:** Once the RAIA `llms.txt` / instruction file standard is defined (Priority 1), publish it at `movehome.org/llms.txt` and `estateaigents.com/llms.txt`. This is the practical step that makes RAIA inventory actually reachable by consumer agents via the browser surface.

**Effort:** Very low (one file per domain).

---

## 5. Watch List

Items to monitor that could materially change RAIA's reachability posture. None require action today.

| Watch item | Why it matters | Signal to look for |
|---|---|---|
| **Muse Business Integrations program** | If Meta opens a "register your service" program for Muse, RAIA should be a day-1 registrant. This could make RAIA-compliant agencies reachable by every Muse user with zero configuration. | Blog post or documentation on `dev.meta.ai` or `developers.facebook.com` announcing a business/partner integration surface. |
| **WhatsApp Agent Surface** | Muse works via WhatsApp today. If Meta exposes a structured WhatsApp agent API — where businesses can declare capabilities — this becomes a direct channel for property enquiries. | WhatsApp Business API changelog; Meta MCP server expansion beyond social technologies. |
| **Gemini Spark Extensions / Connected Apps program** | Google's "Connected Apps" framework currently focuses on Workspace. If it opens to third-party services in a structured way, Gemini Spark users could connect directly to RAIA services. | Google I/O or Gemini blog announcements about third-party Connected Apps. |
| **Meta MCP Directory** | Meta currently publishes one MCP server (Social Technologies). If they launch a directory or registry of verified MCP servers, RAIA's MCP server should be listed. | Expansion of `developers.facebook.com/documentation/mcp`; new server entries beyond Social Technologies. |
| **A2A Adoption by Consumer Agents** | If Google announces that Gemini Spark natively consumes A2A agent cards, RAIA's A2A alignment becomes a direct consumer channel. | Google A2A GitHub releases; Google I/O sessions on agent interoperability. |
| **Apple Personal Agent** | Apple has not announced a consumer personal agent, but their on-device AI strategy (Apple Intelligence) and Siri evolution suggest this is a matter of time. | Apple WWDC or product event announcements. |
| **Amazon Alexa+ / Rufus** | Amazon's shopping-oriented agents (Alexa+, Rufus) could expand into high-consideration purchases like property. | Amazon Devices & Services announcements; Alexa developer blog. |
| **OpenAI Operator / Codex consumer agent** | OpenAI has demonstrated desktop agents but not yet a consumer "do everything" agent. If they launch one with browsing capabilities, it joins Muse and Spark as a third channel. | OpenAI product announcements; ChatGPT desktop app updates. |

---

## 6. Key Finding: The "No Build for Muse" Reality

As of September 10, 2026, the most important single finding of this scoping exercise is:

> **There is no public "build for Muse" third-party agent-integration program.** Muse reaches services via (a) its browser inside the Secure VM, (b) user-connected credentials, and (c) MCP servers where the user manually configures them. There is no A2A-style registration endpoint, no "Muse Agent Store," and no business API for service providers to declare their capabilities to the Muse ecosystem.

This means:

1. **The browser is the universal surface.** Personal agents WILL reach property services through the browser. The question is whether they find structured RAIA endpoints or unstructured HTML.
2. **MCP is the developer surface, not the consumer surface.** RAIA's MCP server is excellent infrastructure but requires manual configuration by a technically sophisticated user. It is not a zero-touch consumer channel.
3. **Agent cards are infrastructure for the future, not a channel today.** Until consumer agents natively consume agent cards, RAIA's `/.well-known/raia-agent.json` provides value to the RAIA Indexer and to custom developer agents — not to Muse or Spark users.
4. **`llms.txt` is the highest-leverage gap.** A single markdown file at a well-known URL could make every RAIA-compliant property service more reachable than 90% of the web. It costs almost nothing and works with every AI agent that reads instructions before acting.

**RAIA's posture should be: build the infrastructure now (agent cards, MCP, schemas, portal feed API — all done or in progress) and publish the lightweight, agent-consumable surface (`llms.txt` / instructions file) that bridges the gap until the platforms catch up.**

---

*RAIA™ is a registered UK word mark (UK00003359082, Classes 36 + 42). The protocol specification is MIT licensed.*