# RAIA Python SDK

Small stdlib-only HTTP client for RAIA Protocol endpoints.

```python
from raia_client import RaiaClient

raia = RaiaClient(
    base_url="https://registry.estateaigents.org/api/raia/v0.2",
    api_key="replace-with-registry-api-key",
    agent_id="org-gb-mybuyeragent",
)

properties = raia.search(
    un_locode="GBLON",
    transaction_type="LETTINGS",
    min_bedrooms=2,
    max_rent_pcm=2500,
)

consent = raia.issue_consent_token(
    data_subject_id="ds_123",
    audience="org-gb-example",
    purpose="viewing",
    level=1,
    property_ref=properties[0]["raia_id"],
    scopes=["enquirer.name", "enquirer.email"],
)
```

The client targets:

- `POST /properties/search`
- `GET /properties/{raia_id}`
- `GET /agents/{raia_id}/verify`
- `POST /enquiries/viewings`
- `POST /consent-tokens`
