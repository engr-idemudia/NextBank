# Security Policy

## Dependency Vulnerability Assessment

This project is monitored by GitHub Dependabot. Each alert has been reviewed
individually. Where a safe fix existed it was applied; where the only fix was
a breaking major upgrade with no real security benefit, the decision and
reasoning are recorded below.

Last reviewed: June 2026.

## Resolved

### undici (5 advisories) — Fixed via override

`undici` was pulled in transitively by `node-appwrite@12` at version 5.29.0,
which carried five advisories (WebSocket denial-of-service, request smuggling,
unbounded decompression). Rather than force a breaking `node-appwrite` major
upgrade, an npm `overrides` entry pins `undici` to a patched 6.x release
(`^6.24.0`, resolved to 6.26.0). Verified compatible with `node-appwrite@12`
via a clean production build and runtime testing of authentication and
database calls.

### glob / minimatch (high, dev-only) — Fixed via override

`glob` and `minimatch` were pulled in through development tooling
(`eslint-config-next`, `@typescript-eslint`, `tailwindcss`) at vulnerable
versions. Both are pinned to patched releases via npm `overrides`
(`glob ^10.4.6`, `minimatch ^9.0.7`). These packages are dev-only and never
shipped to production; the override removes the advisories at source.

### postcss (direct dependency) — Fixed

The project's direct `postcss` dependency was bumped to `^8.5.15`
(>= the patched 8.5.10), resolving the CSS stringify XSS advisory.

## Assessed — no action required

### Next.js (15 advisories) — Staying on patched 14.2.x

The application runs `next@14.2.35`, the latest patched release in the 14.2.x
line. Per official Next.js security guidance, applications on the 14.x branch
should be on the latest 14.2.x release — which is the case here.

Dependabot flags these advisories because its database compares against an
absolute fixed version (16.x) and does not account for fixes maintained in the
14.2.x line. Upgrading to 16.x would force a migration to React 19 and
introduce breaking changes with no security benefit for this application. The
decision is to remain on the patched 14.2.x release.

### postcss bundled within Next.js — Covered by the above

A separate `postcss` copy is vendored inside `next` itself
(`node_modules/next/node_modules/postcss`) and is pinned by Next. It will be
updated when Next.js is, and is covered by the same 14.2.x version policy.

## Status

As of 9 June 2026, the repository has 0 open Dependabot alerts. The undici,
glob, minimatch, and postcss advisories were fixed via the methods described
above. The Next.js advisories (and the bundled postcss copy) were dismissed in
the GitHub Security tab with the reason "a fix has already been started",
referencing this document — the application is on the patched 14.2.x line.

## Reporting a Vulnerability

If you discover a security issue in this project, please open an issue or
contact the maintainer directly. Do not disclose security-sensitive details
in a public issue until they have been addressed.
