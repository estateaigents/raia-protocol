/**
 * raia_verify_agent — verify an estate agent's compliance status.
 *
 * Checks the agent's RAIA registry record and returns their compliance signals,
 * membership bodies, verification status, and endpoints.
 *
 * Trust tier rules (SPEC §7):
 *   verified=true  → can list properties and receive enquiries
 *   verified=false → can query only; cannot list or transact
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RaiaRegistryAdapter } from "../registry.js";
import { VerifyAgentInputSchema } from "../schemas.js";

export function registerVerifyAgentTool(
  server: McpServer,
  adapter: RaiaRegistryAdapter
): void {
  server.tool(
    "raia_verify_agent",
    "Verify an estate agent's compliance status in the RAIA registry. Returns their verification status (ACTIVE/SUSPENDED/EXPIRED/NOT_FOUND), compliance body memberships, and protocol endpoints. Only ACTIVE verified agents can list properties and receive enquiries.",
    {
      raia_id: VerifyAgentInputSchema.shape.raia_id,
    },
    async ({ raia_id }) => {
      const parsed = VerifyAgentInputSchema.safeParse({ raia_id });
      if (!parsed.success) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Invalid agent raia_id format: ${parsed.error.message}. Expected format: org-{jurisdiction}-{slug}, e.g. org-gb-rlf`,
            },
          ],
          isError: true,
        };
      }

      const result = await adapter.verifyAgent(parsed.data.raia_id);

      const summary = result.verified
        ? `✓ Agent ${result.name} (${result.raia_id}) is VERIFIED and ${result.status}.`
        : `✗ Agent ${result.raia_id} is NOT VERIFIED (status: ${result.status}). Cannot list properties or receive enquiries.`;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                summary,
                result,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
