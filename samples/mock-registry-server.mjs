#!/usr/bin/env node
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const port = Number(process.env.PORT ?? 8787);
const basePath = "/api/raia/v0.2";

const agent = {
  raia_id: "org-gb-example",
  name: "Example Estates Ltd",
  verified: true,
  status: "ACTIVE",
  compliance_signals: {
    GB: {
      bodies: [
        {
          name: "ARLA Propertymark",
          membership_id: "M12345",
          verify_url: "https://www.propertymark.co.uk/find-an-expert.html",
          expiry: "2027-03-31",
        },
        {
          name: "TPO",
          membership_id: "TPO-67890",
          verify_url: "https://www.tpos.co.uk",
          expiry: null,
        },
      ],
      client_money_protection: true,
      redress_scheme: "TPO",
    },
  },
  registry_admitted: "2026-05-01",
  mcp_endpoint: "http://localhost:8787/mcp",
  enquiry_endpoint: `${basePath}/enquiries`,
  checked_at: new Date().toISOString(),
};

const properties = [
  {
    raia_id: "prop-gb-example-000001",
    raia_version: "0.2",
    rebuilt_at: new Date().toISOString(),
    agent_card_url: "http://localhost:8787/.well-known/raia-agent.json",
    transaction_type: "LETTINGS",
    status: "AVAILABLE",
    property_type: "FLAT",
    location: {
      district: "Hammersmith",
      postcode_district: "W6",
      un_locode: "GBLON",
      lat: 51.4927,
      lng: -0.2228,
    },
    headline: "2-bed flat, Hammersmith W6",
    description: "A bright two-bedroom flat close to the station. Address is masked until COMMITTED.",
    bedrooms: 2,
    bathrooms: 1,
    reception_rooms: 1,
    floor_area_sqm: 62,
    available_from: "2026-07-01",
    asking_rent_pcm: 2450,
    rent_frequency: "MONTHLY",
    currency: "GBP",
    deposit: 2826,
    furnishing: "FURNISHED",
    parking: ["RESIDENTS_PERMIT"],
    outside_space: ["BALCONY"],
    epc_rating: "C",
    features: ["Balcony", "Close to tube", "Furnished", "Managed property"],
    media: {
      photos: [
        {
          url: "https://example-estates.test/media/prop-gb-example-000001/photo-1.jpg",
          caption: "Living room",
          order: 0,
        },
      ],
    },
    listing_agent: {
      name: "Example Estates Ltd",
      raia_id: "org-gb-example",
      verified: true,
    },
    enquiry_endpoint: `http://localhost:${port}${basePath}/enquiries`,
    session_ttl_hours: 24,
  },
  {
    raia_id: "prop-gb-example-000002",
    raia_version: "0.2",
    rebuilt_at: new Date().toISOString(),
    agent_card_url: "http://localhost:8787/.well-known/raia-agent.json",
    transaction_type: "SALES",
    status: "AVAILABLE",
    property_type: "TERRACED",
    location: {
      district: "Battersea",
      postcode_district: "SW11",
      un_locode: "GBLON",
      lat: 51.4764,
      lng: -0.1543,
    },
    headline: "3-bed terraced house, Battersea SW11",
    bedrooms: 3,
    bathrooms: 2,
    reception_rooms: 2,
    floor_area_sqm: 118,
    asking_price: 875000,
    currency: "GBP",
    tenure: "FREEHOLD",
    parking: ["OFF_STREET"],
    outside_space: ["PRIVATE_GARDEN"],
    epc_rating: "D",
    features: ["Garden", "Freehold", "Off-street parking"],
    listing_agent: {
      name: "Example Estates Ltd",
      raia_id: "org-gb-example",
      verified: true,
    },
    enquiry_endpoint: `http://localhost:${port}${basePath}/enquiries`,
    session_ttl_hours: 720,
  },
];

