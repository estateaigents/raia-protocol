# RAIA Protocol — Security & Data Privacy Architecture
## Version 0.2 - Implementer Release

**Published:** May 2026
**Status:** Implementer release. L0-L3 schema envelopes, consent-token contract, and Agent Identity Credential fields are published for v0.2 pilots. Subject to change before v1.0 certification.
**Regulatory scope:** UK GDPR · UK Data Protection Act 2018 · Money Laundering Regulations 2017 (MLR 2017) · FCA guidance

---

## 1. Design Principles

1. **Modularity** — each data level is independently signable, independently encryptable, independently erasable. An agent holding only L0 data cannot infer that L1–L3 records exist.
2. **Reference existing standards, don't duplicate them** — RAIA does not define its own KYC or AML criteria. It maps each level to the appropriate existing regulatory standard and requires agents to demonstrate compliance with that standard. See §2.
3. **Consent-first** — no personal data moves without a cryptographically scoped consent token issued by the data subject.
4. **Data minimisation** — agents request specific field-level scopes, not whole records. Requesting unlisted scopes returns a 403.
5. **Separation of transport and data** — the RAIA JSON schema is the data layer. A2A, MCP, and direct HTTPS are transport layers. The same schema object flows through all three; the level-based access controls are identical regardless of transport.
6. **No raw documents in-protocol** — sensitive originals (passports, bank statements, source-of-funds evidence) never transit RAIA messages. The protocol carries verifier assertions and content hashes only.

---

## 2. Data Levels

RAIA defines four data levels. Each maps to existing regulatory and identity assurance frameworks — implementations are required to meet those external standards, not RAIA's own criteria.

| Level | Name | The question it answers | Regulatory standard |
|---|---|---|---|
| **L0** | Public | *What is the property?* | None — freely queryable, open schema |
| **L1** | Enquiry | *Who is asking?* | UK GDPR Art. 6 (legitimate interest / consent) |
| **L2** | KYC — Know Your Customer | *Who are you?* Identity verified, right to occupy confirmed | UK DIATF GPG45 Medium confidence · eIDAS LoA Substantial · NIST IAL2 · MLR 2017 Reg. 28 (CDD) · Right to Rent |
| **L3** | AML — Proof of Funds + Transaction | *Where does the money come from?* Source of wealth, proof of funds, then the transaction itself | FATF Recommendations 10–12 (EDD) · JMLSG Part I Ch. 5 · MLR 2017 Reg. 33 (EDD) · FCA · TDS |

**L2 is KYC.** It answers "who are you?" — identity documents, right to rent check, current and previous address, employment status, income verification, and standard CDD sanctions/PEP screening. The bar is DIATF GPG45 Medium or NIST IAL2.

**L3 is AML proof of funds plus the transaction record.** It answers "where does your money come from?" — source of wealth declaration, proof of funds for the deposit or purchase price, Enhanced Due Diligence where required. The transaction documents (tenancy agreement, sale contract, deposit receipt) sit here because they cannot exist without the AML clearance that precedes them.

Each level is a **separate module**. Protocol implementations may support L0 only and add higher levels incrementally.

---

## 3. Mapping to Existing Standards

RAIA does not compete with or replace these frameworks. It provides the agent-to-agent transport and consent layer that connects them.

### Identity Assurance (L2)

| Standard | Body | RAIA L2 mapping |
|---|---|---|
| **UK DIATF / GPG45** | UK Government (DCMS) | Medium confidence (score 9–12) required for lettings; High confidence (score 12+) recommended for high-value sales |
| **eIDAS 2.0** | European Commission | Level of Assurance: Substantial |
| **NIST SP 800-63B** | US NIST | Identity Assurance Level 2 (IAL2) |
| **ISO/IEC 29115** | ISO | LoA 3 |
| **OpenID Connect eKYC** | OpenID Foundation | `trust_framework: "uk_tfida"` · `identity_assurance_level: "medium"` — the standard wire format for exchanging `verified_claims` between agents without re-verifying |

