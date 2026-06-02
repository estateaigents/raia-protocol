# RAIA SDKs

Client SDKs for building buyer-agent and estate-agent integrations without writing raw MCP or HTTP plumbing.

| SDK | Path | Status |
|---|---|---|
| TypeScript | [typescript/](typescript/) | v0.2.0 |
| Python | [python/](python/) | v0.2.0 |

Both SDKs target the same standard HTTP surface used by the MCP `RegistryHttpAdapter`:

- `POST /properties/search`
- `GET /properties/{raia_id}`
- `GET /agents/{raia_id}/verify`
- `POST /enquiries/viewings`
- `POST /consent-tokens`
