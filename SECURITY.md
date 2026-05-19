# RAIA Protocol — Security & Data Privacy Architecture
## Version 0.1 — DRAFT · NOT FOR PRODUCTION

**Published:** May 2026
**Status:** Working draft. Subject to change before v1.0.
**Regulatory scope:** UK GDPR · UK Data Protection Act 2018 · Money Laundering Regulations 2017 · FCA guidance

---

## 1. Design Principles

1. **Modularity** — each data level is independently signable, independently encryptable, independently erasable. An agent holding only L0 data cannot infer that L1–L3 records exist.
2. **Consent-first** — no personal data moves without a cryptographically scoped consent token issued by the data subject.
3. **Data minimisation** — agents request specific field-level scopes, not whole records. Requesting unlisted scopes returns a 403.
4. **Separation of transport and data** — the RAIA JSON schema is the data layer. A2A, MCP, and direct HTTPS are transport layers. The same schema object flows through all three; the level-based access controls are identical regardless of transport.
5. **No raw documents in-protocol** — sensitive originals (passports, bank statements) never transit RAIA messages. The protocol carries verifier assertions and content hashes only.

---

## 2. Data Levels

| Level | Name | Typical data | Regulatory trigger |
|---|---|---|---|
| **L0** | Public | Listing details, property photos, price, availability, agent card | None — freely queryable, open schema |
| **L1** | Enquiry | Name, email, phone number | UK GDPR Art. 6 (legitimate interest / consent) |
| **L2** | Identity | Passport/ID, current & previous address, employment, proof of income, AML check result | UK GDPR Art. 9 · MLR 2017 · Right to Rent |
| **L3** | Transactional | Tenancy/sale agreement, deposit record, payment instruction reference, signed documents | FCA · contract law · TDS obligations |

Each level is a **separate module**. Protocol implementations may support L0 only and add higher levels incrementally.

---

## 3. JSON Schema Structure

Each level occupies its own top-level key. Levels absent from a message do not appear as null — they are simply omitted. An agent receiving an L0-only payload sees no structural evidence that L1–L3 exist.

```json
{
  "raia_version": "1.0",
  "transaction_id": "txn_abc123",
  "property_ref": "prop-gb-movehome-00042",

  "l0": {
    "listing": {
      "title": "2-bed flat, Shoreditch EC2A",
      "rent_pcm": 2400,
      "available_from": "2026-06-01",
      "furnished": true
    }
  },

  "l1": {
    "consent_token": "ct_l1_...",
    "consent_expires_at": "2026-06-18T00:00:00Z",
    "purpose": "enquiry",
    "enquirer": {
      "name": "[encrypted]",
      "email": "[encrypted]",
      "phone": "[encrypted]"
    }
  },

  "l2": {
    "consent_token": "ct_l2_...",
    "scopes_granted": [
      "identity.name",
      "identity.dob",
      "address.current",
      "address.previous",
      "employment.status",
      "employment.income_verified",
      "aml.result"
    ],
    "verifier_assertions": [
      {
        "provider": "onfido",
        "scope": "identity",
        "assertion_hash": "sha256:a3f9...",
        "issued_at": "2026-05-18T10:00:00Z",
        "expires_at": "2026-08-18T10:00:00Z"
      }
    ]
  },

  "l3": {
    "consent_token": "ct_l3_...",
    "document_refs": [
      {
        "type": "tenancy_agreement",
        "content_hash": "sha256:b7c2...",
        "signed_by": ["landlord_agent_id", "tenant_agent_id"],
        "signed_at": "2026-05-19T14:30:00Z"
      }
    ],
    "payment_refs": [
      {
        "type": "deposit",
        "amount_pence": 240000,
        "provider_ref": "ob_ref_xyz789",
        "beneficiary_verified": true,
        "status": "held"
      }
    ]
  }
}
```

---