### AML / Due Diligence (L2 screening + L3 EDD)

| Standard | Body | RAIA mapping |
|---|---|---|
| **FATF Recommendations 10–12** | FATF (global) | Standard CDD at L2; EDD triggered at L3 for high-value transactions |
| **MLR 2017** | UK Parliament | Reg. 28 (CDD) → L2; Reg. 33 (EDD) → L3 |
| **JMLSG Guidance Part I Ch. 5** | JMLSG (UK) | Property-specific AML guidance — the rulebook UK estate agents must follow |
| **W3C Verifiable Credentials** | W3C | Technical container format for carrying KYC/AML assertions between agents |

### When EDD (L3 AML) is triggered

Under JMLSG and MLR 2017, Enhanced Due Diligence is mandatory when:
- Purchase or deposit price exceeds **£10,000**
- The buyer or tenant is a **Politically Exposed Person (PEP)** or close associate
- The transaction involves a **non-UK national** or funds from outside the UK
- Any party is flagged by standard CDD screening as **higher risk**

For practical purposes, EDD is triggered on almost every UK property transaction. RAIA L3 is therefore not optional for any production implementation handling real transactions.

---

## 4. JSON Schema Structure

Each level occupies its own top-level key. Levels absent from a message are omitted entirely — they do not appear as null. An agent receiving an L0-only payload sees no structural evidence that L1–L3 exist.

