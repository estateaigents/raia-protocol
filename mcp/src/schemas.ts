/**
 * RAIA Protocol — Zod schemas for all MCP tool inputs and shared output types.
 *
 * These schemas are the TypeScript mirror of the JSON Schemas in /schemas/.
 * Tool input schemas drive MCP tool parameter validation.
 * Output types are returned to the calling AI assistant.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

export const TransactionType = z.enum(["LETTINGS", "SALES"]);

export const PropertyStatus = z.enum([
  "AVAILABLE",
  "UNDER_OFFER",
  "SOLD_STC",
  "SOLD_STCM",
  "RESERVED",
  "LET_AGREED",
  "OFF_MARKET",
  "WITHDRAWN",
]);

export const PropertyType = z.enum([
  "FLAT",
  "APARTMENT",
  "STUDIO",
  "MAISONETTE",
  "TERRACED",
  "END_TERRACE",
  "SEMI_DETACHED",
  "DETACHED",
  "BUNGALOW",
  "COTTAGE",
  "TOWNHOUSE",
  "LAND",
  "COMMERCIAL",
  "OTHER",
]);

export const Tenure = z.enum([
  "FREEHOLD",
  "LEASEHOLD",
  "SHARE_OF_FREEHOLD",
  "COMMONHOLD",
]);

export const Furnishing = z.enum([
  "FURNISHED",
  "PART_FURNISHED",
  "UNFURNISHED",
  "FURNISHED_OR_UNFURNISHED",
]);

export const ParkingOption = z.enum([
  "OFF_STREET",
  "GARAGE",
  "ALLOCATED",
  "RESIDENTS_PERMIT",
  "ON_STREET",
  "NONE",
]);

export const OutsideSpaceOption = z.enum([
  "PRIVATE_GARDEN",
  "COMMUNAL_GARDEN",
  "BALCONY",
  "TERRACE",
  "ROOF_TERRACE",
  "COURTYARD",
  "NONE",
]);

export const EpcRating = z.enum(["A", "B", "C", "D", "E", "F", "G"]);

export const PriceQualifier = z.enum([
  "PRICE_ON_APPLICATION",
  "GUIDE_PRICE",
  "OFFERS_OVER",
  "OFFERS_IN_EXCESS_OF",
  "OFFERS_IN_REGION_OF",
  "FROM",
  "FIXED_PRICE",
]);

// ---------------------------------------------------------------------------
// Shared sub-objects
// ---------------------------------------------------------------------------

export const LocationSchema = z.object({
  district: z.string().nullable(),
  postcode_district: z.string().nullable().optional(),
  un_locode: z.string().regex(/^[A-Z]{2}[A-Z0-9]{3}$/).nullable().optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
});

export const MediaAssetSchema = z.object({
  url: z.string().url(),
  caption: z.string().max(200).optional(),
  order: z.number().int().min(0).optional(),
});

export const MediaSchema = z.object({
  photos: z.array(MediaAssetSchema).max(50).optional(),
  floorplans: z.array(MediaAssetSchema).max(10).optional(),
  epc_documents: z.array(MediaAssetSchema).max(5).optional(),
  virtual_tours: z.array(MediaAssetSchema).max(3).optional(),
  brochures: z.array(MediaAssetSchema).max(3).optional(),
});

export const ListingAgentSchema = z.object({
  name: z.string(),
  raia_id: z.string().regex(/^org-[a-z]{2}-[a-z0-9]+$/),
  verified: z.boolean(),
});

// ---------------------------------------------------------------------------
// PropertyCard — mirrors schemas/property.json
// ---------------------------------------------------------------------------

export const PropertyCardSchema = z.object({
  raia_id: z.string().regex(/^prop-[a-z]{2}-[a-z0-9]+-[0-9]+$/),
  raia_version: z.string().optional(),
  rebuilt_at: z.string().datetime().optional(),
  agent_card_url: z.string().url(),
  transaction_type: TransactionType,
  status: PropertyStatus,
  property_type: PropertyType.nullable().optional(),
  location: LocationSchema,
  headline: z.string().max(150),
  description: z.string().max(5000).nullable().optional(),
  bedrooms: z.number().int().min(0).nullable().optional(),
  bathrooms: z.number().int().min(0).nullable().optional(),
  reception_rooms: z.number().int().min(0).nullable().optional(),
  floor_area_sqm: z.number().min(0).nullable().optional(),
  available_from: z.string().date().nullable().optional(),
  asking_rent_pcm: z.number().min(0).nullable().optional(),
  rent_frequency: z.enum(["WEEKLY", "MONTHLY"]).nullable().optional(),
  asking_price: z.number().min(0).nullable().optional(),
  price_qualifier: PriceQualifier.nullable().optional(),
  currency: z.string().length(3).nullable().optional(),
  deposit: z.number().min(0).nullable().optional(),
  tenure: Tenure.nullable().optional(),
  furnishing: Furnishing.nullable().optional(),
  parking: z.array(ParkingOption).max(5).optional(),
  outside_space: z.array(OutsideSpaceOption).max(5).optional(),
  epc_rating: EpcRating.nullable().optional(),
  features: z.array(z.string()).max(10).optional(),
  media: MediaSchema.optional(),
  listing_agent: ListingAgentSchema,
  enquiry_endpoint: z.string().url(),
  session_ttl_hours: z.number().int().min(1).optional(),
});

export type PropertyCard = z.infer<typeof PropertyCardSchema>;

// ---------------------------------------------------------------------------
// AgentCard — mirrors schemas/agent.json
// ---------------------------------------------------------------------------

export const ComplianceBodySchema = z.object({
  name: z.string(),
  membership_id: z.string(),
  verify_url: z.string().url().nullable().optional(),
  expiry: z.string().date().nullable().optional(),
});

export const ComplianceBundleSchema = z.object({
  bodies: z.array(ComplianceBodySchema).optional(),
  client_money_protection: z.boolean().nullable().optional(),
  redress_scheme: z.string().nullable().optional(),
});

export const AgentCardSchema = z.object({
  raia_id: z.string().regex(/^org-[a-z]{2}-[a-z0-9]+$/),
  raia_version: z.string().optional(),
  name: z.string().max(200),
  website: z.string().url().nullable().optional(),
  jurisdiction: z.string().length(2),
  additional_jurisdictions: z.array(z.string().length(2)).optional(),
  markets: z
    .array(
      z.enum([
        "RESIDENTIAL_LETTINGS",
        "RESIDENTIAL_SALES",
        "COMMERCIAL_LETTINGS",
        "COMMERCIAL_SALES",
      ])
    )
    .min(1),
  coverage: z.array(z.string().regex(/^[A-Z]{2}[A-Z0-9]{3}$/)).optional(),
  compliance: z.record(ComplianceBundleSchema).optional(),
  verified: z.boolean(),
  registry_admitted: z.string().date().nullable().optional(),
  active_listings: z.number().int().min(0).nullable().optional(),
  max_data_level: z.number().int().min(0).max(3).optional(),
  agent_identity_credential: z
    .object({
      credential_id: z.string(),
      issuer: z.string(),
      subject: z.string().regex(/^org-[a-z]{2}-[a-z0-9]+$/),
      max_data_level: z.number().int().min(0).max(3),
      jurisdictions: z.array(z.string().length(2)).min(1),
      data_residency: z.enum(["UK", "EEA", "ADEQUACY", "TH", "SG", "US"]).optional(),
      issued_at: z.string().datetime(),
      expires_at: z.string().datetime(),
      vc_jwt: z.string().optional(),
    })
    .optional(),
  mcp_endpoint: z.string().url(),
  a2a_endpoint: z.string().url().nullable().optional(),
  a2a_agent_card_url: z.string().url().nullable().optional(),
  enquiry_endpoint: z.string().url(),
  consent_endpoint: z.string().url().nullable().optional(),
  contact: z
    .object({
      email: z.string().email().nullable().optional(),
      phone: z.string().nullable().optional(),
      address: z.string().max(300).nullable().optional(),
    })
    .optional(),
  published_at: z.string().datetime().nullable().optional(),
});

export type AgentCard = z.infer<typeof AgentCardSchema>;

// ---------------------------------------------------------------------------
// Tool: raia_search — input parameters (mirrors SPEC.md §4)
// ---------------------------------------------------------------------------

export const SearchInputSchema = z.object({
  un_locode: z
    .string()
    .regex(/^[A-Z]{2}[A-Z0-9]{3}$/)
    .describe(
      "UN/LOCODE city code — required. e.g. GBLON for London, THBKK for Bangkok."
    ),
  transaction_type: TransactionType.describe(
    "LETTINGS or SALES — required."
  ),
  property_type: PropertyType.optional().describe(
    "Filter by property sub-type."
  ),
  min_bedrooms: z.number().int().min(0).optional().describe("Minimum bedrooms."),
  max_bedrooms: z.number().int().min(0).optional().describe("Maximum bedrooms."),
  min_rent_pcm: z
    .number()
    .min(0)
    .optional()
    .describe("Minimum asking rent per calendar month. LETTINGS only."),
  max_rent_pcm: z
    .number()
    .min(0)
    .optional()
    .describe("Maximum asking rent per calendar month. LETTINGS only."),
  min_price: z
    .number()
    .min(0)
    .optional()
    .describe("Minimum asking price. SALES only."),
  max_price: z
    .number()
    .min(0)
    .optional()
    .describe("Maximum asking price. SALES only."),
  currency: z
    .string()
    .length(3)
    .optional()
    .describe("ISO 4217 currency code. Defaults to jurisdiction default."),
  available_from: z
    .string()
    .date()
    .optional()
    .describe(
      "ISO 8601 date — property must be available on or before this date."
    ),
  furnishing: Furnishing.optional().describe(
    "Furnishing preference. LETTINGS only."
  ),
  parking: z
    .array(ParkingOption)
    .optional()
    .describe("Required parking options."),
  outside_space: z
    .array(OutsideSpaceOption)
    .optional()
    .describe("Required outdoor space types."),
  tenure: Tenure.optional().describe("Tenure preference. SALES only."),
  epc_min_rating: EpcRating.optional().describe(
    "Minimum EPC letter rating. C returns C, B, and A."
  ),
  min_floor_area_sqm: z
    .number()
    .min(0)
    .optional()
    .describe("Minimum floor area in square metres."),
  term_months: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Preferred minimum tenancy length in months. LETTINGS only."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(10)
    .describe("Maximum number of results to return. Default 10, max 50."),
});

export type SearchInput = z.infer<typeof SearchInputSchema>;

// ---------------------------------------------------------------------------
// Tool: raia_get_property — input
// ---------------------------------------------------------------------------

export const GetPropertyInputSchema = z.object({
  raia_id: z
    .string()
    .regex(/^prop-[a-z]{2}-[a-z0-9]+-[0-9]+$/)
    .describe(
      "RAIA property identifier. Format: prop-{jurisdiction}-{org-slug}-{sequence}. e.g. prop-gb-rlf-000031."
    ),
});

// ---------------------------------------------------------------------------
// Tool: raia_verify_agent — input / output
// ---------------------------------------------------------------------------

export const VerifyAgentInputSchema = z.object({
  raia_id: z
    .string()
    .regex(/^org-[a-z]{2}-[a-z0-9]+$/)
    .describe(
      "Agent RAIA org identifier. Format: org-{jurisdiction}-{slug}. e.g. org-gb-rlf."
    ),
});

export const VerifyAgentResultSchema = z.object({
  raia_id: z.string(),
  name: z.string(),
  verified: z.boolean(),
  status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED", "NOT_FOUND"]),
  compliance_signals: z.record(ComplianceBundleSchema).optional(),
  registry_admitted: z.string().date().nullable().optional(),
  mcp_endpoint: z.string().url().optional(),
  enquiry_endpoint: z.string().url().optional(),
  checked_at: z.string().datetime(),
});

export type VerifyAgentResult = z.infer<typeof VerifyAgentResultSchema>;

// ---------------------------------------------------------------------------
// Tool: raia_request_viewing — input / output
// ---------------------------------------------------------------------------

export const TimeSlotSchema = z.object({
  start: z.string().datetime().describe("ISO 8601 slot start time."),
  end: z.string().datetime().describe("ISO 8601 slot end time."),
});

export const RequestViewingInputSchema = z.object({
  property_raia_id: z
    .string()
    .regex(/^prop-[a-z]{2}-[a-z0-9]+-[0-9]+$/)
    .describe("The property to request a viewing for."),
  buyer_agent_raia_id: z
    .string()
    .regex(/^org-[a-z]{2}-[a-z0-9]+$/)
    .describe("The buyer/tenant agent's RAIA org identifier."),
  proposed_slots: z
    .array(TimeSlotSchema)
    .min(1)
    .max(3)
    .describe("Up to 3 proposed viewing slots. Estate agent will confirm one."),
  viewing_type: z
    .enum(["IN_PERSON", "VIRTUAL"])
    .default("IN_PERSON")
    .describe("Whether the viewing is in person or virtual."),
  qualification: z
    .object({
      employment_status: z
        .enum([
          "EMPLOYED",
          "SELF_EMPLOYED",
          "CONTRACTOR",
          "RETIRED",
          "STUDENT",
          "NOT_EMPLOYED",
        ])
        .optional(),
      income_band: z
        .enum([
          "BAND_0_25K",
          "BAND_25_50K",
          "BAND_50_75K",
          "BAND_75_100K",
          "BAND_100K_PLUS",
        ])
        .optional(),
      household_size: z.number().int().min(1).optional(),
      has_mortgage_in_principle: z.boolean().optional(),
      is_cash_buyer: z.boolean().optional(),
      is_chain_free: z.boolean().optional(),
      has_pets: z.boolean().optional(),
      move_in_date: z.string().date().optional(),
    })
    .optional()
    .describe("Optional buyer/tenant qualification signals. No PII."),
});

export const RequestViewingResultSchema = z.object({
  enquiry_id: z.string().uuid(),
  property_raia_id: z.string(),
  state: z.enum(["IDENTIFIED", "DATA_GATHERING"]),
  session_ttl_hours: z.number().int(),
  expires_at: z.string().datetime(),
  enquiry_endpoint: z.string().url(),
  message: z.string(),
});

export type RequestViewingResult = z.infer<typeof RequestViewingResultSchema>;