## 4. Consent Tokens

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
  "scopes": ["identity.name", "address.current", "employment.income_verified", "aml.result"],
  "iat": 1747612800,
  "exp": 1750291200
}
```

---

## 5. Agent Identity Credentials

All agents operating above L0 must hold a **RAIA Agent Identity Credential** — a verifiable credential (W3C VC Data Model) issued by the RAIA registry.

The credential declares:
- Agent identity and operator
- Maximum permitted data level (`max_data_level: 0 | 1 | 2 | 3`)
- Jurisdiction(s) of operation
- Data residency declaration (hosting location)
- Credential expiry (monthly rotation required)

An agent's L2 capability is not surfaced in its MCP tool manifest unless the requesting agent presents a valid credential with `max_data_level >= 2`. This prevents schema inference by undercredentialled agents.

---

## 6. Data Residency

UK GDPR requires that L1+ personal data for UK data subjects does not leave the UK/EEA/adequacy-listed countries without explicit safeguards.

Every L1+ record carries a `data_residency` field:

```json
"data_residency": "UK"
```

Permitted values: `"UK"` · `"EEA"` · `"ADEQUACY"`.

Agents must declare their hosting jurisdiction in their Agent Identity Credential. The protocol refuses to route L2+ data to an agent whose declared jurisdiction does not satisfy the record's `data_residency` requirement.

---

## 7. AML / KYC (L2)

AML check results are carried as time-bounded verifiable assertions. They are not generated by the RAIA protocol — they are issued by accredited third-party providers and their signed assertions are stored by reference.

Rules:
- AML assertions expire after **90 days**. Assertions older than 90 days are treated as absent.
- Each assertion carries an `issuedFor` field bound to a specific `transaction_id`. An assertion issued for transaction A cannot satisfy a check on transaction B.
- Raw identity documents (passport scans, utility bills) are never stored in or transmitted through RAIA messages. The protocol holds only the provider's `assertion_hash` and metadata.

Accredited providers are defined per-jurisdiction in `/modules/`.

---

## 8. L3 Protections

### Contract integrity
L3 documents are content-addressed. The `content_hash` of a document is committed to the transaction record before any signing request is issued. The signing agent must verify `sha256(document) == committed_hash` before presenting the document to the data subject. A mismatch halts the transaction and raises a `INTEGRITY_FAILURE` alert.

### Payment instructions
Bank details are never stored in RAIA L3 payloads in plaintext. The protocol carries a payment instruction *reference* that resolves only at point-of-payment through a regulated Open Banking provider. This eliminates IBAN-substitution fraud — the leading fraud vector in UK property transactions.

```json
"payment": {
  "type": "deposit",
  "amount_pence": 240000,
  "method": "open_banking",
  "provider_ref": "ob_ref_xyz789",
  "beneficiary_verified": true,
  "verification_timestamp": "2026-05-18T14:00:00Z"
}
```

---

## 9. Right to Erasure (GDPR Art. 17)

Every L1+ record carries a `data_subject_id`. When a data subject invokes their right to erasure:

1. The RAIA erasure service issues a signed `erasure_token` to every agent that holds a record for that `data_subject_id`.
2. Each agent must confirm deletion within **72 hours**.
3. Unconfirmed deletions escalate to the data controller's DPO queue.
4. Erasure is field-level — L0 listing data associated with the same transaction is not erased (it is not personal data).

This is a **protocol-level obligation** binding on all certified RAIA agents, not a bilateral agreement between parties.

---

## 10. Replay & Impersonation Defences

| Attack | Mitigation |
|---|---|
| A2A message replay | Every message includes a `nonce` (TTL 24h) + `transaction_id`. Replayed nonces are rejected. |
| Agent impersonation | All L1+ exchanges require mutual presentation of valid Agent Identity Credentials before data flows. |
| Consent laundering | Consent tokens are non-transferable and bound to a specific `aud` (receiving agent ID). |
| Schema inference | L2+ MCP tools are absent from the tool manifest unless the requesting agent holds the required credential level. |
| Privilege escalation | L2 endpoint returns a flat 403 for undercredentialled requests — no partial response, no scope enumeration. |
| IBAN fraud | Bank details never transit the protocol. Payment references resolve inside the regulated payment rail only. |
| Synthetic identity | L2 carries verifier assertions only. Raw documents go directly to the accredited verifier, not through RAIA. |
| AML replay | Assertions are bound to a `transaction_id` and expire after 90 days. |
| Data aggregation | L0 and L1+ are in separate API namespaces with separate auth tokens. Error responses from L1+ are identical whether the record exists or not. |

---

## 11. Build Order

Implementations should add data levels incrementally. Higher levels must not be deployed until their prerequisites are in place.

| Step | Prerequisite | Module |
|---|---|---|
| 1 | — | L0 public schema + registry |
| 2 | Step 1 | Consent token issuance service |
| 3 | Step 2 | L1 enquiry module |
| 4 | Step 3 | Agent Identity Credential issuance |
| 5 | Step 4 | L2 KYC module (field-level scopes) |
| 6 | Step 5 | Erasure token protocol (required before L2 goes live) |
| 7 | Step 6 | L3 document + payment reference module |

---

## 12. Out of Scope for v0.1

Biometric verification · Cryptographic document signing (implementation detail left to operators) · Cross-border AML harmonisation · Blockchain attestations · Specific Open Banking provider integrations

---

## Reporting a Vulnerability

Open a **private** security advisory on GitHub:
`https://github.com/estateaigents/raia-protocol/security/advisories/new`

Do not open a public issue for security vulnerabilities.
