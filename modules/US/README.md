# US Jurisdictional Module - United States

## Status

Initial federal overlay. State modules are required for production because licensing, agency, disclosures, escrow, and tenancy rules are state-specific.

## Applicable Federal Frameworks

- Fair Housing Act
- RESPA and TILA-RESPA Integrated Disclosure where applicable
- Bank Secrecy Act / FinCEN AML rules where applicable
- OFAC sanctions screening
- GLBA safeguards for financial data
- State privacy laws such as CCPA/CPRA, VCDPA, CPA, CTDPA, and others where applicable

## Accepted Compliance Bodies

| Body | Type | Notes |
|---|---|---|
| State real estate commission/licensing board | Mandatory licensing | Required per state |
| NAR | Professional association | Optional Realtor signal |
| MLS membership | Market access/compliance signal | Local MLS-specific |
| State escrow/title regulator | Transaction signal | Where escrow/title is in scope |

## Property Compliance Signals

| Signal | Type | Level | Notes |
|---|---|---|---|
| `state_license_number` | string | Agent | Required for listing/receiving enquiries |
| `mls_id` | string | L0 | Optional listing source identifier |
| `fair_housing_reviewed` | boolean | L0 | Marketing text reviewed for prohibited criteria |
| `hoa_applicable` | boolean | L0 | HOA/condo association applies |
| `hoa_fee_amount` | number | L0 | Public where marketed |
| `ofac_clear` | boolean | L2 | Standard screening assertion |
| `financing_preapproval_hash` | string | L2/L3 | Assertion/reference only |

## Data Handling

L1+ personal data must observe applicable state privacy laws and GLBA where financial data is involved. SSNs, bank statements, credit reports, and identity documents are never transmitted in RAIA payloads. Use L2 verifier assertions and L3 proof-of-funds/payment references.

## Lifecycle Status Mapping

| US market term | RAIA status |
|---|---|
| Active | `AVAILABLE` |
| Active under contract / Pending continue to show | `UNDER_OFFER` |
| Pending | `SOLD_STC` |
| Contingent | `SOLD_STC` |
| Reserved | `RESERVED` |
| Leased / Application accepted | `LET_AGREED` |
| Withdrawn | `WITHDRAWN` |
| Closed / Expired / Cancelled | `OFF_MARKET` |

## Required State Overlays

Production implementations MUST add a state overlay for licence verification, agency disclosures, escrow/title practice, tenancy law, and local privacy obligations. Suggested path: `/modules/US/{STATE}/README.md`.
