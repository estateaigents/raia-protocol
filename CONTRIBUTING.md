# Contributing to RAIA Protocol

## What We Welcome

**Conformance tests** - schema fixtures, MCP tool tests, consent-token validation tests, and registry adapter tests.

**SDK improvements** - TypeScript and Python clients live under `/sdk/typescript/` and `/sdk/python/`.

**Jurisdictional modules** - add or improve `/modules/{CC}/README.md` using GB, TH, SG, US, or EU as templates.

**L2/L3 review** - KYC, AML, consent, Agent Identity Credential, erasure, and data-residency schema review.

**Spec improvements** - clarity, gaps, ambiguities, and compatibility notes for A2A, MCP, and direct HTTPS implementers.

## Current Priorities

1. v0.2 conformance fixtures for `agent.json`, `property.json`, and `enquiry.json`.
2. Production registry adapter hardening and auth examples.
3. SDK tests and typed examples.
4. Jurisdiction module depth for SG, US state overlays, EU member-state overlays, and TH foreign quota workflows.
5. Consent-token interoperability tests.

## Process

1. Open an issue describing the change and why.
2. Maintainer acknowledgement target: 5 business days.
3. Open a PR referencing the issue.
4. Include schema samples or tests when behavior changes.
5. Maintainer review and merge.

## Code of Conduct

Professional standards body. Contributions should be constructive, specific, evidence-based, and respectful.
