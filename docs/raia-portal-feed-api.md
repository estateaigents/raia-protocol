# RAIA Portal Feed API - Developer Guide

> **Status:** Draft v0.1.0 (May 2026)
> **Spec:** [`openapi/raia-portal-feed-api.yaml`](../openapi/raia-portal-feed-api.yaml)
> **Implementer guide:** [`docs/raia-portal-feed-api-implementer-guide.md`](raia-portal-feed-api-implementer-guide.md)
> **License:** MIT

The RAIA Portal Feed API is a vendor-neutral HTTP contract that lets any
developer build the same kind of property feed integration that exists today
behind closed APIs such as Rightmove's Real-Time Data Feed (RTDF), Rightmove's
Commercial Listings API, Zoopla's Real-Time Listings, and the Zoopla Products
API. It is the contract published in this repository and aligns with
the public RAIA schemas in [`schemas/`](../schemas/).

If you implement this API in front of your CRM, MLS or listing aggregator,
any RAIA-aware buyer agent, portal, or partner system can drive listing
syndication, branch reconciliation, performance reporting, enquiry polling,
and product activations without a vendor-specific SDK.

---

## Table of Contents

1. [What this API replaces](#what-this-api-replaces)
2. [Why a vendor-neutral contract](#why-a-vendor-neutral-contract)
3. [Authentication](#authentication)
4. [Environments and base URLs](#environments-and-base-urls)
5. [Versioning](#versioning)
6. [Rate limits and retries](#rate-limits-and-retries)
7. [Idempotency and async behaviour](#idempotency-and-async-behaviour)
8. [Error model](#error-model)
9. [Operation reference](#operation-reference)
10. [Workflows](#workflows)
11. [Capability map: industry portals to RAIA](#capability-map-industry-portals-to-raia)
12. [Implementer responsibilities](#implementer-responsibilities)
13. [Known gaps and non-goals](#known-gaps-and-non-goals)
14. [Examples](#examples)
15. [Glossary](#glossary)

---

## What this API replaces

The RAIA Portal Feed API consolidates capabilities that today exist across
multiple closed vendor integrations:

| Capability area | Typical upstream pattern |
|---|---|
| Commercial listings | OpenAPI CRUD by reference, branch paging |
| Residential and commercial real-time feeds | Mutual-TLS JSON push over send/update/delete operations |
| Portal products | OAuth2 + Premium Listings + Featured Properties activations |
| Branch reconciliation | List branch inventory, compare against source of truth |
| Performance and leads | Daily stats polling and enquiry/lead retrieval |

The RAIA Portal Feed API covers each capability under a single, modern
contract. Implementers are free to keep talking directly to vendor APIs
under the hood — the point of this API is to give consumers a stable surface
they can build against once.

## Why a vendor-neutral contract

- **Naming consistent with the rest of RAIA.** Fields are `snake_case`,
  enums are `SCREAMING_SNAKE_CASE`, identifiers follow the `raia_id`
  conventions used by [`schemas/property.json`](../schemas/property.json) and
  [`schemas/agent.json`](../schemas/agent.json).
- **One CRUD surface for residential and commercial.** Rightmove's
  Commercial Listings API only covers commercial; the RTDF covers
  residential and commercial. Here both share `PUT/GET/DELETE
  /v1/listings/{reference}`.
- **Reconciliation, stats, and leads first-class.** Legacy integrations often
  expose these as ad hoc routes or batch jobs. The RAIA Portal Feed API
  documents them as proper, paginated endpoints.
- **Product activations decoupled from a single vendor.** Premium Listing
  and Featured Property activations come from the Zoopla Products API but
  are modelled here as portable resources with `customer_listing_id` as
  the canonical join key.
- **Compatible with the public RAIA card.** Each listing payload includes
  a `public_card` projection that controls how it surfaces on the
  public-facing RAIA property card.

## Authentication

All write operations require OAuth2 client credentials (server-to-server).
Read operations require a valid token but no per-user identity. The token
endpoint and credentials are issued by the feed implementer during
onboarding.

### Token request

```http
POST /oauth/token HTTP/1.1
Host: feed.example.com
Authorization: Basic BASE64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&scope=feed.read%20feed.write%20products.write
```

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "feed.read feed.write products.write"
}
```

### Using the token

```http
GET /api/raia/portal/v1/listings/REF_001 HTTP/1.1
Authorization: Bearer eyJhbGciOi...
Accept: application/json
```

### Scopes

| Scope | Grants |
|---|---|
| `feed.read` | Read listings, branches, performance, enquiries, activations |
| `feed.write` | Upsert and remove listings |
| `products.write` | Request portal product activations |

### Legacy: mutual TLS

Some legacy upstream portal APIs authenticate with mutual-TLS client
certificates rather than OAuth2. Implementers MAY continue to use mTLS
internally for upstream calls but the RAIA Portal Feed API itself uses
bearer-token OAuth2 to stay portable.

## Environments and base URLs

The OpenAPI spec lists three example environments. Real implementers should
substitute their own hostnames:

| Environment | Base URL |
|---|---|
| Production | `https://feed.example.com/api/raia/portal/v1` |
| Staging / sandbox | `https://staging.feed.example.com/api/raia/portal/v1` |
| Local development | `http://localhost:8787/api/raia/portal/v1` |

Sandbox should accept the same payloads as production but never propagate
to live portals.

## Versioning

The API uses semantic major.minor.patch versioning in the path (`/v1`).
Within a major version, the spec is backwards-compatible. Clients must
tolerate additive fields without failing.

Resource and field deprecations are announced in the spec via the OpenAPI
`deprecated: true` flag and a `Deprecation` HTTP header at runtime.

## Rate limits and retries

- Default quota: 60 requests per minute per credential per endpoint group.
- `429 Too Many Requests` responses include `Retry-After` plus
  `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`.
- Clients SHOULD implement exponential backoff with full jitter when retrying.

## Idempotency and async behaviour

- `PUT /v1/listings/{reference}` is idempotent. Re-sending an unchanged
  payload returns `200` with `action: NO_CHANGE`.
- `DELETE /v1/listings/{reference}` is idempotent. Deleting an already-removed
  listing returns `200` with the recorded `removed_at`/`removal_reason`.
- The feed implementer MAY queue uploads and removals. In that case the
  response is `202 Accepted` with an `AsyncAccepted` body containing a
  `request_id` and optional `polling_url`. Callers SHOULD poll the listing
  GET endpoint to confirm the change has landed.

## Error model

All `4xx` and `5xx` responses are RFC 7807 problem documents with
`Content-Type: application/problem+json`.

```json
{
  "type": "https://feed.example.com/errors/validation",
  "title": "Validation failed",
  "status": 400,
  "detail": "building.address.postcode is required for commercial listings.",
  "instance": "/v1/listings/BLD_LON_001",
  "trace_id": "01HZK2D5G2A0Z9Y3F7H4F1Q3T9",
  "timestamp": "2026-05-28T06:01:23Z",
  "validation_errors": [
    {
      "field": "building.address.postcode",
      "message": "Postcode is required.",
      "code": "MISSING"
    }
  ]
}
```

## Operation reference

| Method | Path | Operation ID | Purpose |
|---|---|---|---|
| `GET` | `/healthz` | `getHealth` | Liveness/health probe (unauthenticated). |
| `PUT` | `/v1/listings/{reference}` | `upsertListing` | Create or update a residential or commercial listing. |
| `GET` | `/v1/listings/{reference}` | `getListing` | Retrieve a listing by reference. |
| `DELETE` | `/v1/listings/{reference}` | `deleteListing` | Remove a listing with a reason. |
| `GET` | `/v1/branches/{branch_id}/listings` | `listBranchListings` | Paginated reconciliation snapshot for a branch. |
| `GET` | `/v1/branches/{branch_id}/performance` | `getBranchPerformance` | Daily stats per branch (and optionally per portal/listing). |
| `GET` | `/v1/branches/{branch_id}/enquiries` | `listBranchEnquiries` | Poll new branch enquiries using a cursor. |
| `GET` | `/v1/products/premium-listings` | `listPremiumListingActivations` | List Premium Listing activations. |
| `POST` | `/v1/products/premium-listings` | `requestPremiumListingActivation` | Request a Premium Listing activation. |
| `GET` | `/v1/products/premium-listings/{activation_id}` | `getPremiumListingActivation` | Retrieve a Premium Listing activation. |
| `GET` | `/v1/products/featured-properties` | `listFeaturedPropertyActivations` | List Featured Property activations. |
| `POST` | `/v1/products/featured-properties` | `requestFeaturedPropertyActivation` | Request a Featured Property activation. |
| `GET` | `/v1/products/featured-properties/{activation_id}` | `getFeaturedPropertyActivation` | Retrieve a Featured Property activation. |

## Workflows

### 1. Upload a residential listing

```http
PUT /v1/listings/REF_001 HTTP/1.1
Authorization: Bearer ...
Content-Type: application/json

{
  "kind": "residential",
  "transaction_type": "LETTINGS",
  "status": "AVAILABLE",
  "property_type": "FLAT",
  "headline": "2-bed flat, Hammersmith W6",
  "bedrooms": 2,
  "bathrooms": 1,
  "asking_rent_pcm": 2450,
  "currency": "GBP",
  "furnishing": "FURNISHED",
  "address": {
    "display_address": "42 King Street, London W6 9TA",
    "postcode": "W6 9TA",
    "country": "GB"
  },
  "media": {
    "photos": [
      { "url": "https://example-estates.test/media/REF_001/photo-1.jpg", "order": 0 }
    ]
  },
  "public_card": {
    "raia_id": "prop-gb-example-000001",
    "publish": true,
    "max_data_level": 3,
    "suppress_address": true
  }
}
```

Successful response:

```json
{
  "reference": "REF_001",
  "action": "CREATED",
  "updated_at": "2026-05-28T06:00:00Z",
  "version": 1,
  "public_card_url": "https://feed.example.com/.well-known/raia-property/prop-gb-example-000001"
}
```

### 2. Upload a commercial building with one space

```http
PUT /v1/listings/BLD_LON_001 HTTP/1.1
Authorization: Bearer ...
Content-Type: application/json

{
  "kind": "commercial",
  "transaction_type": "LETTINGS",
  "building": {
    "reference": "BLD_LON_001",
    "status": "AVAILABLE",
    "primary_classification": { "classification": "OFFICE", "sub_type": "SERVICED_OFFICE" },
    "address": {
      "display_address": "33 Soho Square, London",
      "building_identifier": "33 Soho Square",
      "postcode": "W1D 3QU",
      "country": "GB"
    },
    "pricing": { "price": 750000, "currency": "GBP", "display_qualifier": "GUIDE_PRICE" },
    "amenities": ["WIFI", "CONCIERGE", "PARKING"],
    "spaces": [
      {
        "reference": "SPACE_LON_001_FL2",
        "name": "2nd Floor",
        "floor_identifier": "Floor 2",
        "sizing": { "size": 5941, "unit": "SQFT", "measurement_type": "GIA" },
        "status": "AVAILABLE",
        "pricing": { "price": 65, "currency": "GBP", "frequency": "YEARLY" },
        "primary_classification": { "classification": "OFFICE", "sub_type": "SERVICED_OFFICE" }
      }
    ]
  }
}
```

The building `reference` MUST match the path `reference`. Each space MUST
have a unique reference distinct from the building's.

### 3. Remove a listing

```http
DELETE /v1/listings/REF_001 HTTP/1.1
Authorization: Bearer ...
Content-Type: application/json

{
  "branch_id": 56726,
  "removal_reason": "LET_BY_US",
  "removed_at": "2026-05-28T06:00:00Z"
}
```

```json
{
  "reference": "REF_001",
  "removed_at": "2026-05-28T06:00:00Z",
  "removal_reason": "LET_BY_US"
}
```

### 4. Reconcile a branch

Poll the branch listings endpoint on a schedule (for example nightly) and
diff against your CRM's view of "what should be live".

```http
GET /v1/branches/56726/listings?status=AVAILABLE&per_page=200 HTTP/1.1
Authorization: Bearer ...
```

```json
{
  "meta": { "page": 1, "per_page": 200, "total": 31 },
  "listings": [
    {
      "reference": "REF_001",
      "transaction_type": "LETTINGS",
      "status": "AVAILABLE",
      "kind": "residential",
      "public_card_url": "https://feed.example.com/.well-known/raia-property/prop-gb-example-000001",
      "updated_at": "2026-05-28T06:00:00Z",
      "version": 4
    }
  ]
}
```

Replays: if the feed believes a listing is live but your CRM does not, send
a `DELETE`. If your CRM has a listing the feed does not show, send a `PUT`.

### 5. Pull branch performance

```http
GET /v1/branches/56726/performance?from=2026-05-01&to=2026-05-28&portal=RIGHTMOVE HTTP/1.1
Authorization: Bearer ...
```

```json
{
  "branch_id": "56726",
  "portal": "RIGHTMOVE",
  "range": { "from": "2026-05-01", "to": "2026-05-28" },
  "totals": {
    "impressions": 12450,
    "detail_views": 1820,
    "click_throughs": 612,
    "phone_reveals": 88,
    "brochure_downloads": 34,
    "enquiries": 41
  },
  "by_day": [
    {
      "date": "2026-05-01",
      "metrics": {
        "impressions": 410,
        "detail_views": 62,
        "click_throughs": 21,
        "phone_reveals": 3,
        "brochure_downloads": 1,
        "enquiries": 2
      }
    }
  ]
}
```

Typical windows are capped at 28 days, matching the RTDF upstream behaviour.

### 6. Poll enquiries (leads)

```http
GET /v1/branches/56726/enquiries?since_enquiry_id=enq_20260527_0008&limit=100 HTTP/1.1
Authorization: Bearer ...
```

```json
{
  "enquiries": [
    {
      "enquiry_id": "enq_20260528_0001",
      "listing_reference": "REF_001",
      "received_at": "2026-05-28T05:42:11Z",
      "source": "RIGHTMOVE",
      "message": "Is the property pet friendly?",
      "contact": {
        "type": "INDIVIDUAL",
        "name": "Anya Patel",
        "email": "anya@example.com",
        "phone": "+44 20 7946 0123",
        "consent_token_ref": "ct_l1_8f3d2c..."
      },
      "viewing_request": {
        "proposed_slots": [
          { "start": "2026-05-30T10:00:00Z", "end": "2026-05-30T10:30:00Z" }
        ],
        "viewing_type": "IN_PERSON"
      }
    }
  ],
  "next_cursor": "enq_20260528_0001"
}
```

L1+ personal data carried in `contact.*` MUST be backed by a consent token
referenced by `consent_token_ref`, per
[`schemas/enquiry.json`](../schemas/enquiry.json) and
[`SECURITY.md`](../SECURITY.md).

### 7. Activate Premium Listings or Featured Properties

```http
POST /v1/products/premium-listings HTTP/1.1
Authorization: Bearer ...
Content-Type: application/json

{
  "customer_listing_id": "REF_001",
  "highlights": [{ "id": 1 }]
}
```

```json
{
  "id": "af2c1c7a-1a13-4a3a-9d6a-9bdc4c5d3df2",
  "product": "PREMIUM_LISTING",
  "status": "PENDING",
  "customer_listing_id": "REF_001",
  "highlights": [{ "id": 1 }],
  "created_at": "2026-05-28T06:10:00Z"
}
```

Featured Properties use the same shape minus `highlights`. Poll the
activation GET endpoint until `status` becomes `ACTIVE`, `EXPIRED`,
`REJECTED`, or `CANCELLED`.

## Capability map: industry portals to RAIA

| Capability | Upstream pattern | RAIA Portal Feed endpoint |
|---|---|---|
| OAuth2 token | Zoopla Products `POST oauth2/token`; Rightmove Commercial OAuth2 | OAuth2 `clientCredentials` security scheme on every operation |
| Upload/update residential listing | RTDF `POST /v1/property/sendpropertydetails`; ZPG `POST /v1/listing/update` | `PUT /v1/listings/{reference}` with a `residential` payload |
| Upload/update commercial listing | Rightmove Commercial `PUT /v2/property/commercial/{reference}` | `PUT /v1/listings/{reference}` with a `commercial` payload |
| Get a listing | Rightmove Commercial `GET /v2/property/commercial/{reference}` | `GET /v1/listings/{reference}` |
| Remove a listing | Rightmove Commercial `DELETE`; RTDF `POST /v1/property/removeproperty`; ZPG `POST /v1/listing/delete` | `DELETE /v1/listings/{reference}` |
| Reconcile branch listings | Rightmove Commercial `GET /v2/property/commercial/branch?id=...`; RTDF `getbranchpropertylist`; ZPG `POST /v1/listing/list` | `GET /v1/branches/{branch_id}/listings` |
| Branch performance / stats | RTDF `getbranchperformance` | `GET /v1/branches/{branch_id}/performance` |
| Branch enquiries / leads | RTDF `getbranchemails`; ZPG FTP enquiry ingestion | `GET /v1/branches/{branch_id}/enquiries` |
| List Premium Listing activations | Zoopla Products `GET /products/premium-listings` | `GET /v1/products/premium-listings` |
| Request Premium Listing activation | Zoopla Products `POST /products/premium-listings` | `POST /v1/products/premium-listings` |
| Get Premium Listing activation | Zoopla Products `GET /products/premium-listings/{uuid}` | `GET /v1/products/premium-listings/{activation_id}` |
| List Weekly Featured Properties | Zoopla Products `GET /products/weekly-featured-properties` | `GET /v1/products/featured-properties` |
| Request Weekly Featured Property | Zoopla Products `POST /products/weekly-featured-properties` | `POST /v1/products/featured-properties` |
| Get Weekly Featured Property | Zoopla Products `GET /products/weekly-featured-properties/{uuid}` | `GET /v1/products/featured-properties/{activation_id}` |
| Bulk refresh / manual trigger routes | Private admin or cron endpoints | Not standardised — implementers MAY expose private equivalents but they are out of scope for the public contract. |

## Implementer responsibilities

If you stand up a service behind this contract you are responsible for:

1. **Token issuance.** Run an OAuth2 client-credentials token endpoint and
   issue credentials to each integrator. Tokens MUST be short-lived (<= 1 h)
   bearer JWTs.
2. **Persistence and idempotency.** Store listings keyed by `reference` and
   handle re-submission gracefully (`200` with `action: NO_CHANGE`).
3. **Downstream syndication.** Translate the neutral RAIA payload into the
   format each downstream portal expects (Rightmove, Zoopla, OnTheMarket,
   etc.).
4. **Public card projection.** Derive the public
   [`schemas/property.json`](../schemas/property.json) card from each
   listing, honouring `public_card.publish`,
   `public_card.suppress_address`, and `public_card.max_data_level`.
5. **Enquiry consent.** Refuse to surface L1+ personal data in
   `/branches/{branch_id}/enquiries` unless the lead carries a valid
   `consent_token_ref`. See [`SECURITY.md`](../SECURITY.md).
6. **Rate limiting.** Apply per-credential quotas and emit the documented
   rate-limit headers on `429` responses.
7. **Audit logging.** Persist a `trace_id` for every request and surface it
   in `ProblemDetail` bodies so integrators can correlate failures.

## Known gaps and non-goals

- **Vendor lookup tables not bundled.** Rightmove RTDF v1 uses integer
  field codes (property type, etc.) whose lookup tables are not present in
  this repository. Implementers must maintain their own mapping table when
  translating to RTDF.
- **Zoopla Products response examples missing upstream.** The Postman
  collection ships request bodies only. The `ProductActivation` schema is
  this API's best-guess normalisation; implementers MAY add vendor-specific
  extension fields.
- **No webhooks.** Both upstream APIs are poll/push - the RAIA Portal Feed
  API stays poll-based (`GET /enquiries`, `GET /performance`) to keep
  parity. A webhook profile may be added in a later release.
- **No site-specific routes.** Legacy CRM or CMS integrations often expose
  private trigger routes for bulk refresh or manual reconciliation. These
  are intentionally not part of this contract.
- **Branch identifiers must be credential-scoped.** Implementers MUST derive
  the branch identifier from credentials or the path — never hard-code
  branch references in application logic.
- **No residential commercial conversion semantics.** Converting a
  building to spaces (or back) is left to the implementer. The contract
  accepts either shape on the same `PUT /v1/listings/{reference}` call;
  consumers are expected to handle the transition in their upstream
  syndication.

## Examples

### Pagination envelope

```json
{
  "meta": { "page": 1, "per_page": 50, "total": 127 },
  "listings": [ ... ]
}
```

### Validation error

```json
{
  "type": "https://feed.example.com/errors/validation",
  "title": "Validation failed",
  "status": 400,
  "detail": "spaces[0].reference must differ from the building reference.",
  "trace_id": "01HZK2D5G2A0Z9Y3F7H4F1Q3T9",
  "validation_errors": [
    {
      "field": "building.spaces[0].reference",
      "message": "Space reference must be unique within the building.",
      "code": "DUPLICATE_REFERENCE"
    }
  ]
}
```

### Polling enquiries with a cursor

```bash
# First poll
curl -H "Authorization: Bearer $TOKEN" \
  "https://feed.example.com/api/raia/portal/v1/branches/56726/enquiries?limit=100"

# Subsequent polls use the returned next_cursor
curl -H "Authorization: Bearer $TOKEN" \
  "https://feed.example.com/api/raia/portal/v1/branches/56726/enquiries?since_enquiry_id=enq_20260528_0001&limit=100"
```

## Glossary

| Term | Definition |
|---|---|
| `reference` | The caller-controlled identifier of a listing. Unique per branch. |
| `branch_id` | Stable identifier of an office or branch on the feed. |
| `activation_id` | Identifier of a portal product activation request. |
| `kind` | Discriminator on `ListingUpsert`: `residential` or `commercial`. |
| Public card | The masked, public-facing property listing described by [`schemas/property.json`](../schemas/property.json). |
| Consent token | A short-lived JWT authorising release of L1+ personal data, per [`SECURITY.md`](../SECURITY.md). |
| RTDF | Rightmove Real-Time Data Feed v1. |
| ZPG | Zoopla Property Group Real-Time Listings v1.2. |

---

Questions or feedback: open an issue at
[github.com/estateaigents/raia-protocol](https://github.com/estateaigents/raia-protocol)
or email protocol@estateaigents.org.
