#!/usr/bin/env node
/**
 * RAIA MCP Server — reference implementation
 *
 * Exposes four MCP tools:
 *   raia_search          — search properties by structured requirements
 *   raia_get_property    — get a full property card by raia_id
 *   raia_verify_agent    — verify an estate agent's compliance status
 *   raia_request_viewing — submit a viewing request / initiate the enquiry state machine
 *
 * Usage with stdio transport (standard for MCP):
 *   node dist/index.js
 *
 * To use your own data source, implement RaiaRegistryAdapter from ./registry.ts
 * and pass it to createRaiaServer(). The StubRegistryAdapter ships with the
 * reference implementation and returns example data immediately.
 *
 * Claude Desktop config example:
 *   {
 *     "mcpServers": {
 *       "raia": {
 *         "command": "node",
 *         "args": ["/path/to/raia-protocol/mcp/dist/index.js"]
 *       }
 *     }
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  RegistryHttpAdapter,
  StubRegistryAdapter,
  type RaiaRegistryAdapter,
} from "./registry.js";
import { registerSearchTool } from "./tools/raia_search.js";
import { registerGetPropertyTool } from "./tools/raia_get_property.js";
import { registerVerifyAgentTool } from "./tools/raia_verify_agent.js";
import { registerRequestViewingTool } from "./tools/raia_request_viewing.js";

// ---------------------------------------------------------------------------
// Server factory — injectable adapter for production use
// ---------------------------------------------------------------------------

export function createRaiaServer(adapter: RaiaRegistryAdapter): McpServer {
  const server = new McpServer({
    name: "raia-mcp-server",
    version: "0.2.0",
  });

  registerSearchTool(server, adapter);
  registerGetPropertyTool(server, adapter);
  registerVerifyAgentTool(server, adapter);
  registerRequestViewingTool(server, adapter);

  return server;
}

export function createAdapterFromEnv(env: NodeJS.ProcessEnv = process.env): RaiaRegistryAdapter {
  if (env.RAIA_REGISTRY_BASE_URL) {
    return new RegistryHttpAdapter({
      baseUrl: env.RAIA_REGISTRY_BASE_URL,
      apiKey: env.RAIA_REGISTRY_API_KEY,
      agentId: env.RAIA_AGENT_ID,
    });
  }

  return new StubRegistryAdapter();
}

// ---------------------------------------------------------------------------
// Entry point — runs with the stub adapter by default.
// Swap StubRegistryAdapter for your own implementation.
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const adapter = createAdapterFromEnv();
  const server = createRaiaServer(adapter);
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Log to stderr so stdout stays clean for MCP messages
  process.stderr.write(
    `[raia-mcp-server] v0.2.0 started with ${adapter.constructor.name} - 4 tools registered: raia_search, raia_get_property, raia_verify_agent, raia_request_viewing\n`
  );
}

main().catch((err: unknown) => {
  process.stderr.write(`[raia-mcp-server] Fatal error: ${String(err)}\n`);
  process.exit(1);
});
