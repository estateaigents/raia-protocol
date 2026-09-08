# GLOSSARY — Canonical RAIA Nomenclature

**Status:** Single source of truth for RAIA estate nouns. Approved 2026-09-08.
**Scope:** Public vocabulary for the RAIA Protocol and all implementations of it.
**Grounding:** Every term below is verified against the reference implementation's
live database schema (`information_schema.columns`, public schema, probed
read-only 2026-09-08) and cross-checked against the protocol schemas in
[`/schemas/`](schemas/). No term in this file is invented; where the protocol and
an implementation disagree, the protocol term is canonical and the implementation
column is listed as its home.

**Why this file exists.** Nomenclature drift is expensive. In the reference
implementation, six divergent copies of the address matcher grew out of synonym
drift between "property", "asset", "unit", "address", "listing" and "estate"
(see internal ADR-321). One shared, small, stable vocabulary is cheaper than
six reconciliations.

**Change control.** Adding, renaming or deleting a term in this file is an
ADR-class decision and requires approval from the protocol steward. Do not edit
this file in a drive-by PR.

---

## Format

| Canonical name | Definition | Where it lives | FORBIDDEN SYNONYMS |
|---|---|---|---|

"Where it lives" gives the protocol artifact (schema field, enum value) and/or
the reference-implementation table/column. Table names are the reference
implementation's internal layout and are shared as orientation for implementers,
not as part of the protocol contract.

---

## 1. Actors (people)

| Canonical name | Definition | Where it lives | FORBIDDEN SYNONYMS |
|---|---|---|---|
| **person** | Any individual human known to an implementation — tenant, landlord, buyer, vendor, guarantor, contractor contact, staff member. The single entity for all natural persons; role is carried by links, not by the record itself. | `tbl_persons` (PK `person_id`); roles in `tbl_ref_persons_roles`, links in `tbl_tenancies_persons`, `tbl_organisations_persons`, `tbl_persons_relationships` | contact, lead (as a record type), customer, user, client-record |
| **lead** | A *status* of a person: not yet qualified or engaged. Not a separate record type. | `tbl_persons.status` = `lead`; `tbl_ref_person_statuses.slug` = `lead` | prospect, enquiry-person, contact |
| **tenant** | A person holding occupation under a tenancy. A *role*, not a record type. Lead tenant and co-tenants are distinguished on the tenancy link. | `tbl_tenancies_persons.role` ∈ {`lead_tenant`, `co_tenant`} | renter, resident, occupier (as record type), lessee |
| **guarantor** | A person guaranteeing a tenant's obligations under a tenancy. | `tbl_tenancies_persons.role` = `guarantor`; `tbl_ref_relationship_types.slug` = `guarantor_for` | guaranteer, sponsor, co-signer |
| **landlord** | The owner (or owner's organisation) granting a tenancy. Ownership is a link to an asset, not a person attribute. | `tbl_asset_ownership` (`person_id` / `owner_organisation_id`, `ownership_type_id` → `tbl_ref_ownership_types`) | lessor, host (except in the front-line staff sense — see reference implementation's `hosts` role), property-owner (as a record type) |
| **vendor** | The person selling an asset in a sale transaction. | `tbl_sales.vendor_person_id` | seller, owner-seller |
| **buyer** | The person purchasing an asset in a sale transaction. | `tbl_sales.buyer_person_id` | purchaser, applicant |
| **estate agent** | A licensed property professional or their AI representative; the protocol-side actor that publishes listings and answers enquiries. | SPEC §2.1 `estate_agent`; organisations of `tbl_ref_organisation_types.slug` = `estate_agent` / `client_estate_agent`; registry `tbl_raia_agent_registry` | letting agent, listing broker, agency (as a person) |
| **buyer agent** | A personal AI assistant acting on behalf of a buyer or tenant. Never exposes end-client identity in protocol messages (qualification signals only). | SPEC §2.1 `buyer_agent`; `enquiry.json → buyer_agent`; `tbl_raia_enquiries.buyer_agent_raia_id` | tenant-agent, consumer-bot, client-agent |
| **listing agent** | The estate agent responsible for a given property card. Renamed from `letting_agent` in v0.2 — the old name is dead. | `property.json → listing_agent` | letting_agent (v0.1, forbidden since v0.2), advertising agent |

