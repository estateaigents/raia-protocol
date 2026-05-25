/**
 * RAIA Registry Adapter
 *
 * Abstracts all data access behind a single interface. Swap the StubRegistryAdapter
 * for your own implementation backed by your CRM, database, or the estateaigents.org
 * registry API.
 *
 * Pattern: implement RaiaRegistryAdapter, pass to createRaiaServer().
 */

import {
  PropertyCardSchema,
  VerifyAgentResultSchema,
  type PropertyCard,
  type AgentCard,
  type VerifyAgentResult,
} from "./schemas.js";
import type { SearchInput } from "./schemas.js";

// ---------------------------------------------------------------------------
// Adapter interface — implement this to connect your data source
// ---------------------------------------------------------------------------

export interface RaiaRegistryAdapter {
  /**
   * Search properties matching the given criteria.
   * Returns an array of PropertyCard objects (address masked to district level).
   */
  searchProperties(params: SearchInput): Promise<PropertyCard[]>;

  /**
   * Return a single full PropertyCard by its stable raia_id.
   * Returns null if not found.
   */
  getProperty(raiaId: string): Promise<PropertyCard | null>;

  /**
   * Verify an estate agent's compliance status.
   * May fetch the agent's /.well-known/raia-agent.json and/or query the registry.
   */
  verifyAgent(raiaId: string): Promise<VerifyAgentResult>;

  /**
   * Create a new viewing enquiry for the given property.
   * Returns the new enquiry_id and initial state.
   * The estate agent's system is responsible for routing the enquiry to a human.
   */
  createViewingEnquiry(params: {
    propertyRaiaId: string;
    buyerAgentRaiaId: string;
    proposedSlots: Array<{ start: string; end: string }>;
    viewingType: "IN_PERSON" | "VIRTUAL";
    qualification?: Record<string, unknown>;
  }): Promise<{
    enquiry_id: string;
    state: "IDENTIFIED" | "DATA_GATHERING";
    session_ttl_hours: number;
    expires_at: string;
    enquiry_endpoint: string;
  }>;
}

// ---------------------------------------------------------------------------
// HTTP registry adapter - production path for estateaigents.org or private CRMs
// ---------------------------------------------------------------------------

export interface RegistryHttpAdapterConfig {
  baseUrl: string;
  apiKey?: string;
  agentId?: string;
}

export class RegistryHttpAdapter implements RaiaRegistryAdapter {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly agentId?: string;

  constructor(config: RegistryHttpAdapterConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.apiKey = config.apiKey;
    this.agentId = config.agentId;
  }

  async searchProperties(params: SearchInput): Promise<PropertyCard[]> {
    const json = await this.request<unknown>("/properties/search", {
      method: "POST",
      body: JSON.stringify(params),
    });
    const payload = Array.isArray(json)
      ? json
      : (json as { properties?: unknown[] }).properties;
    const parsed = PropertyCardSchema.array().safeParse(payload);
    if (!parsed.success) {
      throw new Error(`Registry returned invalid property cards: ${parsed.error.message}`);
    }
    return parsed.data;
  }

