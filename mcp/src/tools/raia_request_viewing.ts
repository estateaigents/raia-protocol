/**
 * raia_request_viewing — submit a viewing request for a property.
 *
 * Creates a new RAIA Enquiry and advances the session state machine.
 * If qualification signals are provided, state advances to DATA_GATHERING.
 * Otherwise starts at IDENTIFIED.
 *
 * State machine (SPEC §6):
 *   IDENTIFIED → DATA_GATHERING → AWAITING_HUMAN_ASSERTION → COMMITTED → SETTLED
 *
 * Human approval is mandatory before COMMITTED. The estate agent routes the
 * enquiry to a human via their own system — this tool initiates the session.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RaiaRegistryAdapter } from "../registry.js";
import { RequestViewingInputSchema } from "../schemas.js";

export function registerRequestViewingTool(
  server: McpServer,
  adapter: RaiaRegistryAdapter
): void {
  server.tool(
    "raia_request_viewing",
    "Submit a viewing request for a property. Initiates the RAIA session state machine. Provide up to 3 proposed viewing slots — the estate agent will confirm one. Optional qualification signals (no PII) advance the session to DATA_GATHERING immediately. Returns an enquiry_id and endpoint for tracking the session.",
    {
      property_raia_id: RequestViewingInputSchema.shape.property_raia_id,
      buyer_agent_raia_id: RequestViewingInputSchema.shape.buyer_agent_raia_id,
      proposed_slots: RequestViewingInputSchema.shape.proposed_slots,
      viewing_type: RequestViewingInputSchema.shape.viewing_type,
      qualification: RequestViewingInputSchema.shape.qualification,
    },
    async (params) => {
      const parsed = RequestViewingInputSchema.safeParse(params);
      if (!parsed.success) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Invalid viewing request: ${parsed.error.message}`,
            },
          ],
          isError: true,
        };
      }

      // Verify the requesting agent is registered before allowing a viewing request.
      const agentCheck = await adapter.verifyAgent(
        parsed.data.buyer_agent_raia_id
      );
      if (agentCheck.status === "NOT_FOUND") {
        return {
          content: [
            {
              type: "text" as const,
              text: `Buyer agent ${parsed.data.buyer_agent_raia_id} is not registered in the RAIA registry. Register at estateaigents.org before submitting viewing requests.`,
            },
          ],
          isError: true,
        };
      }

      const enquiry = await adapter.createViewingEnquiry({
        propertyRaiaId: parsed.data.property_raia_id,
        buyerAgentRaiaId: parsed.data.buyer_agent_raia_id,
        proposedSlots: parsed.data.proposed_slots,
        viewingType: parsed.data.viewing_type,
        qualification: parsed.data.qualification as
          | Record<string, unknown>
          | undefined,
      });

      const slotSummary = parsed.data.proposed_slots
        .map(
          (s, i) =>
            `  Slot ${i + 1}: ${new Date(s.start).toLocaleString("en-GB", { timeZone: "UTC" })} – ${new Date(s.end).toLocaleString("en-GB", { timeZone: "UTC" })} UTC`
        )
        .join("\n");

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                message: `Viewing request submitted. Session state: ${enquiry.state}. The estate agent will confirm a slot and the session will advance through AWAITING_HUMAN_ASSERTION before an address is released.`,
                enquiry_id: enquiry.enquiry_id,
                property_raia_id: parsed.data.property_raia_id,
                state: enquiry.state,
                proposed_slots_summary: slotSummary,
                viewing_type: parsed.data.viewing_type,
                session_ttl_hours: enquiry.session_ttl_hours,
                expires_at: enquiry.expires_at,
                enquiry_endpoint: enquiry.enquiry_endpoint,
                next_step: `POST updates to ${enquiry.enquiry_endpoint} with enquiry_id ${enquiry.enquiry_id} to advance the session state.`,
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