## 2. Actors (organisations)

| Canonical name | Definition | Where it lives | FORBIDDEN SYNONYMS |
|---|---|---|---|
| **organisation** | Any legal or trading entity: agency, landlord company, portal, utility, solicitor, SPV, local authority, developer, block manager. Type is a classification, not a separate table. | `tbl_organisations` (PK `organisation_id`); types in `tbl_ref_organisation_types` (21 slugs: `portal`, `estate_agent`, `client_estate_agent`, `trade_body`, `utility`, `building_management`, `property_management`, `landlord_company`, `service_platform`, `spv`, `residents_association`, `local_authority`, `solicitor`, `accountant`, `employer`, `limited_company`, `developer`, `contractor`, `block_manager`, `plc`) | company, account, tenant-org, agency (as a record type) |
| **org slug** | Short URL-safe identifier for an organisation, used inside `raia_id`. | `tbl_organisations.slug`; `raia_id` format `prop-{jurisdiction}-{org-slug}-{sequence}` | org-code, agency-code |
| **portal** | A property advertising platform that receives or serves listings. | `tbl_portals`, `tbl_portal_registry`; `tbl_ref_organisation_types.slug` = `portal` | property portal site, marketplace, listing site |
| **jurisdiction** | ISO 3166-1 alpha-2 country/region code governing a property, organisation or transaction. Drives compliance modules (`/modules/`). | `property.json`, `enquiry.json` field `jurisdiction`; `tbl_organisations.jurisdiction`; `tbl_ref_jurisdictions` | region, country-code, territory |
| **UN/LOCODE** | UN/LOCODE city code (e.g. `GBLON`, `THBKK`) identifying a property's market area. Required on every search. | SPEC §4 `un_locode`; `tbl_assets.un_locode`, `tbl_addresses.un_locode` | city-code, market-code, locode |

## 3. Real estate objects

| Canonical name | Definition | Where it lives | FORBIDDEN SYNONYMS |
|---|---|---|---|
| **asset** | The durable real-world thing being transacted: a flat, house, commercial unit. Survives across listings, tenancies and sales. The internal anchor entity. | `tbl_assets` (PK `asset_id`, `asset_ref`, `asset_status_id` → `tbl_ref_asset_statuses` ∈ {`instructed`, `farming`, `lost`}) | property (as internal record name), unit, estate, real-estate |
| **property** | The *public-facing* representation of an asset, as exchanged between agents. "Property" is the protocol word; "asset" is the implementation word. Same thing, two layers. | `property.json` (RAIA Property Card, served from `tbl_asset_snapshots.snapshot_listing`); SPEC §2.2 | real-estate, unit, listing-record |
| **listing** | The *marketing state* of an asset at a point in time: status, availability, asking price. An asset may be listed, delisted and relisted many times; the asset persists. | `tbl_listing_status` (per `service_type`), `tbl_listing_availability`, `tbl_asking_rent_long_term`, `tbl_asking_price_sale`; protocol `property.json → status` enum | advert, posting, marketing-record |
| **external listing** | A listing observed on a third-party source (portals, registries), ingested for market data. Not one of the estate's own assets. | `tbl_external_listings` (`source`, `source_listing_id`, `rent_pcm`, `asking_price`) | scraped-listing, comp, market-listing |
| **development** | A building or multi-unit project containing many assets; may have phases/blocks. | `tbl_developments` (`development_name`, `parent_development_id`, `block_name`, `phase_label`) | project, complex, building (as record type) |
| **address** | The postal/geographic location of an asset. Address is a separate entity so the matcher is single-sourced. | `tbl_addresses` (PK `address_id`, `unit_number`, `building_name`, `street_name`, `postcode`, `un_locode`, `location` geography) | location-record, site, premise |
| **raia_id** | Stable external property identifier. Format `prop-{jurisdiction}-{org-slug}-{sequence}`, e.g. `prop-gb-rlf-000031`. | SPEC §2.2; `property.json → raia_id` pattern; `tbl_assets.raia_id` | property-id, external-ref, listing-id |
| **property type** | Physical classification of an asset. Protocol enum is the public vocabulary; implementation reference table extends it. | `property.json → property_type` (FLAT, APARTMENT, TERRACED, …); `tbl_ref_asset_property_types` (17 slugs: `apartment`, `flat`, `detached-house`, `cottage`, `bungalow`, `villa`, `studio`, `office`, `semi-detached-house`, `home-office`, `commercial-building`, `town-house`, `condo`, `showroom`, `factory`, `warehouse`, `unknown`) | building-type, dwelling-type |

