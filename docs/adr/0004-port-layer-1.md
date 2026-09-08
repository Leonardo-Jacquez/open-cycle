# ADR 0004: Port by swapping Layer 1 only

## Status

Accepted (2026-09-08).

## Context

One objective is to replicate or refactor this wall so it fits other sources
and intents. After AppSec is proven, the next intent is bug bounty: scope,
duplicates, impact, report, submit/don't.

If porting means rewriting the harness, the contracts, or the draft core, the
wall was never a wall — it was a one-off AppSec UI. The method of record already
isolates source shape in Layer 1.

## Decision

**Rule:** swap Layer 1 adapters and the query names that are intent-specific.
Keep layers 2–4, the envelope schema, refuse-on-empty, HITL apply/sign, the
no-LLM evaluator, and the instruction/context/output caps.

Keep Q-CLUSTER and Q-FINDING across intents. AppSec-specific queries (Q-DELTA,
Q-WORKLIST, Q-NOISE, Q-CLOSE, Q-GAPS, Q-PACKET) stay. Bounty-specific queries
(Q-SCOPE, Q-DUP, Q-IMPACT) are added, not substituted for the shared ones.

Bounty Layer 1 is still public or owned-program data. Prove AppSec on the two
Juice Shop pins first. Do not start the bounty adapter as a parallel rewrite.

## Alternatives considered

- **Second codebase for bounty.** Rejected — that forks the contracts and
  guarantees drift.
- **Swap layers 2–4 "because reports look different."** Rejected — a report is
  a draft task (`report`, `submit-note`) on the same core, plus intent queries.
  The join/cluster/refuse machinery does not change because the intake form did.
- **Start bounty now, in parallel with AppSec proof.** Rejected — the proof
  unit is one Juice Shop cluster through *this* wall. A second adapter before
  that pass confuses what failed.

## Consequences

- Contracted work is an issue labeled `contracted` + `bounty`, not a silent
  branch of AppSec files.
- New draft tasks (report, severity, submit-note) still cannot write.
- Disclosed reports from unrelated programs are not mixed into the Juice Shop
  target (ADR 0001).
- A port that edits `engine.ts` drop rules "for bounty" needs an ADR, because
  that is no longer a Layer 1 swap.
