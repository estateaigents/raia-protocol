# EU Jurisdictional Module - European Union

## Status

Initial EU overlay. Member-state modules are required for production because estate agency licensing, tenancy law, conveyancing, and AML supervision vary by country.

## Applicable EU Frameworks

- GDPR
- eIDAS 2.0 and European Digital Identity Wallet alignment
- AMLD framework and national AML transposition
- Consumer Rights Directive and Unfair Commercial Practices Directive
- Energy Performance of Buildings Directive

## Accepted Compliance Bodies

EU-wide RAIA implementations should use member-state competent authorities and professional bodies. Examples:

| Body | Type | Notes |
|---|---|---|
| National estate agency licensing authority | Mandatory where applicable | Country-specific |
| National AML supervisor/FIU registration | AML compliance | Country-specific |
| RICS Europe | Professional body | Optional signal |
| CEPI member associations | Professional association | Country-specific |

## Property Compliance Signals

| Signal | Type | Level | Notes |
|---|---|---|---|
| `epc_rating` | string | L0 | Energy performance rating; local scale mapping may be required |
| `aml_supervision_registered` | boolean | Agent | Required where estate agents are obliged entities |
| `gdpr_lawful_basis` | string | L1+ | Consent/contract/legitimate-interest basis |
| `eidas_assurance_level` | string | L2 | `substantial` recommended minimum for KYC |
| `cross_border_transfer_basis` | string | L1+ | Required when personal data leaves EEA/adequacy jurisdictions |

## Data Handling

GDPR applies to L1+ personal data. Implementations MUST support field-level minimisation, purpose limitation, consent-token expiry, access/correction workflows, and erasure routing. L3 AML records may be retained where national AML retention law requires it; this must be disclosed at consent time.

## Lifecycle Status Mapping

| EU generic market term | RAIA status |
|---|---|
| Available | `AVAILABLE` |
| Offer made / Negotiating | `UNDER_OFFER` |
| Reserved | `RESERVED` |
| Subject to contract / Pre-contract signed | `SOLD_STC` |
| Let agreed | `LET_AGREED` |
| Withdrawn | `WITHDRAWN` |
| Completed / Off market | `OFF_MARKET` |

## Required Member-State Overlays

Production implementations MUST add member-state overlays for agency licensing, AML supervisor, tenancy law, title/conveyancing practice, tax, and disclosure rules. Suggested path: `/modules/EU/{CC}/README.md`.