## 4. Transactions

| Canonical name | Definition | Where it lives | FORBIDDEN SYNONYMS |
|---|---|---|---|
| **enquiry** | The full transaction lifecycle between a buyer agent and a listing agent about one property — from first interest to completion or close. Level-gated data envelope (L0 public, L1 enquiry, L2 KYC, L3 AML). | `enquiry.json` (v0.2.0); SPEC §5; `tbl_raia_enquiries` (PK `enquiry_id`, `state`), `tbl_enquiry_cases` | lead-record, application, inquiry (US spelling — protocol uses EN spelling) |
| **session** | The stateful exchange window between two agents. TTL: 24 h (lettings) / 30 days (sales). | SPEC §2.3; `enquiry.json → session_ttl_hours`; `tbl_raia_enquiries.session_ttl_hours`, `expires_at` | conversation, thread, dialog |
| **transaction_type** | Whether a property/enquiry is a letting or a sale. Enum `LETTINGS` \| `SALES`. Required since v0.2. Drives price field, TTL and compliance signals. | `property.json`, `enquiry.json → transaction_type`; `tbl_raia_enquiries.transaction_type` | deal-type, market, channel |
| **tenancy** | The contractual occupation of an asset by one or more persons for a term. The lettings-side transaction record. | `tbl_tenancies` (PK `tenancy_id`, `tenancy_type` ∈ {`ast`, `short_let`, `other`}, `tenancy_status`, `tenancy_stage`, `rent_pcm_*`) | lease (as record name), rental, letting-contract, occupancy-agreement |
| **tenancy status** | Lifecycle state of a tenancy. | `tbl_ref_tenancy_statuses`: `offered`, `agreed`, `active`, `arrears`, `moving_out`, `evicting`, `deposit_return`, `debt_collection`, `completed`, `cancelled`, `withdrawn`, `other` | tenancy-state, lease-status |
| **tenancy stage** | Operational pipeline stage of a tenancy (orthogonal to status). | `tbl_ref_tenancy_stages`: `referencing`, `holding_deposit`, `moving_in`, `periodic`, `moving_out`, `notice_served`, `arrears_notice`, `deposit_return_initiated`, `debt_referred`, `completed`, `cancelled`, `withdrawn`, `paused`, `other` | tenancy-phase, workflow-step |
| **sale** | The sales-side transaction record for an asset, from listing to completion. | `tbl_sales` (PK `sale_id`, `agreed_price`, `exchange_date`, `completion_date`) | purchase, conveyance, deal |
| **agreement** | A service contract between an organisation and a counterparty (person or organisation) covering fees and service scope — e.g. a landlord instruction. Not a tenancy. | `tbl_service_agreements` (PK `agreement_id`, `counterparty_type` ∈ {`person`, `organisation`}, `lifecycle_status` ∈ {`in_force`, `depleted`}); linked assets via `tbl_service_agreement_assets` | contract (ambiguous — tenancy is also a contract), mandate, engagement-letter |
| **deposit** | The security deposit held against a tenancy, with scheme protection tracking. | `tbl_deposits` (`deposit_amount`, `deposit_scheme`, `protection_status`); `tbl_ref_tenancy_deposit_protection` ∈ {`protected`, `not_protected`, `not_required`, `unprotected`, `unknown`} | bond, security-money, damage-deposit |
| **rent** | A scheduled rent obligation/payment line for a tenancy period. | `tbl_rents` (`amount_due`, `due_date`, `period_start`, `period_end`, `amount_received`) | payment, invoice, charge |
| **rent review** | A recorded reassessment of the rent for a tenancy/asset with an effective date. | `tbl_rent_reviews` | rent-increase-event, revaluation |
| **notice** | A formal notice served on a tenancy (e.g. possession ground notice). | `tbl_serving_notices` (`ground`, `service_date`, `expiry_date`, `status`) | eviction-notice (too narrow), letter |
| **referencing** | The vetting process run on prospective tenants before agreement. | `tbl_referencing_runs`, `tbl_referencing_checks`; `tbl_ref_tenancy_stages.slug` = `referencing` | screening, vetting (except in social-vetting context), background-check |

