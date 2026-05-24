# GB Jurisdictional Module — United Kingdom

## Status
Draft. Community contributions welcome.

## Applicable regulations

- Renters Rights Act 2026 (APT format mandatory from 1 May 2026; Section 21 notices abolished)
- Housing Act 2004 (HMO licensing — mandatory, additional, selective)
- Immigration Act 2014 / 2016 (Right to Rent — mandatory checks for all new tenancies in England)
- Consumer Protection from Unfair Trading Regulations 2008
- Anti-Money Laundering Regulations 2017
- UK GDPR / Data Protection Act 2018
- Energy Act 2011 / EPC Regulations (EPC mandatory for marketing)

## Accepted compliance bodies

| Body | Type | Verify at |
|---|---|---|
| ARLA Propertymark | Lettings membership | arla.co.uk |
| NAEA Propertymark | Sales membership | naea.co.uk |
| RICS | Professional body | rics.org |
| NALS | Lettings accreditation | nals.org.uk |
| Safe Agent | Client money protection | safeagents.co.uk |
| TPO | Redress scheme (mandatory) | tpos.co.uk |
| PRS | Redress scheme (alternative to TPO) | theprs.co.uk |
| CMP | Client money protection (mandatory) | various |

Both a **redress scheme** (TPO or PRS) and **client money protection** scheme are legally mandatory for all GB lettings agents handling client money.

## Property compliance signals

These fields are expressed in the `property.json` schema and in jurisdiction-specific extensions.

| Signal | Type | Notes |
|---|---|---|
| `epc_rating` | string (A–G) | Mandatory for marketing. Property must have valid EPC before being listed. |
| `requires_council_licence` | boolean | HMO and selective licensing — check local authority requirements |
| `deposit_protected` | boolean | MyDeposits / DPS / TDS — mandatory within 30 days of tenancy start |
| `rra_information_sheet_served` | boolean | Renters Rights Act 2026 — required for existing tenants by 31 May 2026 |
| `council_tax_band` | string (A–H) | Council tax band. Mandatory to display for lettings in England and Wales. |
| `right_to_rent_checked` | boolean | Confirms the agent has conducted Right to Rent checks per Immigration Act 2014. England only. |

### council_tax_band

Valid values: `A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`

Band H is applicable in England and Wales only. Scotland uses A–H with different thresholds. Northern Ireland uses a different rating system.

### right_to_rent_checked

Mandatory for all new residential tenancies in **England** (not Scotland, Wales, or Northern Ireland).

The estate agent or landlord must verify every adult occupant's right to rent before the tenancy start date. The check type (manual document check or digital identity verification via a certified IDSP) must be recorded. RAIA protocol does not transmit the underlying documents — only the boolean signal confirming the check was performed.

## Listing lifecycle status mapping

How standard UK estate agency statuses map to RAIA `status` enum values in `property.json`:

| UK Industry Term | RAIA status | Notes |
|---|---|---|
| Available / To Let / For Sale | `AVAILABLE` | Property is actively marketed |
| Under Offer | `UNDER_OFFER` | Offer received, not yet accepted — sales |
| SSTC / Sold Subject to Contract | `SOLD_STC` | Offer accepted, contracts not exchanged |
| SSTCM / Sold Subject to Contract and Mortgage | `SOLD_STCM` | As SOLD_STC but mortgage also required |
| Reserved | `RESERVED` | New build or off-plan reservation |
| Let Agreed | `LET_AGREED` | Letting agreed subject to referencing |
| Withdrawn | `WITHDRAWN` | Removed from market by agent or landlord |
| Off Market | `OFF_MARKET` | Not currently being marketed |

**Zoopla `life_cycle_status` mapping:**

| Zoopla value | RAIA status |
|---|---|
| `available` | `AVAILABLE` |
| `under_offer` | `UNDER_OFFER` |
| `sold` | `SOLD_STC` |
| `let` | `LET_AGREED` |

**Rightmove `status` field mapping (integer):**

| Rightmove int | Rightmove label | RAIA status |
|---|---|---|
| 1 | Available | `AVAILABLE` |
| 2 | SSTC | `SOLD_STC` |
| 3 | SSTCM | `SOLD_STCM` |
| 4 | Under Offer | `UNDER_OFFER` |
| 5 | Reserved | `RESERVED` |
| 6 | Let Agreed | `LET_AGREED` |

## Price qualifier mapping

How UK price qualifier conventions map to RAIA `price_qualifier` enum:

| UK Term | RAIA price_qualifier |
|---|---|
| POA / Price on Application | `PRICE_ON_APPLICATION` |
| Guide Price | `GUIDE_PRICE` |
| Offers Over | `OFFERS_OVER` |
| Offers in Excess of | `OFFERS_IN_EXCESS_OF` |
| Offers in the Region of | `OFFERS_IN_REGION_OF` |
| From | `FROM` |
| Fixed Price | `FIXED_PRICE` |

## Tenure mapping

| UK Term | RAIA tenure |
|---|---|
| Freehold | `FREEHOLD` |
| Leasehold | `LEASEHOLD` |
| Share of Freehold | `SHARE_OF_FREEHOLD` |
| Commonhold | `COMMONHOLD` |

## Furnishing mapping

Applies to LETTINGS only.

| UK / Zoopla Term | RAIA furnishing |
|---|---|
| Furnished | `FURNISHED` |
| Part-furnished | `PART_FURNISHED` |
| Unfurnished | `UNFURNISHED` |
| Furnished or Unfurnished | `FURNISHED_OR_UNFURNISHED` |
