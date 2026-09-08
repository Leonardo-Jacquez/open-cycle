# open-cycle

Public-source research protocol for an AppSec AI wall. This file is a short
pointer, not a restatement.

## Start here — which document answers which question

| Question | Read this |
|---|---|
| Intent, goal, constraints, proof, layers, harness, graph, contracts, port | `PROTOCOL.md` |
| Why a decision was made | its ADR in `docs/adr/` |
| Owner-facing status | `docs/STATE.md` |
| GitHub surface (layout, labels, issues, map discipline) | `agents/sebas.md` |
| How a change lands on GitHub | `se-release-engineer` in the agent-teams plugin — not this file |

Owner-facing status lives in `docs/STATE.md`. Merged PRs on GitHub are the ground
truth. The Brief UI renders `src/lib/appsec/protocol.ts`; those facts must match
`PROTOCOL.md`. Routes render the canon; they do not restate it.

## Write path

Human on every write. The model drafts sentences from a named query envelope.
Apply and sign are explicit human clicks. Sebas may write only the GitHub surface
listed in `agents/sebas.md`. Application code is the Software Engineering team.
No agent pushes the default branch.

## Instruction and line budgets — hard

- Draft system prompt: ≤ 12 directives. Never dump this file into a model.
- Envelope: named query only, ≤ 8000 characters. Empty → refuse.
- Output: `max_tokens` 500. User-initiated. No loop, no page-load calls.
- README.md: map only, ≤ 40 lines. If you need more, you are restating PROTOCOL.
- This file: pointer + constraints. Do not grow it with case law. Case law is an ADR.

Raising a cap needs an owner-ratified ADR.

## Harness

The research bench *is* the loop: Pulls → Queries → Triage → Tickets → Packet.
Deterministic: delta, drop rules, collapse, refuse-on-empty, no-LLM evaluator.
Probabilistic: four draft tasks (`triage` \| `ticket` \| `close` \| `packet`).
Control flow stays in code. The human picks the next named query.

## Stop rules

Gates inspect observable end state — envelope fields, scripted still/new/gone,
evaluator score, a human signature — never an exit code the agent can game.
Empty envelope → refuse. The model does not count. Packet scoring is no-LLM.
Do not invent a system of record. Do not attach a customer tenant, SOW, logo, or Jira.
