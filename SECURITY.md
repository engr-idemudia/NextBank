# Security Policy

## Dependency Vulnerability Assessment

This project is monitored by GitHub Dependabot. The alerts below have been
reviewed individually. Each entry records the assessment and the decision
taken, rather than applying blanket automated fixes that would introduce
breaking changes to a stable application.

Last reviewed: June 2026.

### Next.js (15 advisories) — Assessed, no action required

The application runs `next@14.2.35`, which is the latest patched release in
the 14.2.x line. Per the official Next.js security guidance, applications on
the 14.x branch should upgrade to the latest 14.2.x release — which is the
version in use here.

Dependabot flags these advisories because its database compares against an
absolute fixed version (16.x) and does not account for fixes backported to
the maintained 14.2.x line. Upgrading to 16.x would force a migration to
React 19 and introduce breaking changes with no security benefit for this
application. The decision is to remain on the patched 14.2.x release.

### postcss (1 advisory) — Assessed, no action required

`postcss` is pulled in transitively by Next.js. The flagged version is bundled
with `next@14.2.35`. It is resolved by the same Next.js version policy
described above. The reported XSS vector concerns CSS stringify output and is
not reachable through this application's usage.

### undici (5 advisories) — Assessed, accepted risk

`undici` is a transitive dependency of `node-appwrite` (the server-side
Appwrite SDK), used internally for HTTP requests to Appwrite Cloud. The
flagged advisories (decompression chains, WebSocket denial-of-service, request
smuggling) require an attacker to control the server the client connects to.
In this application that server is Appwrite Cloud, a trusted managed backend,
so the practical exposure is negligible.

The fix requires upgrading `node-appwrite` from 12.x to 21.x — a major version
change that risks breaking the database and authentication layer. Given the
low real-world risk, the SDK is held at its current version pending a planned,
tested upgrade.

### glob / minimatch (high, dev-only) — Assessed, no production impact

Both packages are pulled in exclusively through `eslint-config-next`, a
development dependency used for linting. They are never bundled into the
production build and are not present in the deployed application. The
`minimatch` ReDoS and `glob` command-injection advisories affect tooling run
locally during development only, not any code served to users.

## Reporting a Vulnerability

If you discover a security issue in this project, please open an issue or
contact the maintainer directly. Do not disclose security-sensitive details
in a public issue until they have been addressed.
