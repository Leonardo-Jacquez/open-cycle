# Where this project stands

**Last verified:** 2026-09-08, `main` `58aedb9`, protocol rev `2026-09-08`.
Measured against PROTOCOL.md in this tree, not relayed.

This is the only owner-facing status file. `PROTOCOL.md` is the canon.
`docs/adr/` is why. Merged PRs on this repo are the ground truth for the record.

This repository is the **public protocol record**. The research bench UI is a
separate runtime that renders `src/lib/appsec/protocol.ts`. Those facts must
match PROTOCOL.md. Sebas fails a PR that restates the canon in README or
AGENTS.md.

## Built

| Item | Notes |
|---|---|
| Four-layer wall on Juice Shop pins | `v16.0.0` (`a9b1dff`) baseline → `v17.0.0` (`1c04f0e`) current |
| Named query registry + refuse-on-empty | Q-DELTA, Q-CLUSTER, Q-WORKLIST, Q-NOISE, Q-CLOSE, Q-GAPS, Q-PACKET, Q-FINDING |
| Deterministic delta / drop / collapse / evaluator | Scripts count. No-LLM packet score. |
| Envelope-only drafts, HITL apply/sign | Four tasks. Model cannot mutate tickets or the packet. |
| This protocol as single canonical copy | PROTOCOL.md (prose) · protocol.ts (Brief renders it) |
| Sebas | GitHub librarian. Distinct from `se-release-engineer`. Lives in this repo and in `Leonardo-Jacquez/agent-teams-plugin`. |

## Contracted

PROTOCOL.md BUILD table is the list. Each row has a labeled issue.

1. Compiled knowledge graph as the only Layer 3 store — [#1](https://github.com/Leonardo-Jacquez/open-cycle/issues/1)
2. Executable write hook beyond UI (AST / PreToolUse analog) — [#2](https://github.com/Leonardo-Jacquez/open-cycle/issues/2)
3. Bug-bounty Layer 1 adapter + Q-SCOPE / Q-DUP / Q-IMPACT — [#3](https://github.com/Leonardo-Jacquez/open-cycle/issues/3)
4. Independent eval harness as CI (no-LLM, regression-locked) — [#4](https://github.com/Leonardo-Jacquez/open-cycle/issues/4)

## Waiting on the owner

None for this landing. Next prove: one Juice Shop cluster through the wall,
human-signed packet. Then Layer 1 bounty adapter — swap adapters only.

## Standing rules that govern the record

- **PROTOCOL.md is the prose canon.** README is a map. AGENTS.md is a pointer.
  Routes render; they do not restate.
- **Public data only.** Reconstructions labeled. No customer tenants, SOWs,
  logos, or Jira.
- **Scripts count. Humans write. The model drafts.**
- **Empty envelope → refuse.**
- **Sebas does not write application code and does not push the default branch.**
- **ADR numbers are claimed at merge** by the release engineer, not by the
  author at writing time. Authors write `docs/adr/DRAFT-<slug>.md`.
