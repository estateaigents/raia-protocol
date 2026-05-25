# RAIA TypeScript SDK

Typed HTTP client for buyer-agent and estate-agent applications using RAIA Protocol endpoints.

```ts
import { RaiaClient } from "@raia-protocol/client";

const raia = new RaiaClient({
  baseUrl: "https://registry.estateaigents.org/api/raia/v0.2",
  apiKey: process.env.RAIA_REGISTRY_API_KEY,
  agentId: "org-gb-mybuyeragent",
});

const properties = await raia.search({
  un_locode: "GBLON",
  transaction_type: "LETTINGS",
  min_bedrooms: 2,
  max_rent_pcm: 2500,
});

const consent = await raia.issueConsentToken({
  data_subject_id: "ds_123",
  audience: "org-gb-example",
  purpose: "viewing",
  level: 1,
  property_ref: properties[0].raia_id,
  scopes: ["enquirer.name", "enquirer.email"],
});
```

The client targets the standard RAIA HTTP surface:

- `POST /properties/search`
- `GET /properties/{raia_id}`
- `GET /agents/{raia_id}/verify`
- `POST /enquiries/viewings`
- `POST /consent-tokens`
