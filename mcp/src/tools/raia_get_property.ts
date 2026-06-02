/**
 * raia_get_property — retrieve a full property card by its stable raia_id.
 *
 * Address remains masked to district level. Full address is only released
 * when enquiry state reaches COMMITTED (human-approved viewing confirmed).
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RaiaRegistryAdapter } from "../registry.js";
import { GetPropertyInputSchema } from "../schemas.js";

export function registerGetPropertyTool(
  server: McpServer,
  adapter: RaiaRegistryAdapter
): void {
  server.tool(
    "raia_get_property",
    "Retrieve a full property card by its stable RAIA property identifier (raia_id). Address remains masked to district level — full address is only released after a human-approved viewing is confirmed.",
    {
      raia_id: GetPropertyInputSchema.shape.raia_id,
    },
    async ({ raia_id }) => {
      const parsed = GetPropertyInputSchema.safeParse({ raia_id });
      if (!parsed.success) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Invalid raia_id format: ${parsed.error.message}`,
            },
          ],
          isError: true,
        };
      }

      const property = await adapter.getProperty(parsed.data.raia_id);

      if (!property) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Property not found: ${parsed.data.raia_id}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(property, null, 2),
          },
        ],
      };
    }
  );
}
