export type TransactionType = "LETTINGS" | "SALES";
export type DataLevel = 0 | 1 | 2 | 3;
export type EnquiryState =
  | "IDENTIFIED"
  | "DATA_GATHERING"
  | "AWAITING_HUMAN_ASSERTION"
  | "COMMITTED"
  | "SETTLED"
  | "WITHDRAWN"
  | "EXPIRED";

export interface RaiaClientConfig {
  baseUrl: string;
  apiKey?: string;
  agentId?: string;
  fetchImpl?: typeof fetch;
}

export interface SearchInput {
  un_locode: string;
  transaction_type: TransactionType;
  property_type?: string;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_rent_pcm?: number;
  max_rent_pcm?: number;
  min_price?: number;
  max_price?: number;
  currency?: string;
  available_from?: string;
  furnishing?: string;
  parking?: string[];
  outside_space?: string[];
  tenure?: string;
  epc_min_rating?: string;
  min_floor_area_sqm?: number;
  term_months?: number;
  limit?: number;
}

export interface PropertyCard {
  raia_id: string;
  transaction_type: TransactionType;
  status: string;
  location: Record<string, unknown>;
  headline: string;
  listing_agent: { name: string; raia_id: string; verified: boolean };
  enquiry_endpoint: string;
  [key: string]: unknown;
}

export interface VerifyAgentResult {
  raia_id: string;
  name: string;
  verified: boolean;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED" | "NOT_FOUND";
  checked_at: string;
  [key: string]: unknown;
}

export interface ViewingRequest {
  property_raia_id: string;
  buyer_agent_raia_id: string;
  proposed_slots: Array<{ start: string; end: string }>;
  viewing_type?: "IN_PERSON" | "VIRTUAL";
  qualification?: Record<string, unknown>;
}

export interface ViewingResult {
  enquiry_id: string;
  state: "IDENTIFIED" | "DATA_GATHERING";
  session_ttl_hours: number;
  expires_at: string;
  enquiry_endpoint: string;
}

export interface ConsentTokenRequest {
  data_subject_id: string;
  audience: string;
  purpose: string;
  level: Exclude<DataLevel, 0>;
  property_ref: string;
  scopes: string[];
  expires_in_seconds?: number;
}

export interface ConsentTokenResponse {
  token: string;
  token_type: "Bearer";
  level: Exclude<DataLevel, 0>;
  scopes: string[];
  issued_at: string;
  expires_at: string;
}

export class RaiaClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly agentId?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: RaiaClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.apiKey = config.apiKey;
    this.agentId = config.agentId;
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async search(input: SearchInput): Promise<PropertyCard[]> {
    const json = await this.request<{ properties?: PropertyCard[] } | PropertyCard[]>(
      "/properties/search",
      { method: "POST", body: JSON.stringify(input) }
    );
    return Array.isArray(json) ? json : json.properties ?? [];
  }

  async getProperty(raiaId: string): Promise<PropertyCard | null> {
    return this.request<PropertyCard | null>(
      `/properties/${encodeURIComponent(raiaId)}`,
      { method: "GET" },
      [404]
    );
  }

  async verifyAgent(raiaId: string): Promise<VerifyAgentResult> {
    return this.request<VerifyAgentResult>(
      `/agents/${encodeURIComponent(raiaId)}/verify`,
      { method: "GET" }
    );
  }

  async requestViewing(input: ViewingRequest): Promise<ViewingResult> {
    return this.request<ViewingResult>("/enquiries/viewings", {
      method: "POST",
      body: JSON.stringify({
        viewing_type: "IN_PERSON",
        ...input,
      }),
    });
  }

  async issueConsentToken(input: ConsentTokenRequest): Promise<ConsentTokenResponse> {
    return this.request<ConsentTokenResponse>("/consent-tokens", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  private async request<T>(
    path: string,
    init: RequestInit,
    nullStatuses: number[] = []
  ): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    if (init.body) headers.set("content-type", "application/json");
    if (this.apiKey) headers.set("authorization", `Bearer ${this.apiKey}`);
    if (this.agentId) headers.set("x-raia-agent-id", this.agentId);

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (nullStatuses.includes(response.status)) return null as T;
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`RAIA request failed ${response.status} ${response.statusText}: ${text}`);
    }

    return (await response.json()) as T;
  }
}
