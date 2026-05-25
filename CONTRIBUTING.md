# Contributing to RAIA Protocol

Thank you for contributing to the open standard for AI agents to transact property. This document covers what we welcome, how to propose changes, and the **git workflow and naming conventions** all community contributors should follow.

For governance and protocol evolution rules, see [GOVERNANCE.md](GOVERNANCE.md).

---

## What We Welcome

**Conformance tests** — schema fixtures, MCP tool tests, consent-token validation tests, and registry adapter tests.

**SDK improvements** — TypeScript and Python clients under `/sdk/typescript/` and `/sdk/python/`.

**Jurisdictional modules** — add or improve `/modules/{CC}/README.md` using GB, TH, SG, US, or EU as templates.

**L2/L3 review** — KYC, AML, consent, Agent Identity Credential, erasure, and data-residency schema review.

**Spec improvements** — clarity, gaps, ambiguities, and compatibility notes for A2A, MCP, and direct HTTPS implementers.

---

## Current Priorities

1. v0.2 conformance fixtures for `agent.json`, `property.json`, and `enquiry.json`.
2. Production registry adapter hardening and auth examples.
3. SDK tests and typed examples.
4. Jurisdiction module depth for SG, US state overlays, EU member-state overlays, and TH foreign quota workflows.
5. Consent-token interoperability tests.

---

## Contribution Process

1. **Search existing issues** — avoid duplicate work.
2. **Open an issue** describing the change and why (unless it is a trivial typo fix).
3. **Wait for maintainer acknowledgement** — target: 5 business days.
4. **Fork, branch, implement** — follow the git workflow below.
5. **Open a pull request** referencing the issue.
6. **Include samples or tests** when behaviour changes.
7. **Maintainer review and merge.**

For schema design discussions, label your issue `schema-working-group`.

---

## Git Workflow (Community Contributors)

