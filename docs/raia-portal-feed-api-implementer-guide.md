# RAIA Portal Feed API — Implementer's Build Guide

> **Status:** Draft v0.1.0 (May 2026)
> **Spec:** [`openapi/raia-portal-feed-api.yaml`](../openapi/raia-portal-feed-api.yaml)
> **Developer guide:** [`docs/raia-portal-feed-api.md`](raia-portal-feed-api.md)

This document is for teams **implementing** the RAIA Portal Feed API on their own website or platform. You are the **server**. Callers (CRM systems, portals, partner integrations) are the **clients**.

---

## Table of Contents

1. [What you are building](#1-what-you-are-building)
2. [Endpoints to implement](#2-endpoints-to-implement-priority-order)
3. [Authentication](#3-authentication--what-you-must-implement)
4. [PUT /listings/{reference}](#4-put-listingsreference--the-core-ingestion-endpoint)
5. [DELETE /listings/{reference}](#5-delete-listingsreference--remove-a-listing)
6. [GET /listings/{reference}](#6-get-listingsreference--retrieve-a-listing)
7. [Branch endpoints](#7-branch-endpoints)
8. [Product activation endpoints](#8-product-activation-endpoints)
9. [Error format](#9-error-format--every-4xx-and-5xx)
10. [Implementation checklist](#10-implementation-checklist)
11. [Quick start — first curl test](#11-quick-start--first-curl-test)

---

## 1. What you are building

You expose **13 HTTP endpoints** on your domain. Other systems call them to push listings into your platform, pull your inventory, get stats, and request product activations.

```text
Base path:  https://yourdomain.com/api/raia/portal/v1
Token path: https://yourdomain.com/oauth/token
Health:     https://yourdomain.com/api/raia/portal/v1/healthz
```

Replace `yourdomain.com` with your production hostname. Use a separate staging hostname for sandbox testing.

---

## 2. Endpoints to implement (priority order)

Start with the listing group — it is the core ingestion surface. Everything else is read-only or optional.

### Priority 1 — Listing ingestion (write)

| Method | Path | Operation | Scope required |
|---|---|---|---|
| `PUT` | `/listings/{reference}` | Create or update a listing | `feed.write` |
| `DELETE` | `/listings/{reference}` | Remove a listing | `feed.write` |
| `GET` | `/listings/{reference}` | Read back a listing | `feed.read` |

### Priority 2 — Branch reads (reconciliation + reporting)

| Method | Path | Operation | Scope required |
|---|---|---|---|
| `GET` | `/branches/{branch_id}/listings` | Paginated inventory snapshot | `feed.read` |
| `GET` | `/branches/{branch_id}/performance` | Daily stats | `feed.read` |
| `GET` | `/branches/{branch_id}/enquiries` | Lead polling | `feed.read` |

### Priority 3 — Product activations

| Method | Path | Operation | Scope required |
|---|---|---|---|
| `GET` | `/products/premium-listings` | List activations | `feed.read` |
| `POST` | `/products/premium-listings` | Request activation | `products.write` |
| `GET` | `/products/premium-listings/{activation_id}` | Get activation | `feed.read` |
| `GET` | `/products/featured-properties` | List activations | `feed.read` |
| `POST` | `/products/featured-properties` | Request activation | `products.write` |
| `GET` | `/products/featured-properties/{activation_id}` | Get activation | `feed.read` |

### Always required

| Method | Path | Operation | Auth |
|---|---|---|---|
| `GET` | `/healthz` | Liveness probe | None |
| `POST` | `/oauth/token` | Issue access tokens | Basic (`client_id:client_secret`) |

---

## 3. Authentication — what you must implement

You run the OAuth2 token endpoint. Callers receive a `client_id` and `client_secret` from you during onboarding. They call your token endpoint, get a Bearer JWT, and send it on every API request.

### Token endpoint spec

```http
POST /oauth/token HTTP/1.1
Host: yourdomain.com
Authorization: Basic BASE64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&scope=feed.read feed.write products.write
```

Response you must return:

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "feed.read feed.write products.write"
}
```

### Token validation (every endpoint)

On every API request, your server must:

1. Extract `Authorization: Bearer <token>` from the header.
2. Verify the JWT signature (RS256 recommended; your private key, clients verify with your public key).
3. Check the `exp` claim — reject expired tokens with `401`.
4. Check the scope claim matches what the endpoint requires — reject wrong scope with `403`.
5. Extract the `client_id` / `sub` claim to know which branch or org the caller represents.

### Scopes and endpoint mapping

| Scope | Endpoints |
|---|---|
| `feed.write` | `PUT /listings/{reference}`, `DELETE /listings/{reference}` |
| `feed.read` | `GET /listings/{reference}`, all `GET /branches/*`, all `GET /products/*` |
| `products.write` | `POST /products/premium-listings`, `POST /products/featured-properties` |

### Production recommendations

- Token TTL: **≤ 1 hour** (`expires_in: 3600`).
- Store `client_secret` hashed (bcrypt or argon2); never log or return it.
- Issue separate credentials per integrator with the minimum scopes they need.
- Rate limit the token endpoint independently (for example 10 requests/minute per client).

---

## 4. `PUT /listings/{reference}` — the core ingestion endpoint

This is the most important endpoint. Every listing flows through here.

### Path parameter

| Name | Type | Rule |
|---|---|---|
| `reference` | string | Pattern `^[A-Za-z0-9_-]{1,100}$`. Caller-controlled. Unique per branch. New reference → create. Existing reference → update. |

### Discriminator — residential vs commercial

The request body carries a `kind` field (`residential` or `commercial`) that determines the payload shape.

### Residential — minimum valid payload

```json
{
  "kind": "residential",
  "transaction_type": "LETTINGS",
  "status": "AVAILABLE",
  "property_type": "FLAT",
  "headline": "2-bed flat, Hammersmith W6",
  "address": {
    "display_address": "42 King Street, London W6 9TA",
    "postcode": "W6 9TA",
    "country": "GB"
  }
}
```

### Residential — full field reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `kind` | `"residential"` | Yes | Discriminator |
| `transaction_type` | `SALES` \| `LETTINGS` | Yes | |
| `status` | See status enum | Yes | |
| `property_type` | See property_type enum | Yes | |
| `headline` | string ≤200 | Yes | |
| `address.display_address` | string ≤120 | Yes | |
| `address.postcode` | string ≤12 | Yes | |
| `address.country` | ISO 3166 alpha-2 | Yes | e.g. `GB`, `TH` |
| `description` | string ≤10000 | No | |
| `bedrooms` | integer ≥0 | No | |
| `bathrooms` | integer ≥0 | No | |
| `reception_rooms` | integer ≥0 | No | |
| `floor_area_sqm` | number ≥0 | No | |
| `available_from` | date ISO 8601 | No | `YYYY-MM-DD` |
| `asking_price` | number ≥0 | If SALES | |
| `asking_rent_pcm` | number ≥0 | If LETTINGS | Per calendar month |
| `rent_frequency` | `MONTHLY` \| `YEARLY` \| `WEEKLY` | No | |
| `deposit` | number ≥0 | No | |
| `currency` | ISO 4217 | No | e.g. `GBP`, `THB` |
| `tenure` | See tenure enum | No | SALES only |
| `furnishing` | See furnishing enum | No | LETTINGS only |
| `epc_rating` | `A`–`G` | No | Single letter |
| `features` | string[] ≤200 each, max 20 | No | |
| `parking` | See parking enum[] | No | |
| `outside_space` | See outside_space enum[] | No | |
| `address.latitude` | float -90→90 | No | |
| `address.longitude` | float -180→180 | No | |
| `media.photos` | MediaAsset[] | No | |
| `media.floor_plans` | MediaAsset[] | No | |
| `media.epcs` | MediaAsset[] | No | |
| `media.brochures` | MediaAsset[] | No | URLs must end in `.pdf` |
| `media.virtual_tours` | MediaAsset[] | No | |
| `public_card.raia_id` | `prop-{cc}-{slug}-{n}` | No | Stable public id |
| `public_card.publish` | boolean | No | Default `true` |
| `public_card.suppress_address` | boolean | No | Default `true` |

### Status enum

```text
AVAILABLE       # live and marketable
UNDER_OFFER     # offer received, still showing
SOLD_STC        # sold subject to contract
SOLD_STCM       # sold subject to contract and mortgage
RESERVED        # reserved
LET_AGREED      # let agreed, subject to referencing
OFF_MARKET      # not currently being marketed
WITHDRAWN       # removed from market
```

### Property type enum (residential)

```text
FLAT  APARTMENT  STUDIO  MAISONETTE  TERRACED  END_TERRACE
SEMI_DETACHED  DETACHED  BUNGALOW  COTTAGE  TOWNHOUSE  LAND  OTHER
```

### Tenure enum (sales)

```text
FREEHOLD  LEASEHOLD  SHARE_OF_FREEHOLD  COMMONHOLD
```

### Furnishing enum (lettings)

```text
FURNISHED  PART_FURNISHED  UNFURNISHED  FURNISHED_OR_UNFURNISHED
```

### MediaAsset fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `url` | URI ≤1024 | Yes | Publicly accessible |
| `description` | string ≤200 | No | |
| `order` | integer ≥0 | No | Display order |
| `etag` | string | No | For cache validation |

### Commercial — minimum valid payload

```json
{
  "kind": "commercial",
  "transaction_type": "LETTINGS",
  "building": {
    "reference": "BLD_LON_001",
    "status": "AVAILABLE",
    "primary_classification": {
      "classification": "OFFICE",
      "sub_type": "SERVICED_OFFICE"
    },
    "address": {
      "display_address": "33 Soho Square, London",
      "postcode": "W1D 3QU",
      "country": "GB"
    }
  }
}
```

### Commercial rules

- `building.reference` must match the path `{reference}`.
- Each space in `building.spaces[]` must have a `reference` that is unique and **different** from the building reference.
- Maximum **50 spaces** per building.
- `spaces[].primary_classification` is required for every space.
- If all spaces have no pricing, pricing at building level is required.

### Commercial classification families

```text
OFFICE  INDUSTRIAL_AND_LOGISTICS  RETAIL
LEISURE_AND_HOSPITALITY  LAND_AND_DEVELOPMENT  OTHER
```

### Responses you must return

| Situation | HTTP status | Body |
|---|---|---|
| New reference, listing created | `201 Created` | `ListingSaveAction` with `action: CREATED` |
| Existing reference, listing updated | `200 OK` | `ListingSaveAction` with `action: UPDATED` |
| Payload identical to stored — no change | `200 OK` | `ListingSaveAction` with `action: NO_CHANGE` |
| Queue-based async ingestion | `202 Accepted` | `AsyncAccepted` with `request_id` |
| Validation failure | `400 Bad Request` | `ProblemDetail` with `validation_errors[]` |
| Invalid or missing token | `401 Unauthorized` | `ProblemDetail` |
| Wrong scope | `403 Forbidden` | `ProblemDetail` |
| Reference conflict | `409 Conflict` | `ProblemDetail` |
| Rate limit hit | `429 Too Many Requests` | `ProblemDetail` + rate limit headers |

### ListingSaveAction response body

```json
{
  "reference": "REF_001",
  "action": "CREATED",
  "updated_at": "2026-05-28T06:00:00Z",
  "version": 1,
  "public_card_url": "https://yourdomain.com/properties/prop-gb-example-000001"
}
```

### AsyncAccepted response body (when using `202`)

```json
{
  "status": "QUEUED",
  "request_id": "req_01HZK2D5G2A0Z9Y3F7H4F1Q3T9",
  "polling_url": "https://yourdomain.com/api/raia/portal/v1/listings/REF_001"
}
```

---

## 5. `DELETE /listings/{reference}` — remove a listing

Unlike typical DELETE endpoints, a **request body is required**.

### Request body

```json
{
  "removal_reason": "LET_BY_US",
  "branch_id": "56726",
  "removed_at": "2026-05-28T06:00:00Z",
  "note": "Tenant signed lease 27 May."
}
```

| Field | Required | Notes |
|---|---|---|
| `removal_reason` | Yes | See removal reason enum |
| `branch_id` | No | Integer or string |
| `removed_at` | No | ISO 8601 datetime |
| `note` | No | string ≤500 |

### Removal reason enum

```text
SOLD_BY_US
SOLD_BY_ANOTHER_AGENT
LET_BY_US
LET_BY_ANOTHER_AGENT
WITHDRAWN_FROM_MARKET
LOST_INSTRUCTION
REMOVED
```

### Response on success (`200`)

```json
{
  "reference": "REF_001",
  "removed_at": "2026-05-28T06:00:00Z",
  "removal_reason": "LET_BY_US"
}
```

Deleting a building reference also removes all its spaces. Deleting an already-removed listing returns `200` (idempotent).

---

## 6. `GET /listings/{reference}` — retrieve a listing

Optional header: `X-RAIA-Branch-Id` scopes the read to a specific branch. Without it, the caller sees all listings their credentials grant access to.

### Response (`200`)

```json
{
  "reference": "REF_001",
  "branch_id": "56726",
  "transaction_type": "LETTINGS",
  "status": "AVAILABLE",
  "kind": "residential",
  "residential": {},
  "public_card_url": "https://yourdomain.com/properties/prop-gb-example-000001",
  "created_at": "2026-05-28T06:00:00Z",
  "updated_at": "2026-05-28T06:00:00Z",
  "version": 3
}
```

Return `404` when the reference does not exist or the caller lacks access.

---

## 7. Branch endpoints

### `GET /branches/{branch_id}/listings`

Returns a paginated reconciliation snapshot. Callers diff this against their CRM to find missing or extra listings.

| Query param | Type | Notes |
|---|---|---|
| `transaction_type` | `SALES` \| `LETTINGS` | Optional filter |
| `status` | status enum | Optional filter |
| `updated_since` | ISO 8601 datetime | Only listings changed after this timestamp |
| `page` | integer ≥1, default 1 | |
| `per_page` | integer 1–200, default 50 | |

Response:

```json
{
  "meta": { "page": 1, "per_page": 50, "total": 127 },
  "listings": [
    {
      "reference": "REF_001",
      "transaction_type": "LETTINGS",
      "status": "AVAILABLE",
      "kind": "residential",
      "public_card_url": "https://yourdomain.com/properties/prop-gb-example-000001",
      "updated_at": "2026-05-28T06:00:00Z",
      "version": 3
    }
  ]
}
```

### `GET /branches/{branch_id}/performance`

Required query params: `from` and `to` (dates). Cap the window at **28 days**.

Optional: `portal` to filter by downstream portal name (for example `RIGHTMOVE`, `ZOOPLA`).

Response:

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

### `GET /branches/{branch_id}/enquiries`

Cursor-based polling. Callers pass `since_enquiry_id` from the previous response's `next_cursor`.

| Query param | Type | Notes |
|---|---|---|
| `since_enquiry_id` | string | Cursor from last poll |
| `since` | datetime | Alternative timestamp filter |
| `limit` | integer 1–500, default 100 | |

Response:

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

L1+ personal data in `contact.*` must be backed by a valid `consent_token_ref`. See [`SECURITY.md`](../SECURITY.md).

---

## 8. Product activation endpoints

### Request Premium Listing activation

```http
POST /api/raia/portal/v1/products/premium-listings
Authorization: Bearer ...
Content-Type: application/json
```

```json
{
  "customer_listing_id": "REF_001",
  "highlights": [{ "id": 1 }]
}
```

At least one of `listing_id` or `customer_listing_id` is required.

Response (`201`):

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

### Request Featured Property activation

```http
POST /api/raia/portal/v1/products/featured-properties
```

```json
{
  "customer_listing_id": "REF_001"
}
```

### Activation status enum

```text
PENDING  ACTIVE  EXPIRED  REJECTED  CANCELLED
```

Poll `GET /products/premium-listings/{activation_id}` or `GET /products/featured-properties/{activation_id}` until the status is terminal.

---

## 9. Error format — every 4xx and 5xx

All error responses use `Content-Type: application/problem+json` (RFC 7807):

```json
{
  "type": "https://yourdomain.com/errors/validation",
  "title": "Validation failed",
  "status": 400,
  "detail": "address.postcode is required.",
  "instance": "/api/raia/portal/v1/listings/REF_001",
  "trace_id": "01HZK2D5G2A0Z9Y3F7H4F1Q3T9",
  "timestamp": "2026-05-28T06:01:23Z",
  "validation_errors": [
    {
      "field": "address.postcode",
      "message": "Postcode is required.",
      "code": "MISSING"
    }
  ]
}
```

Rate limit responses (`429`) must also include:

```http
Retry-After: 45
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1716869160
```

Default quota: **60 requests per minute** per credential per endpoint group.

---

## 10. Implementation checklist

### Infrastructure

- [ ] HTTPS on your base URL (TLS 1.2+ required)
- [ ] Token endpoint: `POST /oauth/token`
- [ ] Token store: `client_id` / hashed `client_secret` / allowed scopes per credential
- [ ] JWT issuance: RS256, `exp` = now + 3600
- [ ] JWT validation middleware on all endpoints except `/healthz`

### Database schema (minimum)

- [ ] `listings` table: `reference` (PK), `branch_id`, `kind`, `transaction_type`, `status`, payload JSONB, `created_at`, `updated_at`, `version`, `removed_at`, `removal_reason`
- [ ] `enquiries` table: `enquiry_id` (PK), `listing_reference`, `received_at`, `source`, payload JSONB, `cursor_seq` (for `next_cursor`)
- [ ] `product_activations` table: `id` (UUID PK), `product`, `status`, `customer_listing_id`, `created_at`, `starts_at`, `ends_at`

### Listing endpoints

- [ ] `PUT /listings/{reference}` — upsert + versioning + `200`/`201`/`202`
- [ ] `GET /listings/{reference}` — read + `404`
- [ ] `DELETE /listings/{reference}` — soft-delete + `removal_reason` + `200`/`202`

### Branch endpoints

- [ ] `GET /branches/{branch_id}/listings` — pagination + filters
- [ ] `GET /branches/{branch_id}/performance` — date range, 28-day cap
- [ ] `GET /branches/{branch_id}/enquiries` — cursor polling

### Product endpoints

- [ ] `GET /products/premium-listings`
- [ ] `POST /products/premium-listings`
- [ ] `GET /products/premium-listings/{activation_id}`
- [ ] `GET /products/featured-properties`
- [ ] `POST /products/featured-properties`
- [ ] `GET /products/featured-properties/{activation_id}`

### Cross-cutting

- [ ] `GET /healthz` — no auth; returns `{ status, version, checked_at }`
- [ ] Rate limiting: 60 req/min per credential; `429` + `Retry-After` on breach
- [ ] RFC 7807 `ProblemDetail` on every 4xx/5xx
- [ ] `trace_id` on every response (log it server-side)
- [ ] Input validation: reference pattern `^[A-Za-z0-9_-]{1,100}$`
- [ ] Idempotency: re-PUT same payload → `200` with `action: NO_CHANGE`
- [ ] Commercial: reject if `space.reference == building.reference` → `400`
- [ ] Commercial: reject if `spaces.length > 50` → `400`
- [ ] Derive public RAIA property card from each listing when `public_card.publish` is true

---

## 11. Quick start — first curl test

Once `PUT /listings/{reference}` and the token endpoint are working:

```bash
# 1. Get a token
TOKEN=$(curl -s -X POST https://yourdomain.com/oauth/token \
  -u "your_client_id:your_client_secret" \
  -d "grant_type=client_credentials&scope=feed.write" \
  | jq -r .access_token)

# 2. Push a listing
curl -X PUT https://yourdomain.com/api/raia/portal/v1/listings/TEST_001 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "kind": "residential",
    "transaction_type": "LETTINGS",
    "status": "AVAILABLE",
    "property_type": "FLAT",
    "headline": "2-bed flat, test",
    "asking_rent_pcm": 2000,
    "currency": "GBP",
    "address": {
      "display_address": "1 Test Street, London",
      "postcode": "SW1A 1AA",
      "country": "GB"
    }
  }'

# Expected: 201 with { "reference": "TEST_001", "action": "CREATED", ... }

# 3. Re-send identical payload → must return 200 action:NO_CHANGE
# 4. Change asking_rent_pcm → must return 200 action:UPDATED
# 5. DELETE with removal_reason → must return 200
```

### Delete test

```bash
curl -X DELETE https://yourdomain.com/api/raia/portal/v1/listings/TEST_001 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "removal_reason": "REMOVED",
    "removed_at": "2026-05-28T06:00:00Z"
  }'
```

---

## Related documents

| Document | Purpose |
|---|---|
| [`openapi/raia-portal-feed-api.yaml`](../openapi/raia-portal-feed-api.yaml) | Machine-readable OpenAPI 3.1 contract |
| [`docs/raia-portal-feed-api.md`](raia-portal-feed-api.md) | General developer guide and capability map |
| [`SECURITY.md`](../SECURITY.md) | Consent tokens and L1+ data handling |
| [`schemas/property.json`](../schemas/property.json) | Public RAIA property card schema |

Questions: open an issue at [github.com/estateaigents/raia-protocol](https://github.com/estateaigents/raia-protocol) or email protocol@estateaigents.org.
