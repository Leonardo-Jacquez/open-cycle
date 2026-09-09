# ADR 0005: Organized findings index is the shared Layer 3 store

## Status

Accepted (2026-09-08).

## Context

Agents that need facts were headed toward each carrying a giant file — a
PROTOCOL dump, a CLAUDE.md restatement, or raw pull JSON in the prompt. That
breaks C-COPY, the instruction budget, and the wall: the model starts owning
counts and inventing files.

The contracted item on the BUILD table was a compiled knowledge graph as the
only Layer 3 store (Karpathy: compile once per source update). GraphRAG and hop
queries were explicitly not this bench.

What we actually needed is smaller: **one repository of organized findings**,
each a cluster or singleton, each a list of **pointers** to associated pulls,
files, members, queries, and tickets. Same store for every agent that needs it.
Not the same giant file copied into every agent.

## Decision

Compile a findings index in `src/lib/appsec/knowledge.ts` once per pull set.

- The unit is an organized finding (`K-SQLI-SEARCH`, or a singleton id).
- A record holds members, tools, pins, and pointers. It does not hold pull JSON,
  ticket bodies, or PROTOCOL sentences.
- Named queries `Q-KNOW` and `Q-RECORD` return subgraphs of that index.
  `Q-FINDING` / `Q-CLUSTER` read the index too.
- Live tickets are attached as pointers at query time. They are not compiled
  into the static index.
- The public map is `knowledge/INDEX.md`. It is a map, like README. Agents
  follow pointers; they do not dump INDEX into a system prompt.
- Delta still/new/gone remains a script on findings. A cluster can be still
  while one member is gone.

GraphRAG, hop queries, and an evidence-centric store stay out.

## Alternatives considered

- **One markdown dump of all findings.** Rejected — that is the giant file. It
  would be restated into every agent prompt.
- **Per-agent copies of PROTOCOL plus pulls.** Rejected — C-COPY and C-POINT.
- **Full GraphRAG now.** Rejected — not needed to share pointers. ADR 0002
  already parked hop queries.

## Consequences

- C-POINT is a constraint: agents share the index; they follow pointers.
- Sebas owns `knowledge/INDEX.md` as a map. Sebas does not write application
  code and does not mint finding ids.
- Issue #1 (compiled graph as Layer 3 store) is discharged by this index.
  Remaining "not yet" items are not BUILD rows.
