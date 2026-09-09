# Open Cycle — protocol

**Rev:** 2026-09-08  
**Language:** ASD-STE100 Issue 9  
**Record:** https://github.com/Leonardo-Jacquez/open-cycle

This file is the specified copy of intent, goal, constraints, proof, layers,
harness, graph, contracts, and the port map.

The Brief shows this file through `src/lib/appsec/protocol.ts`. Routes must not
write these sentences again. README.md is a map. AGENTS.md is a pointer. ADRs
tell why. STATE.md tells the status now.

Live rules are in `engine.ts`, `queries.ts`, `ai.ts`, `knowledge.ts`, and
`orchestrate.ts`. Those rules are not in this file.

Verbose text in this protocol uses ASD-STE100 Issue 9. Use approved words.
Use one meaning for each word. Keep sentences short. Use the active voice.
Do not use a semicolon. Do not use a phrasal verb. Do not use Latin
abbreviations.

## Technical names

These names are project terms. They are not general English in this file.

Open Cycle, wall, Layer 1, Layer 2, Layer 3, Layer 4, Pull, envelope, HITL,
Juice Shop, Semgrep, Trivy, ZAP, IaC, ADR, BUILD, PROTOCOL.md, Sebas,
orchestrator, DAG, AppSec, pin, stand-in, reconstruction, bounty, SAST, SCA,
DAST, DROP_RULES, packet, draft, sign, Q-DELTA, Q-CLUSTER, Q-WORKLIST,
Q-NOISE, Q-CLOSE, Q-GAPS, Q-PACKET, Q-FINDING, Q-KNOW, Q-RECORD, Q-SCOPE,
Q-ORCH, Q-DUP, Q-IMPACT, CLUSTERS, imported, no-LLM, 12-Factor Agents, grok-4.5.

---

## Intent

Show that the AI wall can make AppSec delivery faster. The model must not
control counts, rank, or writes. Then use the same wall with other sources
and other intents.

Scanner consoles, tickets, and monthly packets are slow. A human copies data
between tools. This project uses a deterministic shell and a small
probabilistic core. The model writes draft sentences. Scripts and a human
control the facts.

This project is not a customer tenant. This project is not a CTF scoreboard.
Do not count hours as the unit of work. This project is not a system of
record. This project is not a live vendor export.

## Goal

| | |
|---|---|
| **Show** | Do the AppSec cycle on public Juice Shop pins. The steps are pull, join, named query, draft, and human sign. |
| **Then** | Change Layer 1 only. Then the same wall can do bug-bounty intake. The bounty tasks are scope, duplicates, impact, report, and submit or do not submit. |
| **Keep** | Keep the query registry, refuse-on-empty, HITL writes, the independent evaluator, and the instruction contracts. |

## Constraints

| ID | Rule |
|---|---|
| C-PUBLIC | Use public data only. Mark reconstructions. Do not use customer tenants, SOWs, logos, or Jira. |
| C-HITL | A human must do each write. The model writes drafts. Apply and sign are human actions. |
| C-SCRIPT | Scripts count still, new, and gone. The model must not count. |
| C-REFUSE | If the query envelope is empty, refuse. Do not guess. |
| C-ENVELOPE | The model can read one named query envelope. The model must not read other data. |
| C-EVAL | A no-LLM evaluator scores the packet. The drafter must not score its output. |
| C-REACH | Trivy does not do function-level reachability. The imported field is an extra engine. Mark it. |
| C-SOR | Do not make a system of record. Tickets in this project are a research example. |
| C-COPY | This protocol has one specified copy. Routes show it. Routes must not write it again. |
| C-POINT | Agents use one compiled findings index. Agents follow pointers. Each agent must not get a full copy. |
| C-ORCH | Dependencies are a DAG in code. The orchestrator publishes the DAG and finds collisions. The model must not set the work sequence. File ownership is not an interface freeze. |
| C-STE | Write all verbose text to ASD-STE100 Issue 9. Use approved words. Use one meaning for each word. Keep sentences short. Use the active voice. |