function json(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "authorization,content-type,x-raia-agent-id",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  });
  response.end(JSON.stringify(payload, null, 2));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function searchProperties(params) {
  return properties.filter((property) => {
    if (params.un_locode && property.location.un_locode !== params.un_locode) return false;
    if (params.transaction_type && property.transaction_type !== params.transaction_type) return false;
    if (params.min_bedrooms != null && (property.bedrooms ?? 0) < params.min_bedrooms) return false;
    if (params.max_rent_pcm != null && property.asking_rent_pcm != null && property.asking_rent_pcm > params.max_rent_pcm) return false;
    if (params.max_price != null && property.asking_price != null && property.asking_price > params.max_price) return false;
    return true;
  }).slice(0, params.limit ?? 10);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

    if (request.method === "OPTIONS") return json(response, 204, {});

    if (request.method === "GET" && url.pathname === "/.well-known/raia-agent.json") {
      return json(response, 200, {
        raia_id: agent.raia_id,
        raia_version: "0.2",
        name: agent.name,
        website: "https://example-estates.test",
        jurisdiction: "GB",
        markets: ["RESIDENTIAL_LETTINGS", "RESIDENTIAL_SALES"],
        coverage: ["GBLON"],
        compliance: agent.compliance_signals,
        verified: true,
        registry_admitted: "2026-05-01",
        max_data_level: 3,
        mcp_endpoint: "http://localhost:8787/mcp",
        a2a_endpoint: "http://localhost:8787/a2a",
        a2a_agent_card_url: "http://localhost:8787/.well-known/agent.json",
        enquiry_endpoint: `http://localhost:${port}${basePath}/enquiries`,
        consent_endpoint: `http://localhost:${port}${basePath}/consent-tokens`,
        published_at: new Date().toISOString(),
      });
    }

    if (!url.pathname.startsWith(basePath)) {
      return json(response, 404, { error: "NOT_FOUND" });
    }

    const route = url.pathname.slice(basePath.length);

    if (request.method === "POST" && route === "/properties/search") {
      const params = await readJson(request);
      return json(response, 200, { count: searchProperties(params).length, properties: searchProperties(params) });
    }

    if (request.method === "GET" && route.startsWith("/properties/")) {
      const raiaId = decodeURIComponent(route.replace("/properties/", ""));
      const property = properties.find((item) => item.raia_id === raiaId);
      return property ? json(response, 200, property) : json(response, 404, { error: "PROPERTY_NOT_FOUND" });
    }

    if (request.method === "GET" && route.startsWith("/agents/") && route.endsWith("/verify")) {
      const raiaId = decodeURIComponent(route.replace("/agents/", "").replace("/verify", ""));
      return raiaId === agent.raia_id
        ? json(response, 200, { ...agent, checked_at: new Date().toISOString() })
        : json(response, 200, {
            raia_id: raiaId,
            name: "Unknown",
            verified: false,
            status: "NOT_FOUND",
            checked_at: new Date().toISOString(),
          });
    }

    if (request.method === "POST" && route === "/enquiries/viewings") {
      const body = await readJson(request);
      const property = properties.find((item) => item.raia_id === body.property_raia_id);
      const ttl = property?.session_ttl_hours ?? 24;
      return json(response, 201, {
        enquiry_id: randomUUID(),
        state: body.qualification ? "DATA_GATHERING" : "IDENTIFIED",
        session_ttl_hours: ttl,
        expires_at: new Date(Date.now() + ttl * 3600 * 1000).toISOString(),
        enquiry_endpoint: `http://localhost:${port}${basePath}/enquiries`,
      });
    }

    if (request.method === "POST" && route === "/consent-tokens") {
      const body = await readJson(request);
      const issuedAt = new Date();
      const expiresAt = new Date(issuedAt.getTime() + (body.expires_in_seconds ?? 3600) * 1000);
      return json(response, 201, {
        token: `ct_l${body.level}_${randomUUID().replaceAll("-", "")}`,
        token_type: "Bearer",
        level: body.level,
        scopes: body.scopes ?? [],
        issued_at: issuedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      });
    }

    return json(response, 404, { error: "NOT_FOUND" });
  } catch (error) {
    return json(response, 500, { error: "SERVER_ERROR", detail: String(error) });
  }
});

server.listen(port, () => {
  console.log(`RAIA mock registry listening at http://localhost:${port}${basePath}`);
});
