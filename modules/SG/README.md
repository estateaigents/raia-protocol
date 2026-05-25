# SG Jurisdictional Module - Singapore

## Status

Initial implementer module. Local counsel review is required before production transactions.

## Applicable Regulations and Authorities

- Council for Estate Agencies (CEA)
- Personal Data Protection Act 2012 (PDPA)
- Residential Property Act, including foreign ownership controls
- Inland Revenue Authority of Singapore (IRAS), including BSD/ABSD tax treatment
- Urban Redevelopment Authority (URA) planning/use restrictions
- Monetary Authority of Singapore (MAS) AML/CFT expectations for regulated counterparties

## Accepted Compliance Bodies

| Body | Type | Verify at |
|---|---|---|
| CEA | Mandatory estate agent/salesperson licensing | cea.gov.sg |
| SEAA | Professional association | seaa.org.sg |
| SISV | Surveyor/valuer professional body | sisv.org.sg |

## Property Compliance Signals

| Signal | Type | Level | Notes |
|---|---|---|---|
| `cea_agency_licence` | string | Agent | Agency licence number |
| `cea_salesperson_registration` | string | Agent | Salesperson registration where an individual is represented |
| `foreign_buyer_restriction_applies` | boolean | L0 | Residential Property Act restrictions |
| `absd_applicable` | boolean | L0/L3 | Buyer-specific ABSD requires L3 transaction context |
| `hdb_eligibility_required` | boolean | L0/L2 | HDB transactions require eligibility checks |
| `minimum_occupation_period_applies` | boolean | L0 | HDB/private restrictions where applicable |

## Data Handling

Singapore PDPA requires purpose limitation, consent, notification, access/correction handling, and protection obligations for L1+ data. NRIC/passport and financial records must be verifier assertions or hashes in RAIA; raw documents stay outside protocol.

## Lifecycle Status Mapping

| Singapore market term | RAIA status |
|---|---|
| Available | `AVAILABLE` |
| Option issued / Option to Purchase granted | `UNDER_OFFER` |
| Exercised OTP | `SOLD_STC` |
| Tenancy agreed | `LET_AGREED` |
| Reserved | `RESERVED` |
| Withdrawn | `WITHDRAWN` |
| Off market / Completed | `OFF_MARKET` |