```json
{
  "enquiry_id": "550e8400-e29b-41d4-a716-446655440000",
  "raia_version": "0.2",
  "transaction_id": "txn_abc123",
  "property_raia_id": "prop-gb-movehome-00042",
  "property_ref": "prop-gb-movehome-00042",
  "transaction_type": "LETTINGS",
  "jurisdiction": "GB",
  "buyer_agent": {
    "raia_id": "org-gb-buyeragent",
    "identity_credential": {
      "credential_id": "vc_raia_org_gb_buyeragent_2026_05",
      "issuer": "did:web:estateaigents.org:registry",
      "subject": "org-gb-buyeragent",
      "max_data_level": 3,
      "jurisdictions": ["GB"],
      "data_residency": "UK",
      "issued_at": "2026-05-01T00:00:00Z",
      "expires_at": "2026-06-01T00:00:00Z"
    }
  },
  "estate_agent": {
    "raia_id": "org-gb-movehome",
    "identity_credential": {
      "credential_id": "vc_raia_org_gb_movehome_2026_05",
      "issuer": "did:web:estateaigents.org:registry",
      "subject": "org-gb-movehome",
      "max_data_level": 3,
      "jurisdictions": ["GB"],
      "data_residency": "UK",
      "issued_at": "2026-05-01T00:00:00Z",
      "expires_at": "2026-06-01T00:00:00Z"
    }
  },
  "state": "DATA_GATHERING",
  "created_at": "2026-05-18T09:00:00Z",

  "l0": {
    "listing": {
      "title": "2-bed flat, Shoreditch EC2A",
      "rent_pcm": 2400,
      "available_from": "2026-06-01",
      "furnished": true
    }
  },

  "l1": {
    "consent": {
      "token": "ct_l1_example",
      "level": 1,
      "purpose": "enquiry",
      "scopes": ["enquirer.name", "enquirer.email", "enquirer.phone"],
      "issued_at": "2026-05-18T09:00:00Z",
      "expires_at": "2026-06-18T00:00:00Z",
      "audience": "org-gb-movehome"
    },
    "consent_token": "ct_l1_example",
    "consent_expires_at": "2026-06-18T00:00:00Z",
    "purpose": "enquiry",
    "data_subject_id": "ds_abc123",
    "data_residency": "UK",
    "enquirer": {
      "name": "[encrypted]",
      "email": "[encrypted]",
      "phone": "[encrypted]"
    }
  },

  "l2": {
    "consent": {
      "token": "ct_l2_example",
      "level": 2,
      "purpose": "tenancy_application",
      "scopes": ["identity.name", "right_to_rent.verified", "cdd.sanctions_clear", "cdd.pep_clear"],
      "issued_at": "2026-05-18T09:30:00Z",
      "expires_at": "2026-06-18T00:00:00Z",
      "audience": "org-gb-movehome"
    },
    "consent_token": "ct_l2_example",
    "data_subject_id": "ds_abc123",
    "data_residency": "UK",
    "assurance_framework": "uk_tfida",
    "assurance_level": "medium",
    "scopes_granted": [
      "identity.name",
      "identity.dob",
      "address.current",
      "address.previous",
      "employment.status",
      "employment.income_verified",
      "right_to_rent.verified",
      "cdd.sanctions_clear",
      "cdd.pep_clear"
    ],
    "verifier_assertions": [
      {
        "provider": "onfido",
        "framework": "uk_tfida",
        "scope": "identity",
        "assertion_hash": "sha256:a3f9a3f9a3f9a3f9",
        "issued_at": "2026-05-18T10:00:00Z",
        "expires_at": "2026-08-18T10:00:00Z"
      }
    ],
    "right_to_rent": {
      "verified": true,
      "share_code_hash": "sha256:d4e5d4e5d4e5d4e5",
      "checked_at": "2026-05-18T10:30:00Z",
      "expires_at": "2026-08-18T10:30:00Z",
      "provider": "uk_home_office"
    },
    "cdd": {
      "sanctions_clear": true,
      "pep_clear": true,
      "risk_level": "STANDARD",
      "screening_provider": "example_screening_provider",
      "screening_hash": "sha256:e6f7e6f7e6f7e6f7",
      "screened_at": "2026-05-18T10:45:00Z",
      "expires_at": "2026-08-18T10:45:00Z"
    }
  },

  "l3": {
    "consent": {
      "token": "ct_l3_example",
      "level": 3,
      "purpose": "tenancy_application",
      "scopes": ["source_of_funds.assertion", "payment_refs.deposit"],
      "issued_at": "2026-05-19T08:30:00Z",
      "expires_at": "2026-06-19T00:00:00Z",
      "audience": "org-gb-movehome"
    },
    "consent_token": "ct_l3_example",
    "data_subject_id": "ds_abc123",
    "data_residency": "UK",
    "edd_required": true,
    "edd_trigger": "transaction_value_exceeds_threshold",
    "source_of_funds": {
      "assertion_hash": "sha256:c9d1c9d1c9d1c9d1",
      "provider": "hmrc_verify",
      "transaction_id": "txn_abc123",
      "verified_at": "2026-05-19T09:00:00Z",
      "expires_at": "2026-08-19T09:00:00Z"
    },
    "document_refs": [
      {
        "type": "tenancy_agreement",
        "content_hash": "sha256:b7c2b7c2b7c2b7c2",
        "signed_by": ["landlord_agent_id", "tenant_agent_id"],
        "signed_at": "2026-05-19T14:30:00Z"
      }
    ],
    "payment_refs": [
      {
        "type": "deposit",
        "amount_pence": 240000,
        "method": "open_banking",
        "provider_ref": "ob_ref_xyz789",
        "beneficiary_verified": true,
        "verification_timestamp": "2026-05-18T14:00:00Z",
        "status": "held"
      }
    ],
    "retention_exemption_disclosed": true
  }
}
```

---

## 5. Consent Tokens

All L1+ data exchanges require a **consent token** issued by the data subject (or their authorised agent acting on their behalf).

Consent tokens are:
- **Scoped** — bound to a specific `purpose`, `level`, `property_ref`, and set of field `scopes`
- **Non-transferable** — a token issued to Agent A cannot be presented by Agent B
- **Time-bounded** — carry `issued_at` and `expires_at`; expired tokens are rejected server-side
- **Non-upgradeable** — a token issued for `level: 1` cannot be presented to a L2 endpoint; fresh consent is required for each level

