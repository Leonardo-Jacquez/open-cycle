# Where this project stands

**Last verified:** 2026-09-10, protocol rev `2026-09-10`, ADR draft
`DRAFT-ai-poc-director-demo.md`. SHA pending GitHub land. Measured against
PROTOCOL.md in this tree, not relayed.

This is the only owner-facing status file. `PROTOCOL.md` is the canon.
`knowledge/INDEX.md` is the findings map. `docs/adr/` is why. Merged PRs on
this repo are the ground truth for the record.

This repository is the **public protocol record**. The research bench UI is a
separate runtime that renders `src/lib/appsec/protocol.ts`. Those facts must
match PROTOCOL.md. The compiled index lives in `src/lib/appsec/knowledge.ts`.
The DAG and collision scan live in `src/lib/appsec/orchestrate.ts`. SDLC and
tool-AI rows live in `src/lib/appsec/landscape.ts`. Sebas fails a PR that
restates the canon in README, AGENTS.md, or INDEX.md.

## Built

| Item | Notes |
|---|---|
| Four-layer wall on Juice Shop pins | `v16.0.0` (`a9b1dff`) baseline → `v17.0.0` (`1c04f0e`) current |
| Named query registry + refuse-on-empty | Q-KNOW, Q-RECORD, Q-DELTA, Q-CLUSTER, Q-WORKLIST, Q-NOISE, Q-CLOSE, Q-GAPS, Q-PACKET, Q-FINDING, Q-ORCH |
| Deterministic delta / drop / collapse / evaluator | Scripts count. No-LLM packet score. |
| Envelope-only drafts, HITL apply/sign | Four tasks. Model cannot mutate tickets or the packet. |
| This protocol as single canonical copy | PROTOCOL.md (prose) · protocol.ts (Brief renders it) |
| Organized findings index + pointers | `knowledge.ts` compile-once. Map: `knowledge/INDEX.md`. Agents follow pointers. |
| Orchestrator DAG + collision scan | `orchestrate.ts` snapshot. Ready/done/blocked from cycle facts. Q-ORCH envelope. Sign blocked on X-GONE-OPEN. Sign href is `/poc`. |
| AI cycle POC on K-JWT | `draftCycle` (one click, max four envelopes). Accept ships the cluster, writes close evidence on JUICE-7 / JUICE-9, does not stamp. |
| SDLC / tool-AI / VM / product-security map | `landscape.ts`. Brief SDLC tab. Public vendor docs, not a tenant. |
| Sebas | GitHub librarian. Distinct from `se-release-engineer`. |

## Contracted

PROTOCOL.md BUILD table is the list. Each row has a labeled issue.

1. Executable write hook beyond UI (AST / PreToolUse analog) — [#2](https://github.com/Leonardo-Jacquez/open-cycle/issues/2)
2. Bug-bounty Layer 1 adapter + Q-SCOPE / Q-DUP / Q-IMPACT — [#3](https://github.com/Leonardo-Jacquez/open-cycle/issues/3)
3. Independent eval harness as CI (no-LLM, regression-locked) — [#4](https://github.com/Leonardo-Jacquez/open-cycle/issues/4)

[#1](https://github.com/Leonardo-Jacquez/open-cycle/issues/1) (compiled Layer 3 store) discharged by ADR 0005.

## Waiting on the owner

Director demo: Run AI cycle → Accept drafts → Sign. Put their known manual
stats in the contrast fields. Do not invent a tenant number. The bench only
claims scripted Juice Shop counts.

On a fresh v17 pin, Orch ready set is triage and close. JUICE-7 and JUICE-9
stay X-GONE-OPEN until Accept writes evidence. Sign stays blocked until then.

Then Layer 1 bounty adapter — swap adapters only.

## Standing rules that govern the record

- **PROTOCOL.md is the prose canon.** README is a map. AGENTS.md is a pointer.
  `knowledge/INDEX.md` is the findings map. Routes render; they do not restate.
- **Agents share one findings index.** They follow pointers. They do not each
  get a dump.
- **The orchestrator publishes the DAG.** The human picks among ready nodes.
  File ownership is not an interface freeze.
- **Public data only.** Reconstructions labeled. No customer tenants, SOWs,
  logos, or Jira.
- **Scripts count. Humans write. The model drafts.**
- **Empty envelope → refuse.**
- **Manual clicks on each finding are not the proof path.**
- **Sebas does not write application code and does not push the default branch.**
- **ADR numbers are claimed at merge** by the release engineer, not by the
  author at writing time. Authors write `docs/adr/DRAFT-<slug>.md`.
