# ADR 0001: Public sources only

## Status

Accepted (2026-09-08).

## Context

The wall is meant to speed AppSec delivery on the *classes* of source a delivery
shop already has: SAST, SCA, DAST, IaC, intake, tickets. Those classes exist
inside customer tenants we cannot use. Inventing a tenant, a SOW, a logo, or a
Jira project would fake the proof and attach this record to an employer.

Public stand-ins exist for every class. OWASP Juice Shop is intentionally
vulnerable, versioned, and documented. Semgrep, Trivy/OSV, and ZAP are public
tools. GitHub issues stand in for tickets. Challenge writeups stand in for
intake. Two published tags give a real still/new/gone without a customer export.

## Decision

Train, test, and research on public data only. Target Juice Shop pins
`v16.0.0` (`a9b1dff`) → `v17.0.0` (`1c04f0e`). Layer 1 payloads are
reconstructions shaped like those public tools and **labeled as such**.

Forbidden on this record: customer tenants, SOWs, logos, Jira, live vendor
product APIs, hours as the sell unit, any string that would let a reader
mistake this for an employer's system.

Hours and bill rates are out of scope. The proof is the wall, not a staffing
model.

## Alternatives considered

- **Use a real tenant with secrets redacted.** Rejected — redaction still
  attaches the work to a customer and invites invention where the export is
  thin.
- **Synthetic random findings.** Rejected — clusters, same-bug collapse, and
  gone-≠-fixed only mean something against a real, versioned app.
- **CTF scoreboard.** Rejected — Juice Shop challenges are labeled *runs*
  through the wall, not flags. A solved challenge is not a pass of this system.

## Consequences

- Every pull carries provenance. Reconstructions stay labeled.
- CVE fields are only for IDs that start with `CVE-`. No invented GHSA IDs.
- `imported=*` is an extra engine. Trivy lockfile presence is not in-prod
  (constraint C-REACH).
- Port to bug bounty still uses public or owned-program data. Disclosed reports
  from other companies' programs are not mixed into this target.
