/**
 * raia_search — search properties by structured requirements.
 *
 * Returns an array of PropertyCard objects at district level.
 * Full address is only released when enquiry state reaches COMMITTED.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RaiaRegistryAdapter } from "../registry.js";
import { SearchInputSchema } from "../schemas.js";

export function registerSearchTool(
  server: McpServer,
  adapter: RaiaRegistryAdapter
): void {
  server.tool(
    "raia_search",
    "Search for properties matching structured requirements. Returns property cards at district level — full address is withheld until a viewing is confirmed. Supports lettings and sales across all RAIA-registered jurisdictions.",
    {
      un_locode: SearchInputSchema.shape.un_locode,
      transaction_type: SearchInputSchema.shape.transaction_type,
      property_type: SearchInputSchema.shape.property_type,
      min_bedrooms: SearchInputSchema.shape.min_bedrooms,
      max_bedrooms: SearchInputSchema.shape.max_bedrooms,
      min_rent_pcm: SearchInputSchema.shape.min_rent_pcm,
      max_rent_pcm: SearchInputSchema.shape.max_rent_pcm,
      min_price: SearchInputSchema.shape.min_price,
      max_price: SearchInputSchema.shape.max_price,
      currency: SearchInputSchema.shape.currency,
      available_from: SearchInputSchema.shape.available_from,
      furnishing: SearchInputSchema.shape.furnishing,
      parking: SearchInputSchema.shape.parking,
      outside_space: SearchInputSchema.shape.outside_space,
      tenure: SearchInputSchema.shape.tenure,
      epc_min_rating: SearchInputSchema.shape.epc_min_rating,
      min_floor_area_sqm: SearchInputSchema.shape.min_floor_area_sqm,
      term_months: SearchInputSchema.shape.term_months,
      limit: SearchInputSchema.shape.limit,
    },
    async (params) => {
      const parsed = SearchInputSchema.safeParse(params);
      if (!parsed.success) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Invalid search parameters: ${parsed.error.message}`,
            },
          ],
          isError: true,
        };
      }

      const results = await adapter.searchProperties(parsed.data);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No properties found matching your criteria in ${parsed.data.un_locode} (${parsed.data.transaction_type}).`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                count: results.length,
                query: {
                  un_locode: parsed.data.un_locode,
                  transaction_type: parsed.data.transaction_type,
                },
                properties: results,
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