  async getProperty(raiaId: string): Promise<PropertyCard | null> {
    const json = await this.request<unknown>(
      `/properties/${encodeURIComponent(raiaId)}`,
      { method: "GET" },
      [404]
    );
    if (json === null) return null;
    const parsed = PropertyCardSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error(`Registry returned invalid property card: ${parsed.error.message}`);
    }
    return parsed.data;
  }

  async verifyAgent(raiaId: string): Promise<VerifyAgentResult> {
    const json = await this.request<unknown>(
      `/agents/${encodeURIComponent(raiaId)}/verify`,
      { method: "GET" }
    );
    const parsed = VerifyAgentResultSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error(`Registry returned invalid agent verification: ${parsed.error.message}`);
    }
    return parsed.data;
  }

  async createViewingEnquiry(params: {
    propertyRaiaId: string;
    buyerAgentRaiaId: string;
    proposedSlots: Array<{ start: string; end: string }>;
    viewingType: "IN_PERSON" | "VIRTUAL";
    qualification?: Record<string, unknown>;
  }): Promise<{
    enquiry_id: string;
    state: "IDENTIFIED" | "DATA_GATHERING";
    session_ttl_hours: number;
    expires_at: string;
    enquiry_endpoint: string;
  }> {
    const result = await this.request<{
      enquiry_id: string;
      state: "IDENTIFIED" | "DATA_GATHERING";
      session_ttl_hours: number;
      expires_at: string;
      enquiry_endpoint: string;
    }>("/enquiries/viewings", {
      method: "POST",
      body: JSON.stringify({
        property_raia_id: params.propertyRaiaId,
        buyer_agent_raia_id: params.buyerAgentRaiaId,
        proposed_slots: params.proposedSlots,
        viewing_type: params.viewingType,
        qualification: params.qualification,
      }),
    });
    if (!result) throw new Error("Registry returned no viewing enquiry");
    return result;
  }

  private async request<T>(
    path: string,
    init: RequestInit,
    nullStatuses: number[] = []
  ): Promise<T | null> {
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    if (init.body) headers.set("content-type", "application/json");
    if (this.apiKey) headers.set("authorization", `Bearer ${this.apiKey}`);
    if (this.agentId) headers.set("x-raia-agent-id", this.agentId);

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (nullStatuses.includes(response.status)) return null;
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Registry request failed ${response.status} ${response.statusText}: ${text}`
      );
    }
    return (await response.json()) as T;
  }
}

// ---------------------------------------------------------------------------
// EPC rating helper — used for min-rating filtering
// ---------------------------------------------------------------------------

const EPC_ORDER = ["A", "B", "C", "D", "E", "F", "G"] as const;

export function epcMeetsMinRating(
  actual: string | null | undefined,
  minimum: string | undefined
): boolean {
  if (!minimum) return true;
  if (!actual) return false;
  return EPC_ORDER.indexOf(actual as (typeof EPC_ORDER)[number]) <=
    EPC_ORDER.indexOf(minimum as (typeof EPC_ORDER)[number]);
}

// ---------------------------------------------------------------------------
// Stub adapter — ships with the reference implementation.
// Returns realistic example data so you can test MCP tool calls immediately.
// Replace with your own adapter for production use.
// ---------------------------------------------------------------------------

export class StubRegistryAdapter implements RaiaRegistryAdapter {
  private readonly stubProperties: PropertyCard[] = [
    {
      raia_id: "prop-gb-rlf-000031",
      raia_version: "0.2",
      rebuilt_at: new Date().toISOString(),
      agent_card_url:
        "https://app.estateaigents.com/.well-known/raia-agent.json",
      transaction_type: "LETTINGS",
      status: "AVAILABLE",
      property_type: "FLAT",
      location: {
        district: "Hammersmith",
        postcode_district: "W6",
        un_locode: "GBLON",
        lat: 51.4927,
        lng: -0.2228,
      },
      headline: "1-bed flat, Hammersmith W6",
      description:
        "A well-presented one-bedroom flat on the second floor of a purpose-built block. Close to Hammersmith tube station and the Thames riverside walk.",
      bedrooms: 1,
      bathrooms: 1,
      reception_rooms: 1,
      floor_area_sqm: 48,
      available_from: "2026-07-01",
      asking_rent_pcm: 1950,
      rent_frequency: "MONTHLY",
      currency: "GBP",
      deposit: 2250,
      furnishing: "FURNISHED",
      parking: ["RESIDENTS_PERMIT"],
      outside_space: ["COMMUNAL_GARDEN"],
      epc_rating: "C",
      features: [
        "Second floor",
        "Purpose-built block",
        "Close to tube",
        "Double bedroom",
        "Modern kitchen",
      ],
      media: {
        photos: [
          {
            url: "https://app.estateaigents.com/media/prop-gb-rlf-000031/photo-1.jpg",
            caption: "Living room",
            order: 0,
          },
          {
            url: "https://app.estateaigents.com/media/prop-gb-rlf-000031/photo-2.jpg",
            caption: "Bedroom",
            order: 1,
          },
        ],
        floorplans: [
          {
            url: "https://app.estateaigents.com/media/prop-gb-rlf-000031/floorplan.jpg",
            caption: "Floor plan",
            order: 0,
          },
        ],
      },
      listing_agent: {
        name: "RentLondonFlat",
        raia_id: "org-gb-rlf",
        verified: true,
      },
      enquiry_endpoint:
        "https://app.estateaigents.com/api/raia/enquiry",
      session_ttl_hours: 24,
    },
    {
      raia_id: "prop-gb-rlf-000032",
      raia_version: "0.2",
      rebuilt_at: new Date().toISOString(),
      agent_card_url:
        "https://app.estateaigents.com/.well-known/raia-agent.json",
      transaction_type: "SALES",
      status: "AVAILABLE",
      property_type: "SEMI_DETACHED",
      location: {
        district: "Battersea",
        postcode_district: "SW11",
        un_locode: "GBLON",
        lat: 51.4764,
        lng: -0.1543,
      },
      headline: "3-bed semi-detached, Battersea SW11",
      description:
        "A spacious three-bedroom Victorian semi-detached house with a large rear garden. Recently refurbished throughout. 0.4 miles from Clapham Junction station.",
      bedrooms: 3,
      bathrooms: 2,
      reception_rooms: 2,
      floor_area_sqm: 120,
      asking_price: 895000,
      currency: "GBP",
      tenure: "FREEHOLD",
      parking: ["OFF_STREET"],
      outside_space: ["PRIVATE_GARDEN"],
      epc_rating: "D",
      features: [
        "Victorian conversion",
        "Large rear garden",
        "Off-street parking",
        "Recently refurbished",
        "Close to Clapham Junction",
      ],
      media: {
        photos: [
          {
            url: "https://app.estateaigents.com/media/prop-gb-rlf-000032/photo-1.jpg",
            caption: "Front of property",
            order: 0,
          },
        ],
      },
      listing_agent: {
        name: "RentLondonFlat",
        raia_id: "org-gb-rlf",
        verified: true,
      },
      enquiry_endpoint:
        "https://app.estateaigents.com/api/raia/enquiry",
      session_ttl_hours: 720,
    },
  ];

  async searchProperties(params: SearchInput): Promise<PropertyCard[]> {
    let results = this.stubProperties.filter((p) => {
      if (p.location.un_locode !== params.un_locode) return false;
      if (p.transaction_type !== params.transaction_type) return false;
      if (params.property_type && p.property_type !== params.property_type)
        return false;
      if (params.min_bedrooms != null && (p.bedrooms ?? 0) < params.min_bedrooms)
        return false;
      if (params.max_bedrooms != null && (p.bedrooms ?? 0) > params.max_bedrooms)
        return false;
      if (
        params.max_rent_pcm != null &&
        p.asking_rent_pcm != null &&
        p.asking_rent_pcm > params.max_rent_pcm
      )
        return false;
      if (
        params.min_rent_pcm != null &&
        p.asking_rent_pcm != null &&
        p.asking_rent_pcm < params.min_rent_pcm
      )
        return false;
      if (
        params.max_price != null &&
        p.asking_price != null &&
        p.asking_price > params.max_price
      )
        return false;
      if (
        params.min_price != null &&
        p.asking_price != null &&
        p.asking_price < params.min_price
      )
        return false;
      if (params.tenure && p.tenure !== params.tenure) return false;
      if (params.furnishing && p.furnishing !== params.furnishing) return false;
      if (
        params.epc_min_rating &&
        !epcMeetsMinRating(p.epc_rating, params.epc_min_rating)
      )
        return false;
      if (params.min_floor_area_sqm != null && (p.floor_area_sqm ?? 0) < params.min_floor_area_sqm)
        return false;
      if (
        params.parking?.length &&
        !params.parking.every((req) => p.parking?.includes(req))
      )
        return false;
      if (
        params.outside_space?.length &&
        !params.outside_space.every((req) => p.outside_space?.includes(req))
      )
        return false;
      return true;
    });

    return results.slice(0, params.limit ?? 10);
  }

  async getProperty(raiaId: string): Promise<PropertyCard | null> {
    return this.stubProperties.find((p) => p.raia_id === raiaId) ?? null;
  }

  async verifyAgent(raiaId: string): Promise<VerifyAgentResult> {
    const stubAgents: Record<string, VerifyAgentResult> = {
      "org-gb-rlf": {
        raia_id: "org-gb-rlf",
        name: "RentLondonFlat",
        verified: true,
        status: "ACTIVE",
        compliance_signals: {
          GB: {
            bodies: [
              {
                name: "ARLA Propertymark",
                membership_id: "M12345",
                verify_url: "https://arla.co.uk/find-a-member",
                expiry: "2027-03-31",
              },
              {
                name: "TPO",
                membership_id: "TPO-67890",
                verify_url: "https://www.tpos.co.uk",
                expiry: null,
              },
            ],
            client_money_protection: true,
            redress_scheme: "TPO",
          },
        },
        registry_admitted: "2026-04-01",
        mcp_endpoint: "https://app.estateaigents.com/mcp",
        enquiry_endpoint: "https://app.estateaigents.com/api/raia/enquiry",
        checked_at: new Date().toISOString(),
      },
    };

    return (
      stubAgents[raiaId] ?? {
        raia_id: raiaId,
        name: "Unknown",
        verified: false,
        status: "NOT_FOUND" as const,
        checked_at: new Date().toISOString(),
      }
    );
  }

  async createViewingEnquiry(params: {
    propertyRaiaId: string;
    buyerAgentRaiaId: string;
    proposedSlots: Array<{ start: string; end: string }>;
    viewingType: "IN_PERSON" | "VIRTUAL";
    qualification?: Record<string, unknown>;
  }): Promise<{
    enquiry_id: string;
    state: "IDENTIFIED" | "DATA_GATHERING";
    session_ttl_hours: number;
    expires_at: string;
    enquiry_endpoint: string;
  }> {
    const property = await this.getProperty(params.propertyRaiaId);
    const ttl = property?.session_ttl_hours ?? 24;
    const expiresAt = new Date(Date.now() + ttl * 3600 * 1000).toISOString();

    return {
      enquiry_id: crypto.randomUUID(),
      state: params.qualification ? "DATA_GATHERING" : "IDENTIFIED",
      session_ttl_hours: ttl,
      expires_at: expiresAt,
      enquiry_endpoint:
        property?.enquiry_endpoint ??
        "https://app.estateaigents.com/api/raia/enquiry",
    };
  }
}