RAIA Protocol is hosted on GitHub at [github.com/estateaigents/raia-protocol](https://github.com/estateaigents/raia-protocol). Most contributors do not have direct push access. Use the **fork workflow**.

### 1. Fork and clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/raia-protocol.git
cd raia-protocol
git remote add upstream https://github.com/estateaigents/raia-protocol.git
```

### 2. Stay up to date

Before starting work or opening a PR, sync with the canonical repo:

```bash
git fetch upstream
git checkout master
git merge upstream/master
git push origin master
```

### 3. Create a branch

Always branch from an up-to-date `master`:

```bash
git checkout -b feat/schemas-property-v0-2 upstream/master
```

See [Branch naming](#branch-naming) below.

### 4. Commit your changes

Use [Conventional Commits](#commit-messages). Keep commits focused — one logical change per commit where possible.

```bash
git add .
git commit -m "feat(schemas): add tenure and parking fields to property.json"
```

### 5. Push to your fork

```bash
git push -u origin feat/schemas-property-v0-2
```

### 6. Open a pull request

Open a PR from **your fork's branch** → **`estateaigents/raia-protocol` `master`**.

- Title: same format as commit messages (see below).
- Body: reference the issue (`Fixes #42` or `Relates to #42`).
- Describe what changed, why, and how to verify.
- Include schema samples, screenshots, or test output where relevant.

### 7. Respond to review

Address feedback with additional commits on the same branch. Do not force-push unless a maintainer asks you to rebase.

### Maintainer merge target

All community PRs merge into `master` on `estateaigents/raia-protocol`. Maintainers may squash-merge for a clean history.

---

## Naming Conventions

These conventions apply to **branches**, **commits**, and **pull request titles**. Consistency helps maintainers triage and release-note generation.

### Branch naming

Format:

```text
<type>/<scope>-<short-description>
```

| Part | Rule | Examples |
|---|---|---|
| `type` | Change category (required) | `feat`, `fix`, `docs`, `schema`, `test`, `chore`, `refactor` |
| `scope` | Area of the repo (required) | `schemas`, `mcp`, `sdk`, `modules-gb`, `spec`, `security`, `site` |
| `short-description` | Kebab-case, ≤ 5 words (required) | `property-v0-2`, `consent-token-fix`, `gb-right-to-rent` |

**Examples (good):**

```text
feat/schemas-property-v0-2
fix/mcp-registry-adapter
docs/modules-th-leasehold
schema/enquiry-l2-kyc
test/schemas-agent-fixtures
chore/sdk-typescript-deps
```

**Examples (avoid):**

```text
task/enhancement              # vague — use feat/ or docs/ with a scope
my-changes                    # no type or scope
feat/schemas                  # missing description
claude/auto-fix-abc123        # bot-specific names — rename before opening PR
```

#### Type guide

| Type | Use when |
|---|---|
| `feat` | New capability, schema field, MCP tool behaviour, SDK method |
| `fix` | Bug fix, incorrect spec text, broken example |
| `docs` | Documentation, jurisdiction modules, ADRs, README — no code behaviour change |
| `schema` | JSON Schema-only changes (alternative to `feat(schemas)` — either is acceptable) |
| `test` | Tests and fixtures only |
| `chore` | Dependencies, CI, tooling, formatting |
| `refactor` | Restructure without changing external behaviour |

#### Scope guide

| Scope | Path / area |
|---|---|
| `schemas` | `/schemas/` |
| `mcp` | `/mcp/` |
| `sdk` | `/sdk/typescript/`, `/sdk/python/` |
| `modules-{cc}` | `/modules/GB/`, `/modules/TH/`, etc. (lowercase ISO code) |
| `spec` | `SPEC.md` |
| `security` | `SECURITY.md`, auth ADRs |
| `site` | `index.html`, `faq.html`, `charter.html` |
| `governance` | `GOVERNANCE.md`, `CHARTER.md` |
| `samples` | `/samples/` |

Long-running work may use a short epic prefix if agreed in the issue:

```text
feat/schemas-v1-0-agent-card
feat/schemas-v1-0-enquiry-l3
```

---

### Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Rules:**

- Subject line ≤ 72 characters, imperative mood ("add" not "added").
- Scope matches branch scope where possible.
- Reference issues in the footer: `Fixes #123` or `Relates to #456`.
- Breaking changes: add `BREAKING CHANGE:` in the body or `!` after type — required for schema breaking changes per [GOVERNANCE.md](GOVERNANCE.md).

**Examples:**

```text
feat(schemas): add transaction_type and status to property.json

Fixes #87
```

```text
docs(modules-gb): map Rightmove status integers to RAIA status enum
```

```text
fix(mcp): reject viewing requests from unregistered buyer agents
```

```text
schema(enquiry)!: require jurisdiction on all enquiry objects

BREAKING CHANGE: jurisdiction is now a required field on enquiry.json v0.3.
```

---

### Pull request titles

Use the same format as commit messages:

```text
feat(schemas): add agent.json discovery card schema
docs(modules-th): document foreign quota verification workflow
fix(sdk): handle 404 from registry verify endpoint
```

If the PR contains multiple commits, the title should describe the overall change. Maintainers may squash-merge using the PR title.

---

### Issue titles

Format:

```text
[<area>] <short description>
```

**Examples:**

```text
[schemas] Add council_tax_band to GB property compliance signals
[mcp] RegistryHttpAdapter should retry on 429
[modules-SG] Define accepted compliance bodies
[security] Clarify L3 payment reference resolution flow
```

Use labels where available: `schema-working-group`, `jurisdiction-module`, `bug`, `documentation`, `good first issue`.

---

## What to Include in a PR

| Change type | Include |
|---|---|
| Schema change | Updated JSON Schema, sample fixture in `/samples/`, note in `schemas/README.md` |
| Spec change | Updated `SPEC.md` section, cross-link from `README.md` if user-facing |
| MCP / SDK change | Code + README update + manual test steps |
| Jurisdiction module | `/modules/{CC}/README.md` following GB template structure |
| Security / auth | Update `SECURITY.md` and/or ADR in `/docs/adr/` |
| Breaking change | `BREAKING CHANGE` footer, migration note, GOVERNANCE-compliant deprecation period |

**Do not commit:**

- Secrets (`.env`, API keys, credentials)
- `node_modules/`, `dist/`, build artefacts (see `.gitignore`)
- Vendor reference code (e.g. PropertyHive plugins under `/propertyhive/`)

---

## Local Development Quick Reference

```bash
# MCP server
cd mcp && npm install && npm run build && npm start

# TypeScript SDK
cd sdk/typescript && npm install && npm run build

# Python SDK
cd sdk/python && pip install -e .
```

Copy `mcp/.env.example` to `mcp/.env` for local registry configuration. Never commit `.env`.

---

## Code of Conduct

Professional standards body. Contributions should be constructive, specific, evidence-based, and respectful.

---

## Questions

- Protocol design: open a GitHub issue with label `schema-working-group`
- Registry / early implementer access: protocol@estateaigents.org
- Governance: see [GOVERNANCE.md](GOVERNANCE.md)