## Modeled after

| ID | Source | What this project uses |
|---|---|---|
| wall | Four-layer wall (method of record) | Do pull, then normalize and join, then a deterministic index and a query registry. The LLM reads only. Write ADRs and write guards before the model. |
| 12f | [Dex Horthy · 12-Factor Agents](https://github.com/humanlayer/12-factor-agents) | Control the prompt, the context window, and the control flow. Tools give structured JSON. Contact the human as a step. Use small agents. Use a stateless reducer on stored cycle state. |
| wiki | Karpathy · compiled knowledge / LLM wiki | Compile one time after each source update. Query the compiled object. Do not calculate the cycle again from raw pulls for each draft. |
| shell | Deterministic shell, probabilistic core | The LLM is the core. The LLM is not the system. Code sets the input, the output, and the permitted step. |
| gates | Invariants in gates, not in markdown | Long system prompts decrease attention. DROP_RULES, delta, and the evaluator are in TypeScript. Keep the draft prompt short. |
| budget | Instruction and context budgets (Horthy / RPI) | Frontier models follow approximately 150 to 200 instructions, then attention decreases. Split the work until each prompt has less than 40 instructions. This bench has approximately 10 instructions in the system prompt. The context is an envelope, not a full copy. |

## Proof

**Unit:** The proof unit is one Juice Shop challenge or finding cluster through
the wall. The proof unit is not a scoreboard flag.

**Pass**

- Q-DELTA counts match the script on the two pins.
- A same-bug cluster becomes one ticket.
- The worklist after DROP_RULES has 8 items or less.
- Open tickets name a file or a location.
- Drafts use only IDs that are in the envelope.
- Gone is not the same as fixed. A close must have evidence text.
- The collision scan marks gone-open tickets until evidence is written.
- A human signed the packet.

**Fail**

- The model counts still, new, or gone.
- The model makes a CVE, file, or finding ID that is not in the envelope.
- The model writes a draft from an empty envelope.
- Two tickets exist for one SQLi from SAST and DAST.
- A Trivy lockfile row is used as proof of in-prod.
- The model sets the next node.

## Layers

| # | Name | Now | Next |
|---|---|---|---|
| 1 | Pull | Each pin has tool-shaped JSON. The tools are Semgrep, Trivy, ZAP, IaC, intake, and a GitHub example. Each pull has provenance. | Change adapters to bounty programs, disclosed reports, and recon. Keep the same Pull type. |
| 2 | Normalize / join | Make specified findings and CLUSTERS for the same bug. The imported field is an extra engine. Mark it as true, false, or null. | Layer 3 compiles this join. Keep Layer 2 as the materialize step. |
| 3 | Knowledge / query | Use a compiled findings index. Named queries return subgraphs of pointers. Q-ORCH returns the ready set as pointers. Refuse if empty. Agents share the index. | Add intent queries Q-SCOPE, Q-DUP, and Q-IMPACT. Do not delete the shared queries. |
| 4 | Draft (probabilistic) | Use grok-4.5. Tasks are triage, ticket, close, and packet. The envelope maximum is 8000 characters. max_tokens is 500. The user starts each call. | Keep the same core. New tasks are report, severity, and submit-note. The model still must not write. |

## Harness

A harness is the loop around the model. The loop has observation, context,
control, action, state, and verification. This app is that loop. The model is
a subroutine.

**States:** Pulls (observe). Knowledge (index and named queries). Triage
(decide). Tickets (write, human). Packet (verify and sign).

**Deterministic pool**

- Pin delta (still / new / gone)
- DROP_RULES and worklist rank
- Same-bug collapse
- Refuse-on-empty envelopes
- Packet evaluator (no LLM)
- Zod on the draft server fn
- Declared DAG and collision scan
- Node state from cycle facts

**Probabilistic pool**

- Sentence drafts from an envelope
- Four small tasks. Not one large agent.

**Dynamic workflow:** The orchestrator publishes the DAG. The human selects a
ready node. This is a dynamic workflow. The model must not control the flow.
This is Factor 8 of 12-Factor Agents.

## Knowledge graph

**Now:** The compiled index holds organized findings. Each record is a cluster
or a singleton. Records have pointers to pulls, files, members, queries, and
tickets. Layer 3 reads the index. Layer 3 must not read raw pulls. Compile the
index when pulls change.

**Not yet:** This is not GraphRAG. This is not hop queries. This is not an
evidence store. Delta counts come from the finding script. Delta counts do not
come from a graph walk.

**Contracted:** Do not add an evidence store or hop queries. Keep the index as
pointers. Do not make a second copy of PROTOCOL or raw pulls.

The public map of this index is [`knowledge/INDEX.md`](knowledge/INDEX.md).
Agents that need facts open one record and follow pointers. Agents must not
load INDEX or PROTOCOL into a system prompt.

## Contracts

| ID | Name | Limit | Why |
|---|---|---|---|
| K-INSTR | Instruction budget | The draft system prompt can have 12 directives or less. Do not put a full AGENTS.md into the prompt. | Horthy sets a limit of approximately 150 to 200 instructions. Split until each step has less than 40. A long markdown file causes the model to miss the primary rule. |
| K-CTX | Context window | Give the model one named envelope. The maximum length is 8000 characters. Do not paste a raw pull into the model. | Control the context window (12-Factor Agents, factor 3). Send the compiled answer. Do not send the sources. |
| K-OUT | Output cap | Set max_tokens to 500. The user must start each call. Do not call on a loop, a key, or a page load. | Drafts are short. The owner controls the cost. |
| K-LINE | Line / file contracts | Put live rules in engine.ts. The protocol is data. Keep the draft prompt at 15 lines or less. Do small edits. Do not change the wall without a need. | If the model is not sure, it must stop. Put gates in code, not in English. This project uses DROP_RULES and the evaluator. |
| K-IO | I/O schema | Input is task, queryId, and envelope. Output is ok and text, or an error. If Envelope.ok is false, refuse. | 12-Factor Agents factor 4: tools give structured output. Tools must not change state with prose. |
| K-WRITE | Write guard | The model must not change decisions, tickets, or the packet. Apply is a human click. Sign is a human click. | 12-Factor Agents factor 7: contact the human. No write tool is bound to the model. |
| K-FLOW | Control flow | Code controls the step order. The orchestrator publishes the DAG. The model must not select tools. Humans select a ready node. | 12-Factor Agents factor 8. A dynamic workflow is the ready node that you run. It is not an agent loop. |
| K-SMALL | Small agents | Use four tasks: triage, ticket, close, and packet. Do not use one large agent. | 12-Factor Agents factor 10. One envelope, one job. |

## Port

**Rule:** Change Layer 1 adapters and the query names that are special to the
intent. Keep layers 2 through 4, the contracts, HITL, and the evaluator.

**Keep across intents:** envelope schema, refuse-on-empty, human apply and
sign, no-LLM evaluator, instruction, context, and output caps, Q-CLUSTER /
Q-FINDING shape.

| | AppSec (now) | Bug bounty (next) |
|---|---|---|
| Pull | Semgrep, Trivy, ZAP, IaC, challenge intake, JUICE-* tickets | Program scope, assets, disclosed-style reports, recon notes. Data must be public or from a program you own. |
| Queries | Q-DELTA, Q-WORKLIST, Q-NOISE, Q-CLOSE, Q-GAPS, Q-PACKET | Q-SCOPE, Q-DUP, Q-IMPACT, plus shared Q-CLUSTER and Q-FINDING |
| Write | Sprint ticket and monthly packet | Report draft and submit or do not submit. A human still approves. |
| Show | Two pinned Juice Shop tags. Challenge clusters are the cases. | Same wall. Drafts from envelopes only. Do not make assets. Collapse duplicates. Empty envelope must refuse. |

## Trial

1. Keep the pin on v17. Pin v16 is the baseline in the pulls.
2. Open Pulls. Read the raw JSON. This is Layer 1.
3. Open Knowledge. Read organized findings and pointers only. Each agent that needs facts reads this index.
4. Open the Orch tab. On v17 the ready set is triage and close. The scan marks JUICE-7 and JUICE-9 as X-GONE-OPEN. Sign stays blocked until evidence is written.
5. Run Queries. Queries return subgraphs of the index. Empty results must refuse. The model can read these envelopes only.
6. Do Triage, then Tickets, then Packet. Use Manual mode. Sign the packet.
7. Reset. Do the cycle again with AI on. Drafts must use envelope IDs only.
8. Score the packet. The list must be short. Tickets must name a file. Do not use IDs that are not in the envelope.

## Build

| Item | State |
|---|---|
| Four-layer UI and Juice Shop pins v16/v17 | shipped |
| Named query registry and refuse-on-empty | shipped |
| Deterministic delta / drop / collapse / evaluator | shipped |
| Envelope-only drafts, HITL apply and sign | shipped |
| This protocol as one specified copy | shipped |
| Organized findings index and pointers (Layer 3 store) | shipped |
| Orchestrator DAG and collision scan | shipped |
| Verbose text to ASD-STE100 Issue 9 | shipped |
| Executable write hook beyond UI (AST / PreToolUse) | contracted |
| Bug-bounty Layer 1 adapter and Q-SCOPE / Q-DUP / Q-IMPACT | contracted |
| Independent eval harness as CI (no-LLM, regression-locked) | contracted |

## Target and pins

| | |
|---|---|
| Target | [OWASP Juice Shop](https://github.com/juice-shop/juice-shop). This target is made to be vulnerable. Challenges stay across tags. A gone finding is usually a dependency change or a route change. The gone finding is not a fix. |
| Baseline | `v16.0.0` · `a9b1dff` · 2024-12-19 |
| Current | `v17.0.0` · `1c04f0e` · 2025-05-24 |

Tool classes that a delivery shop runs. This project maps each class to a
public stand-in for training. Commercial product APIs are not permitted.

| Class | Stand-in | Caveat |
|---|---|---|
| SCA | Trivy + OSV, from published package.json / GHSA | Trivy does not do function-level reachability. Present in the lockfile is not in-prod. |
| SAST | Semgrep, from published TypeScript | Rules are reconstructions from public source. This is not a vendor tenant export. |
| DAST | OWASP ZAP, from public writeups and documented challenges | An unauthenticated JSON POST to login is a known coverage miss. Timestamp disclosure is a known FP. |
| Cloud / IaC | Trivy config on the public Dockerfile | This project has no cloud tenant. Juice Shop is a local app. The CSPM class is a gap. |
| Bug bounty / intake | Public challenge reports, HackerOne-style form | Do not mix disclosed reports from other companies into this target. |
| Ticket system | GitHub issues example (JUICE-*) | These tickets are local research tickets. A human must do each write. |

Layer 1 pulls are research reconstructions. They have the shape of those public
tools. Mark them as reconstructions. Facts come from published Juice Shop data
and writeups. These pulls are not live vendor exports.

## GitHub surface (Sebas) and orchestrator

Sebas (`agents/sebas.md`) is the librarian for this record. Sebas does layout,
labels, issues, the ADR index, README as a map, and `knowledge/INDEX.md`.
Sebas must not write application code. Mechanical git and PR work is
`se-release-engineer`. These two roles must not become one role.

The orchestrator (`agents/orchestrator.md`) controls the declared DAG and the
collision scan. The executable copy is `src/lib/appsec/orchestrate.ts`. The
orchestrator is not the coordinator. The coordinator must not write code. The
orchestrator is not `se-delivery-lead`. That role runs one unit from PLAN to
PR. The orchestrator is not sebas. The orchestrator is not
`se-release-engineer`. File ownership is not an interface freeze. The human
selects a ready node.
