#!/usr/bin/env node
const baseUrl = process.env.RAIA_BASE_URL ?? "http://localhost:8787/api/raia/v0.2";

async function request(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: "Bearer dev-key",
      "x-raia-agent-id": "org-gb-buyeragent",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  }

  return response.json();
}

const search = await request("/properties/search", {
  method: "POST",
  body: JSON.stringify({
    un_locode: "GBLON",
    transaction_type: "LETTINGS",
    min_bedrooms: 2,
    max_rent_pcm: 2500,
    limit: 5,
  }),
});

const property = search.properties[0];
console.log("Search result:", property.raia_id, "-", property.headline);

const verification = await request("/agents/org-gb-example/verify");
console.log("Agent verified:", verification.verified, verification.status);

const consent = await request("/consent-tokens", {
  method: "POST",
  body: JSON.stringify({
    data_subject_id: "ds_sample_001",
    audience: "org-gb-example",
    purpose: "viewing",
    level: 1,
    property_ref: property.raia_id,
    scopes: ["enquirer.name", "enquirer.email"],
    expires_in_seconds: 3600,
  }),
});
console.log("Consent token:", consent.token);

const viewing = await request("/enquiries/viewings", {
  method: "POST",
  body: JSON.stringify({
    property_raia_id: property.raia_id,
    buyer_agent_raia_id: "org-gb-example",
    proposed_slots: [
      {
        start: "2026-07-10T10:00:00Z",
        end: "2026-07-10T10:30:00Z",
      },
    ],
    viewing_type: "IN_PERSON",
    qualification: {
      employment_status: "EMPLOYED",
      income_band: "BAND_75_100K",
      household_size: 2,
      move_in_date: "2026-08-01",
    },
  }),
});

console.log("Viewing enquiry:", viewing.enquiry_id, viewing.state);
