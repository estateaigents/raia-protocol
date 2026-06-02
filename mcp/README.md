# RAIA MCP Server

Reference MCP server for RAIA Protocol v0.2. Exposes four tools that any MCP-compatible AI assistant (Claude, GPT, Gemini, etc.) can call to discover, query, verify and transact residential property.

## Tools

| Tool | Description |
|---|---|
| `raia_search` | Search properties by structured requirements (location, type, price, bedrooms, furnishing, parking, EPC, etc.) |
| `raia_get_property` | Get a full property card by `raia_id` |
| `raia_verify_agent` | Verify an estate agent's compliance status and registry membership |
| `raia_request_viewing` | Submit a viewing request and initiate the enquiry state machine |

## Quick start

```bash
cd mcp
npm install
npm run build
node dist/index.js
```

The server starts on **stdio** (standard for MCP). It ships with a stub adapter that returns example data immediately — no database or API credentials needed to test.

To connect to a live registry or private CRM API, copy `.env.example` and set:

```bash
RAIA_REGISTRY_BASE_URL=https://registry.estateaigents.org/api/raia/v0.2
RAIA_REGISTRY_API_KEY=replace-with-registry-api-key
RAIA_AGENT_ID=org-gb-example
```

When `RAIA_REGISTRY_BASE_URL` is set the server uses `RegistryHttpAdapter`; otherwise it uses `StubRegistryAdapter`.

## Connect to Claude Desktop

Add to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "raia": {
      "command": "node",
      "args": ["/absolute/path/to/raia-protocol/mcp/dist/index.js"]
    }
  }
}
```

Then ask Claude: *"Search for a 2-bed flat to rent in London under £2,500/month"* — it will call `raia_search` with `un_locode: "GBLON"`.

## Connect to any MCP client

```typescript
import { createRaiaServer } from "./dist/index.js";
import { StubRegistryAdapter } from "./dist/registry.js";

const server = createRaiaServer(new StubRegistryAdapter());
// connect with your preferred transport
```

## Plug in your own data

The server is built around the `RaiaRegistryAdapter` interface. Implement it to connect your CRM, database, or the `estateaigents.org` registry API:

```typescript
// src/my-adapter.ts
import type { RaiaRegistryAdapter } from "raia-mcp-server";
import type { PropertyCard, AgentCard, VerifyAgentResult } from "raia-mcp-server";
import type { SearchInput } from "raia-mcp-server";

export class MyDatabaseAdapter implements RaiaRegistryAdapter {
  async searchProperties(params: SearchInput): Promise<PropertyCard[]> {
    // Query your database / CRM API
    const rows = await db.properties.findMany({
      where: {
        un_locode: params.un_locode,
        transaction_type: params.transaction_type,
        // ... map other params
      },
      take: params.limit,
    });
    return rows.map(toPropertyCard);
  }

  async getProperty(raiaId: string): Promise<PropertyCard | null> {
    return db.properties.findUnique({ where: { raia_id: raiaId } });
  }

  async verifyAgent(raiaId: string): Promise<VerifyAgentResult> {
    // Fetch from registry API or local database
    const agent = await registryApi.get(raiaId);
    return toVerifyResult(agent);
  }

  async createViewingEnquiry(params): Promise<{ enquiry_id: string; ... }> {
    // Create enquiry record in your system, notify human agent
    const enquiry = await db.enquiries.create({ data: mapParams(params) });
    await notifyHumanAgent(enquiry);
    return { enquiry_id: enquiry.id, state: "IDENTIFIED", ... };
  }
}
```

Then pass it to the server factory:

```typescript
import { createRaiaServer } from "./dist/index.js";
import { MyDatabaseAdapter } from "./my-adapter.js";

const server = createRaiaServer(new MyDatabaseAdapter());
```

## Tool reference

### `raia_search`

Search for properties. Required: `un_locode`, `transaction_type`.

```json
{
  "un_locode": "GBLON",
  "transaction_type": "LETTINGS",
  "min_bedrooms": 2,
  "max_rent_pcm": 2500,
  "furnishing": "FURNISHED",
  "epc_min_rating": "C",
  "parking": ["OFF_STREET"],
  "limit": 10
}
```

Returns an array of `PropertyCard` objects. Address is masked to district level. Full address is released only when the enquiry state reaches `COMMITTED`.

### `raia_get_property`

Get a full property card by its stable RAIA ID.

```json
{ "raia_id": "prop-gb-rlf-000031" }
```

### `raia_verify_agent`

Verify a registered estate agent.

```json
{ "raia_id": "org-gb-rlf" }
```

Returns verification status (`ACTIVE` / `SUSPENDED` / `EXPIRED` / `NOT_FOUND`), compliance bodies, CMP status, redress scheme, and protocol endpoints.

### `raia_request_viewing`

Submit a viewing request and initiate the RAIA session state machine.

```json
{
  "property_raia_id": "prop-gb-rlf-000031",
  "buyer_agent_raia_id": "org-gb-myagent",
  "proposed_slots": [
    { "start": "2026-07-10T10:00:00Z", "end": "2026-07-10T10:30:00Z" },
    { "start": "2026-07-11T14:00:00Z", "end": "2026-07-11T14:30:00Z" }
  ],
  "viewing_type": "IN_PERSON",
  "qualification": {
    "employment_status": "EMPLOYED",
    "income_band": "BAND_50_75K",
    "household_size": 2,
    "has_pets": false,
    "move_in_date": "2026-08-01"
  }
}
```

Returns `enquiry_id`, initial session state, TTL, and the `enquiry_endpoint` to POST state updates to.

## State machine

```
IDENTIFIED
  → DATA_GATHERING          (qualification signals shared)
    → AWAITING_HUMAN_ASSERTION  (mandatory gate — human approval required)
      → COMMITTED               (address released, viewing confirmed or offer accepted)
        → SETTLED

  → WITHDRAWN   (any stage before COMMITTED)
  → EXPIRED     (session TTL exceeded)
```

The `raia_request_viewing` tool initiates the session. Subsequent state transitions happen via POST to the `enquiry_endpoint` returned in the response.

## Address privacy

Full property addresses are **never** included in `raia_search` or `raia_get_property` responses. Location is masked to district and postcode district prefix (e.g. "Hammersmith, W6"). The full address is only transmitted once the enquiry session reaches `COMMITTED` state — i.e. after a human has approved the viewing or offer.

## Related standards

- Anthropic MCP: https://github.com/modelcontextprotocol/servers
- Google A2A: https://github.com/google-a2a/A2A
- RAIA Spec: [../SPEC.md](../SPEC.md)
- RAIA Schemas: [../schemas/](../schemas/)

## Early access / production registry

Contact protocol@estateaigents.org to connect to the live `estateaigents.org` registry and `mcp.estateaigents.com` endpoint.

The built-in `RegistryHttpAdapter` expects this HTTP surface:

| Method | Path | Purpose |
|---|---|---|
| POST | `/properties/search` | Search public property cards |
| GET | `/properties/{raia_id}` | Fetch one property card |
| GET | `/agents/{raia_id}/verify` | Verify agent registry/compliance status |
| POST | `/enquiries/viewings` | Create a viewing enquiry |

L1+ production deployments also need the consent-token endpoint from SPEC.md:

| Method | Path | Purpose |
|---|---|---|
| POST | `/consent-tokens` | Issue scoped `ct_l1_`, `ct_l2_`, or `ct_l3_` tokens |
