# RAIA Samples

Copy-and-run examples for implementers who want to test RAIA quickly without a live registry account.

## 1. Start the Mock Registry

```bash
node samples/mock-registry-server.mjs
```

The mock server listens on:

```text
http://localhost:8787/api/raia/v0.2
```

It implements:

- `POST /properties/search`
- `GET /properties/{raia_id}`
- `GET /agents/{raia_id}/verify`
- `POST /enquiries/viewings`
- `POST /consent-tokens`

## 2. Run the JavaScript Demo

In another terminal:

```bash
node samples/http-client-demo.mjs
```

## 3. Run the Python Demo

```bash
python samples/python-client-demo.py
```

## 4. Point the MCP Server at the Mock Registry

```bash
cd mcp
npm ci
npm run build
$env:RAIA_REGISTRY_BASE_URL="http://localhost:8787/api/raia/v0.2"
$env:RAIA_REGISTRY_API_KEY="dev-key"
$env:RAIA_AGENT_ID="org-gb-example"
npm start
```

On macOS/Linux, use `export RAIA_REGISTRY_BASE_URL=...` instead of `$env:...`.

## Copy-Paste Payloads

- [raia-agent.example.json](raia-agent.example.json) - public `/.well-known/raia-agent.json`
- [enquiry-l0-l3.example.json](enquiry-l0-l3.example.json) - full L0-L3 enquiry envelope
