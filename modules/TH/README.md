# TH Jurisdictional Module - Thailand

## Status

Draft implementer module. Local counsel review is required before production transactions.

## Applicable Regulations

- Condominium Act B.E. 2522, including the 49% foreign ownership quota
- Land Code restrictions on foreign land ownership
- Foreign Business Act B.E. 2542
- Personal Data Protection Act B.E. 2562 (PDPA)
- Foreign Exchange Transaction (FET) certificate requirements for qualifying foreign remittances
- Anti-Money Laundering Act and AMLO reporting obligations

## Accepted Compliance Bodies

| Body | Type | Notes |
|---|---|---|
| REA Thailand | Professional association | Broker/agency professional signal |
| FIABCI Thailand | International federation | International real estate federation |
| TREBA | Thai Real Estate Broker Association | Broker association |
| AREA | Agency for Real Estate Affairs | Market data and valuation signal |

## Ownership and Tenure

Thailand property transactions must distinguish ownership structure more explicitly than GB listings.

| RAIA tenure | Thailand meaning | Production handling |
|---|---|---|
| `FREEHOLD` | Condominium unit freehold title, usually possible for foreigners only inside the foreign quota | Require foreign quota verification before accepting foreign buyer offer |
| `LEASEHOLD` | Leasehold interest, commonly 30 years with renewal options documented separately | Disclose registered lease term, renewal option status, and registration requirement |
| `OTHER` extension | House/villa structure where foreign buyer owns building but not land, or BOI/company structures | Treat as jurisdiction extension until core schema adds explicit TH tenure values |

Most foreign-buyer condo purchases are either freehold condo units inside the 49% quota or 30-year leasehold structures. Listings MUST NOT imply land freehold ownership for foreign buyers unless a legally valid structure is documented.

## Property Compliance Signals

| Signal | Type | Level | Notes |
|---|---|---|---|
| `foreign_ownership_quota_available` | boolean | L0 | True only when building quota has current capacity |
| `condo_quota_pct_remaining` | number | L0 | Remaining foreign quota percentage in the building |
| `quota_checked_at` | date-time | L0 | Timestamp of latest building juristic-person/developer confirmation |
| `quota_source` | string | L0 | `juristic_person`, `developer`, `land_office`, or `agent_attestation` |
| `fet_gateway_required` | boolean | L0/L3 | Required for foreign buyer remittance workflows |
| `lease_term_years` | integer | L0 | Usually 30 for registered residential leasehold |
| `lease_renewal_options_disclosed` | boolean | L0 | Renewal promises must be disclosed separately from registered lease term |

## Foreign Quota Verification Flow

1. Listing agent obtains the building total saleable area and current foreign-owned saleable area from the condominium juristic person, developer, or Land Office record.
2. Agent calculates `condo_quota_pct_remaining`.
3. Agent records `quota_source` and `quota_checked_at`.
4. If a foreign buyer submits an offer, the agent refreshes quota before moving the enquiry to `AWAITING_HUMAN_ASSERTION`.
5. If quota is exhausted, `foreign_ownership_quota_available=false` and the offer must be redirected to leasehold or Thai-quota buyer handling.

Quota data older than 7 calendar days SHOULD be treated as stale for active foreign-buyer negotiations.

## PDPA Data Minimisation

Thailand PDPA applies to L1+ personal data.

| Level | TH handling |
|---|---|
| L0 | Public listing data only. Approximate location is permitted; do not expose unit number before COMMITTED. |
| L1 | Contact data requires clear purpose and `ct_l1_` consent. Collect only viewing/enquiry fields needed for the next step. |
| L2 | Identity, passport, visa, and address assertions must be verifier assertions or hashes. Do not transmit raw passport images through RAIA. |
| L3 | FET certificate references, proof-of-funds assertions, and payment references may be carried as hashes/references only. Raw bank documents stay with regulated providers. |

Cross-border disclosure outside Thailand requires a PDPA transfer basis and must be reflected in `data_residency`.

## Listing Lifecycle Status Mapping

| Thailand market term | RAIA status | Notes |
|---|---|---|
| Available / For rent / For sale | `AVAILABLE` | Actively marketed |
| Reserved / Booking paid | `RESERVED` | Reservation or booking deposit received |
| Offer accepted | `UNDER_OFFER` | Accepted commercially, not yet complete |
| Sold / Transfer complete | `OFF_MARKET` | Remove from active marketing |
| Rented / Lease signed | `LET_AGREED` | Letting agreed or signed, depending provider feed |
| Withdrawn | `WITHDRAWN` | Removed by owner/agent |
| Off market | `OFF_MARKET` | Not currently marketed |

## L2/L3 Notes

- L2 KYC should carry passport/Thai ID verification as verifier assertions.
- L3 proof-of-funds should include FET certificate reference hashes where applicable.
- Foreign-currency remittance metadata belongs in L3 `payment_refs` or `source_of_funds`, never in public listing metadata.