## 5. Consent, identity & trust

| Canonical name | Definition | Where it lives | FORBIDDEN SYNONYMS |
|---|---|---|---|
| **data level** | The privacy tier of an exchange: L0 public listing context, L1 enquiry data, L2 KYC assertions, L3 AML/proof-of-funds. | SPEC §7; `enquiry.json` L0–L3 envelopes | privacy-tier, clearance, data-class |
| **consent token** | Scoped, signed JWT authorising L1+ data exchange, issued by the data subject or an authorised buyer agent. Non-transferable, level-specific. | SPEC §7 `POST /consent-tokens`; pattern `ct_l[123]_…`; `tbl_raia_consent_tokens` | auth-token, permission-slip, access-token |
| **agent credential** | W3C Verifiable Credential summary issued by the RAIA registry attesting an agent's verified status and max permitted data level. | `enquiry.json → registry_credential`; `tbl_raia_agent_registry.verification_status` | certificate, badge, licence-record |
| **registry** | The public registry of verified RAIA agent cards. | `estateaigents.org/registry`; `tbl_raia_agent_registry` | directory, index, agent-list |
| **identity verification** | Confirmation of a person's identity document and biometrics, tracked per person. | `tbl_persons.identity_verified`, `biometric_status`; `tbl_persons_identity` | KYC-check (KYC is the L2 *envelope*; verification is the act), IDV-record |

## 6. Documents, media & comms

| Canonical name | Definition | Where it lives | FORBIDDEN SYNONYMS |
|---|---|---|---|
| **document** | A stored file with business meaning (contract, certificate, statement, ID). Scoped to person / property / ownership / occupancy. | `tbl_documents` (`doc_scope` ∈ {`person`, `property`, `ownership`, `occupancy`}, `document_type_id` → `tbl_ref_document_types`) | file, attachment, upload |
| **media** | Photos, video and other rich media of an asset or development. | `tbl_media` (`media_type_id`, `media_status_id`) | image, photo-record, asset-media (as name) |
| **conversation** | A threaded comms exchange on any channel (email, chat, voice) involving persons and organisations. | `tbl_conversations`; participants in `tbl_conversation_parties` | thread (session is the protocol word), message-log, ticket |

## 7. Reference data conventions

| Convention | Rule |
|---|---|
| **Reference tables** | Enumerations live in `tbl_ref_*` tables with stable `slug` keys and i18n labels. Slugs are the canonical machine vocabulary; labels are display-only. Never fork an enum into code constants. |
| **Soft delete** | Core entities carry `deleted_at`. A row with `deleted_at` set is gone for all protocol purposes. |
| **Legacy links** | `legacy_id` / `legacy_*` columns carry pre-migration identifiers. They are provenance, never canonical keys. |
| **Test records** | Rows flagged `is_test_record` must never appear in protocol exchanges. |

---

## Drift rules

1. Use the canonical name in code, schemas, docs and commit messages. Forbidden
   synonyms above are lint-worthy in new work.
2. "Property" when speaking protocol, "asset" when speaking implementation.
   Never coin a third word.
3. Enums extend via the reference tables (ADR-class), never via hardcoded
   strings in a new service.
4. If you need a noun not in this file, that is a schema decision: raise it,
   don't improvise it.

*Grounded 2026-09-08 against the live reference schema (381 public tables) and
raia-protocol v0.2 schemas.*
