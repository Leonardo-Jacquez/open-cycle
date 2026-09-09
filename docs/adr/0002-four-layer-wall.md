# ADR 0002: Four-layer wall is the method of record

## Status

Accepted (2026-09-08).

## Context

A model that reads raw scanner JSON, tickets, and last month's packet in one
prompt will count, rank, invent IDs, and write. That is the failure mode this
project exists to refuse.

The method of record — used elsewhere as a pull → normalize/join → deterministic
index + query registry → LLM-reads-only wall — already separates those jobs.
ADRs and write guards come *before* the model. The model never owns the index.

## Decision

Open Cycle is that wall, applied to AppSec classes on public stand-ins.

| Layer | Job |
|---|---|
| 1 Pull | Tool-shaped JSON per pin. Provenance on every pull. |
| 2 Normalize / join | Canonical findings + explicit same-bug CLUSTERS. |
| 3 Query registry | Named queries. Refuse on empty. Scripts tally still/new/gone. |
| 4 Draft | LLM reads one envelope, returns sentences. No writes. |

The research bench *is* the harness around layer 4: observation, context,
control, action, state, verification. The model is a subroutine, not the loop.

Knowledge graph: shipped form is the undirected CLUSTERS join. Compiled graph
as the only Layer 3 store is contracted (Karpathy: compile once per source
update; do not re-derive on every draft). GraphRAG / hop queries are not this
bench.

## Alternatives considered

- **One mega-agent with tools.** Rejected — control flow would belong to the
  model (12-factor #8). Dynamic workflow here is *which named query the human
  runs*.
- **Paste raw pulls into the prompt.** Rejected — blows the context budget and
  puts counting in the probabilistic pool.
- **Skip the query registry; let the model search.** Rejected — empty results
  must refuse. A search that misses must not hallucinate a finding.

## Consequences

- Query IDs are the only context the model may see: Q-DELTA, Q-CLUSTER,
  Q-WORKLIST, Q-NOISE, Q-CLOSE, Q-GAPS, Q-PACKET, Q-FINDING.
- Same-bug collapse is a script. Two tickets for one SQLi (SAST + DAST) is a
  failed proof.
- Layer 1 is the only layer we plan to swap for bug bounty (ADR 0004).
- Invariants live in `engine.ts` / `queries.ts` / `ai.ts`, not in this file.

## Amendment A1

Accepted 2026-09-08 with ADR 0005. Layer 3 now reads a compiled findings index
(`knowledge.ts`, map `knowledge/INDEX.md`). GraphRAG / hop queries remain not
this bench. Delta counts remain a script. The contracted "compiled graph as
the only Layer 3 store" row is discharged by the organized-findings index, not
by GraphRAG.