Token format (signed JWT, RS256):

```json
{
  "sub": "data_subject_id_...",
  "iss": "raia-consent-service",
  "aud": "agent_id_receiving_data",
  "purpose": "tenancy_application",
  "level": 2,
  "property_ref": "prop-gb-movehome-00042",
  "scopes": ["identity.name", "address.current", "employment.income_verified", "cdd.sanctions_clear"],
  "iat": 1747612800,
  "exp": 1750291200
}
```

### 5.1 Issuance endpoint

Consent tokens are issued by the data subject's buyer agent, wallet, or delegated consent service after authenticating the data subject and verifying the requesting agent credential.

```text
POST /consent-tokens
Authorization: Bearer {agent_api_token}
Content-Type: application/json
```

Request fields:

| Field | Required | Description |
|---|---|---|
| `data_subject_id` | yes | Stable pseudonymous subject identifier |
| `audience` | yes | Receiving RAIA agent ID; becomes JWT `aud` |
| `purpose` | yes | Specific purpose such as `viewing`, `tenancy_application`, or `sales_progression` |
| `level` | yes | `1`, `2`, or `3`; L0 never needs consent |
| `property_ref` | yes | Property this consent is bound to |
| `scopes` | yes | Field scopes being granted |
| `expires_in_seconds` | no | Requested lifetime; servers MAY shorten it |

Issuers MUST reject level upgrades, unlisted scopes, expired/revoked subject authority, and any request where the audience agent's `max_data_level` is lower than the requested level.

---

## 6. Agent Identity Credentials

All agents operating above L0 must hold a **RAIA Agent Identity Credential** — a verifiable credential (W3C VC Data Model) issued by the RAIA registry.

The credential declares:
- Agent identity and operator
- Maximum permitted data level (`max_data_level: 0 | 1 | 2 | 3`)
- Jurisdiction(s) of operation
- Data residency declaration (hosting location)
- Credential expiry (monthly rotation required)

An agent's L2 capability is not surfaced in its MCP tool manifest unless the requesting agent presents a valid credential with `max_data_level >= 2`. This prevents schema inference by undercredentialled agents.

---

## 7. Data Residency

UK GDPR requires that L1+ personal data for UK data subjects does not leave the UK/EEA/adequacy-listed countries without explicit safeguards.

Every L1+ record carries a `data_residency` field:

```json
"data_residency": "UK"
```

Permitted values: `"UK"` · `"EEA"` · `"ADEQUACY"`.

Agents must declare their hosting jurisdiction in their Agent Identity Credential. The protocol refuses to route L2+ data to an agent whose declared jurisdiction does not satisfy the record's `data_residency` requirement.

---

## 8. KYC Rules (L2)

L2 KYC checks are carried as time-bounded verifiable assertions issued by accredited third-party providers. Raw identity documents never transit RAIA messages.

- KYC assertions must meet **UK DIATF GPG45 Medium confidence** as a minimum for lettings; High confidence for sales transactions above £500,000.
- Standard CDD sanctions and PEP screening is a required L2 scope for all transactions.
- Assertions expire after **90 days**. Assertions older than 90 days are treated as absent and the check must be re-run.
- Right to Rent checks are a required scope for UK residential lettings. The result is carried as `right_to_rent.verified` with a `share_code_hash` — the raw share code never transits the protocol.

Accredited identity verification providers are defined per-jurisdiction in `/modules/`.

---

## 9. AML / Proof of Funds Rules (L3)

L3 AML addresses the question FATF Recommendation 10 calls "source of funds" and "source of wealth" — distinct from identity (L2).

- `edd_required` must be set to `true` whenever any JMLSG EDD trigger applies (see §3).
- `edd_trigger` must state the reason: `transaction_value_exceeds_threshold` · `pep_involved` · `non_uk_funds` · `high_risk_flag`.
- Source of funds assertions expire after **90 days** and are bound to a specific `transaction_id`. An assertion issued for transaction A cannot satisfy an EDD check on transaction B.
- Raw source-of-funds evidence (bank statements, HMRC records) never transits the protocol. The provider's `assertion_hash` and metadata only.

