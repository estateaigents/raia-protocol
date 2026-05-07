# RAIA Protocol — Reference Examples

This directory contains realistic, schema-conformant examples of every public RAIA Protocol document.

| File | Validates against | Use for |
|---|---|---|
| `agent-card.json` | `schemas/agent-card.json` | The body served at `/.well-known/raia-agent.json` |
| `listing.json` | `schemas/listing.json` | A single property listing — federated, in `snapshot_listing`, or in a search response |
| `enquiry.json` | `schemas/enquiry.json` | The POST body sent to `endpoints.enquire` |

The example agency (Small London Lettings) is fictional. Phone numbers, Companies House numbers, EPC certificate IDs and email addresses are placeholders chosen to be obviously non-real. Replace before adapting for your own domain.

## How to use these as a starting point

### 1. Self-host an agent card

Copy `agent-card.json` to `/.well-known/raia-agent.json` on your primary domain. Update:

- `agent_id` — pick a slug under `org-{cc}-{your-slug}`. Country code is ISO 3166-1 alpha-2 lower-cased.
- `name`, `display_name`, `description`, `logo_url` — your agency.
- `endpoints.*` — the URLs of your search, property and enquire routes.
- `jurisdictions` — the UN/LOCODE areas you operate in.
- `contact.*`, `companies_house_number` — your details.
- `verification.token` — generate a random opaque string (e.g. `openssl rand -hex 16`) and publish a matching DNS TXT record at `_raia.{your-host}` or a `<meta name="raia-verification" content="{token}">` tag at your homepage.
- `capabilities` — list only what your endpoints actually do.

Serve with `Content-Type: application/json` and `Access-Control-Allow-Origin: *`.

### 2. Publish listings

Each property your agency lists should be representable as a `listing.json` document. The shape is the same whether the listing is:

- served from your `endpoints.search` paginated response;
- written to the RAIA `snapshot_listing` JSONB column;
- mirrored into the `raia-public.tbl_listings` aggregator table; or
- federated to MoveHome.org or other consumers.

For UK long-lets, populate `jurisdiction_extensions.gb` with at least `tenure`, `epc_rating` and `epc_register_url`. For Thai condos, populate `jurisdiction_extensions.th` with at least `ownership_type` and `foreign_ownership_eligible`.

Address-masking rule: anonymous (pre-COMMITTED) responses MUST omit `street_name`, `building_number`, `postcode_full` and the precise `location` point. Use a district centroid for `location` and the outward postcode for `postcode_district`.

### 3. Receive enquiries

Implement a POST endpoint at the URL you announced in `endpoints.enquire`. Validate the body against `schemas/enquiry.json`. On success:

- Idempotent on `enquiry_id` — replays of the same UUID must not create duplicate records.
- Treat `message` as untrusted input. Sanitise before display or LLM processing.
- Rate-limit by `enquirer.email` and `source.user_id_hash` — 5/hour/email and 20/hour/origin are reasonable defaults.
- Respond with the session state (initial state is `IDENTIFIED`, per SPEC.md section 6).

## Validating the examples locally

Any JSON Schema 2020-12 validator works. Two options:

```bash
# Node — ajv (https://ajv.js.org/)
npm install --save-dev ajv ajv-formats
node -e "
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const ajv = new Ajv({allErrors: true});
addFormats(ajv);
const schema = require('../schemas/listing.json');
const data = require('./listing.json');
const valid = ajv.validate(schema, data);
console.log(valid ? 'OK' : ajv.errors);
"
```

```bash
# Python — jsonschema (https://python-jsonschema.readthedocs.io/)
pip install jsonschema
python -c "
import json, jsonschema
schema = json.load(open('../schemas/listing.json'))
data = json.load(open('./listing.json'))
jsonschema.Draft202012Validator(schema).validate(data)
print('OK')
"
```

Each example in this directory is the canonical fixture — if you change the schemas, update the fixtures and the inline `examples` array in the schema together.

## Reference implementation

EstateAigents.com is the reference RAIA Protocol implementation. Production agent card lives at:

```
https://app.estateaigents.com/.well-known/raia-agent.json
```

Source: `github.com/estateaigents/raia-protocol`