### L3 contract integrity
L3 documents are content-addressed. The `content_hash` is committed before any signing request is issued. The signing agent must verify `sha256(document) == committed_hash` before presenting to the data subject. A mismatch raises `INTEGRITY_FAILURE` and halts the transaction.

### L3 payment instructions
Bank details are never stored in RAIA L3 payloads in plaintext. The protocol carries a payment instruction *reference* that resolves only at point-of-payment through a regulated Open Banking provider. This eliminates IBAN-substitution fraud — the leading fraud vector in UK property transactions.

---

## 10. Right to Erasure (GDPR Art. 17)

Every L1+ record carries a `data_subject_id`. When a data subject invokes their right to erasure:

1. The RAIA erasure service issues a signed `erasure_token` to every agent holding a record for that `data_subject_id`.
2. Each agent must confirm deletion within **72 hours**.
3. Unconfirmed deletions escalate to the data controller's DPO queue.
4. Erasure is field-level — L0 listing data associated with the same transaction is not erased (it is not personal data).

This is a **protocol-level obligation** binding on all certified RAIA agents, not a bilateral agreement between parties.

Note: MLR 2017 Reg. 40 requires AML records to be **retained for 5 years** after the transaction ends. L3 AML assertions are therefore exempt from erasure requests during the statutory retention period. This exemption must be disclosed to the data subject at the point of L3 consent.

---

## 11. Replay & Impersonation Defences

| Attack | Mitigation |
|---|---|
| A2A message replay | Every message includes a `nonce` (TTL 24h) + `transaction_id`. Replayed nonces are rejected. |
| Agent impersonation | All L1+ exchanges require mutual presentation of valid Agent Identity Credentials before data flows. |
| Consent laundering | Consent tokens are non-transferable and bound to a specific `aud` (receiving agent ID). |
| Schema inference | L2+ MCP tools are absent from the tool manifest unless the requesting agent holds the required credential level. |
| Privilege escalation | L2/L3 endpoints return a flat 403 for undercredentialled requests — no partial response, no scope enumeration. |
| IBAN fraud | Bank details never transit the protocol. Payment references resolve inside the regulated payment rail only. |
| Synthetic identity | L2 carries verifier assertions only. Raw documents go directly to the accredited verifier (GPG45-certified), not through RAIA. |
| AML replay | Assertions are bound to a `transaction_id` and expire after 90 days. |
| Data aggregation | L0 and L1+ are in separate API namespaces with separate auth tokens. Error responses from L1+ are identical whether a record exists or not (no enumeration). |

---

## 12. Build Order

Implementations must add data levels incrementally. Higher levels must not be deployed until their prerequisites are in place.

| Step | Prerequisite | Module |
|---|---|---|
| 1 | — | L0 public schema + registry |
| 2 | Step 1 | Consent token issuance service |
| 3 | Step 2 | L1 enquiry module |
| 4 | Step 3 | Agent Identity Credential issuance |
| 5 | Step 4 | L2 KYC module — GPG45/IAL2, field-level scopes, CDD screening |
| 6 | Step 5 | Erasure token protocol (required before L2 goes live) |
| 7 | Step 6 | L3 AML + proof of funds module |
| 8 | Step 7 | L3 document signing + payment reference module |

---

## 13. Out of Scope for v0.1

Biometric liveness detection · Cryptographic document signing implementation · Cross-border AML harmonisation (EU AMLD6, US BSA) · Blockchain attestations · Specific Open Banking provider integrations · Conveyancing · Land Registry title verification

---

## Reporting a Vulnerability

Open a **private** security advisory on GitHub:
`https://github.com/estateaigents/raia-protocol/security/advisories/new`

Do not open a public issue for security vulnerabilities.
