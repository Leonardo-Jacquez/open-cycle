# Open Cycle — protocol

**Rev:** 2026-09-08  
**Record:** https://github.com/Leonardo-Jacquez/open-cycle

This file is the **single canonical copy** of intent, goal, constraints, proof,
layers, harness, graph, contracts, and the port map. Routes and the Brief render
it (via `src/lib/appsec/protocol.ts` in the research bench). They do not restate
it. README.md is a map. AGENTS.md is a pointer. ADRs are why. STATE.md is now.

Invariants that must execute live in `engine.ts` / `queries.ts` / `ai.ts` — not here.

---

## Intent

Prove an AI wall that speeds AppSec delivery without letting a model own counts,
ranking, or writes — then reuse the same wall on other sources and intents.

Scanner consoles, tickets, and monthly packets are slow because a human copies
between tools. The bet is that a deterministic shell plus a small probabilistic
core can draft the sentences, while scripts and a human still own the facts.

Not a customer tenant. Not a CTF scoreboard. Not billed in hours. Not a system
of record. Not a live vendor export.

## Goal

| | |
|---|---|
| **Prove** | AppSec cycle on public Juice Shop pins: pull → join → named query → draft → human sign. |
| **Then** | Refactor Layer 1 (and only Layer 1) so the same wall runs bug-bounty intake: scope, duplicates, impact, report, submit/don't. |
| **Keep** | Query registry, refuse-on-empty, HITL writes, independent evaluator, instruction/line/I/O contracts. |

## Constraints

| ID | Rule |
|---|---|
| C-PUBLIC | Public data only. Reconstructions labeled as such. No customer tenants, SOWs, logos, or Jira. |
| C-HITL | Human on every write. Model drafts. Apply and sign are explicit. |
| C-SCRIPT | Scripts tally still / new / gone. The model may not count. |
| C-REFUSE | Empty query envelope → refuse. No guessing. |
| C-ENVELOPE | The model may read a named query envelope and nothing else. |
| C-EVAL | Packet scoring is a no-LLM evaluator. The drafter does not grade itself. |
| C-REACH | Trivy does not do function-level reachability. `imported=*` is an extra engine, labeled. |
| C-SOR | Do not invent a system of record. Tickets here are a research analog. |
| C-COPY | One canonical copy of this protocol. Routes render it; they do not restate it. |

## Modeled after

| ID | Source | What we take |
|---|---|---|
| wall | Four-layer wall (method of record) | Pull → normalize/join → deterministic index + query registry → LLM reads-only. ADRs and write guards before the model. |
| 12f | [Dex Horthy · 12-Factor Agents](https://github.com/humanlayer/12-factor-agents) | Own the prompt, the context window, and the control flow. Tools are structured JSON. Contact the human as a step. Small focused agents. Stateless reducer over stored cycle state. |
| wiki | Karpathy · compiled knowledge / LLM wiki | Compile once per source update; query the artifact. Do not re-derive the month from raw pulls on every draft. |
| shell | Deterministic shell, probabilistic core | The LLM is the core, not the system. Code decides what goes in, what comes out, and which step is allowed. |
| gates | Invariants in gates, not in markdown | Long system-instruction dumps fracture attention. Drop rules, delta, and the evaluator live in TypeScript. The draft prompt stays short. |
| budget | Instruction and context budgets (Horthy / RPI) | Frontier models follow ~150–200 instructions before half-attention. Split workflows so each prompt is well under 40. This bench: ~10 in the system prompt. Context is an envelope, not a dump. |

## Proof

**Unit:** one Juice Shop challenge / finding cluster through the wall — not a scoreboard flag.

**Pass**

- Q-DELTA counts match the script on the two pins.
- Same-bug cluster collapses to one ticket.
- Worklist after drop rules is short enough to act on (evaluator aims ≤ 8).
- Open tickets name a file or location.
- Drafts cite only IDs that appear in the envelope.
- Gone ≠ fixed: closes need evidence text.
- Human signed the packet.

**Fail**

- Model tallies still/new/gone.
- Invented CVE, file, or finding ID.
- Empty envelope still produces a draft.
- Two tickets for one SQLi (SAST + DAST).
- Trivy lockfile row treated as proven in-prod.

## Layers

| # | Name | Now | Next |
|---|---|---|---|
| 1 | Pull | Tool-shaped JSON per pin (Semgrep, Trivy, ZAP, IaC, intake, GitHub analog). Provenance on every pull. | Swap adapters: bounty programs, disclosed reports, recon — same Pull type. |
| 2 | Normalize / join | Canonical findings + explicit CLUSTERS (same-bug). Extra engine: `imported=true\|false\|null`. | Compile a knowledge graph. Layer 3 reads only the graph, never raw pulls. |
| 3 | Query registry | Q-DELTA, Q-CLUSTER, Q-WORKLIST, Q-NOISE, Q-CLOSE, Q-GAPS, Q-PACKET, Q-FINDING. Refuse on empty. | Add intent queries (Q-SCOPE, Q-DUP, Q-IMPACT) without deleting the shared ones. |
| 4 | Draft (probabilistic) | grok-4.5, task ∈ {triage, ticket, close, packet}, envelope ≤ 8000 chars, `max_tokens` 500, user-initiated. | Same core. New tasks: report, severity, submit-note. Still no writes. |

## Harness

A harness is the loop around the model: observation, context, control, action,
state, verification. This app is that loop. The model is a subroutine.

**States:** Pulls (observe) → Queries (context) → Triage (decide) → Tickets (write, human) → Packet (verify + sign).

**Deterministic pool**

- Pin delta (still / new / gone)
- DROP_RULES + worklist rank
- Same-bug collapse
- Refuse-on-empty envelopes
- Packet evaluator (no LLM)
- Zod on the draft server fn

**Probabilistic pool**

- Sentence drafts from an envelope
- Four small tasks, not one mega-agent

**Dynamic workflow:** the human picks the next named query. That is a dynamic
workflow without handing control flow to the model. Factor 8: own the DAG.

## Knowledge graph

**Now:** undirected join graph: finding nodes, CLUSTERS edges, `relatedIds`.
Enough to collapse SAST + DAST + intake.

**Not yet:** not GraphRAG. Not hop queries. Not an evidence-centric store.
Layer 3 still walks arrays.

**Contracted:** compiled graph as the only Layer 3 store. Nodes: pin, pull,
finding, challenge, evidence, ticket, decision. Edges: same-bug, proves,
supersedes, ticketed-as. Queries return subgraphs. Compile on pull change
(Karpathy wiki), do not rebuild per draft.

## Contracts

| ID | Name | Limit | Why |
|---|---|---|---|
| K-INSTR | Instruction budget | ≤ 12 directives in the draft system prompt. Never a CLAUDE.md dump. | Horthy: ~150–200 instruction ceiling; split until each step is < 40. Long markdown is how agents stop following the important rule. |
| K-CTX | Context window | Named envelope only. Cap 8000 characters. No raw pull paste into the model. | Own the window (12-factor #3). Avoid the mid-window dumb zone by sending the compiled answer, not the sources. |
| K-OUT | Output cap | `max_tokens` 500. User-initiated. No loop, no keystroke, no page-load calls. | Drafts are short. Spend is the owner's key. |
| K-LINE | Line / file contracts | Invariants in `engine.ts`. Protocol is data. Draft prompt stays under ~15 lines. Surgical edits; no speculative refactors in the wall. | Karpathy-style halt-when-confused. Move gates out of English into executable checks (here: drop rules + evaluator, not an AST hook yet). |
| K-IO | I/O schema | Input: `{ task, queryId, envelope }`. Output: `{ ok, text \| error }`. `Envelope.ok === false` → REFUSE. | 12-factor #4: tools are structured outputs, not prose side effects. |
| K-WRITE | Write guard | Model cannot mutate decisions, tickets, or the packet. Apply is a human click. Sign is a human click. | 12-factor #7 (contact the human) plus a PreToolUse analog: no write tool is bound to the model. |
| K-FLOW | Control flow | Code owns the step order. The model does not pick tools. Humans pick queries. | 12-factor #8. Dynamic workflow = which named query you run, not an agent for-loop. |
| K-SMALL | Small agents | Four tasks: `triage` \| `ticket` \| `close` \| `packet`. No mega-agent. | 12-factor #10. One envelope, one job. |

## Port

**Rule:** swap Layer 1 adapters and the query names that are intent-specific.
Keep layers 2–4, the envelope schema, refuse-on-empty, HITL apply/sign, the
no-LLM evaluator, and the instruction/context/output caps.

**Keep across intents:** envelope schema, refuse-on-empty, human apply/sign,
no-LLM evaluator, instruction/context/output caps, Q-CLUSTER / Q-FINDING shape.

| | AppSec (now) | Bug bounty (next) |
|---|---|---|
| Pull | Semgrep, Trivy, ZAP, IaC, challenge intake, JUICE-* tickets | Program scope, assets, disclosed-style reports, recon notes — still public or owned-program data |
| Queries | Q-DELTA, Q-WORKLIST, Q-NOISE, Q-CLOSE, Q-GAPS, Q-PACKET | Q-SCOPE, Q-DUP, Q-IMPACT, plus shared Q-CLUSTER / Q-FINDING |
| Write | Sprint ticket + monthly packet | Report draft + submit / don't. Human still stamps. |
| Prove | Two pinned Juice Shop tags, challenge clusters as cases | Same wall: envelope-only drafts, no invented assets, duplicates collapsed, empty → refuse |

## Trial

1. Stay on v17. v16 is the baseline pin already in the pulls.
2. Open Pulls. Read raw JSON. Layer 1. Normalize is automatic and inspectable.
3. Run Queries. Empty results refuse. These envelopes are the only thing a model may read.
4. Walk Triage → Tickets → Packet once with Manual on. Sign it.
5. Reset. Repeat with AI on. Same decisions, less typing. Drafts must cite envelope IDs.
6. Score on Packet: short list, pins line up, tickets a developer can use, tools became decisions, no invented IDs.

## Build

| Item | State |
|---|---|
| Four-layer UI + Juice Shop pins v16/v17 | shipped |
| Named query registry + refuse-on-empty | shipped |
| Deterministic delta / drop / collapse / evaluator | shipped |
| Envelope-only drafts, HITL apply/sign | shipped |
| This protocol as single canonical copy | shipped |
| Compiled knowledge graph (Layer 3 store) | contracted |
| Executable write hook beyond UI (AST / PreToolUse) | contracted |
| Bug-bounty Layer 1 adapter + Q-SCOPE / Q-DUP / Q-IMPACT | shipped |
| Independent eval harness as CI (no-LLM, regression-locked) | contracted |

## Target and pins

| | |
|---|---|
| Target | [OWASP Juice Shop](https://github.com/juice-shop/juice-shop) — intentionally vulnerable. Challenges persist across tags on purpose. A finding that is gone is almost always a dependency or route change, not a fix. |
| Baseline | `v16.0.0` · `a9b1dff` · 2024-12-19 |
| Current | `v17.0.0` · `1c04f0e` · 2025-05-24 |

Tool *classes* a delivery shop runs, mapped to public stand-ins we can train on.
Commercial product APIs are off-limits.

| Class | Stand-in | Caveat |
|---|---|---|
| SCA | Trivy + OSV, from published package.json / GHSA | Trivy does not do function-level reachability. Present-in-lockfile is not in-prod. |
| SAST | Semgrep, from published TypeScript | Rules are reconstructed from public source. Not a vendor tenant export. |
| DAST | OWASP ZAP, from public writeups + documented challenges | Unauth JSON POST (login) is a known coverage miss. Timestamp disclosure is a known FP. |
| Cloud / IaC | Trivy config on the public Dockerfile | No cloud tenant. Juice Shop is a local app. CSPM class is declared as a gap. |
| Bug bounty / intake | Public challenge reports, HackerOne-style form | Do not mix other companies' disclosed reports into this target. |
| Ticket system | GitHub issues analog (JUICE-*) | Local research tickets. Human owns every write. |

Layer 1 pulls are **research reconstructions** shaped like those public tools,
labeled as such, from published Juice Shop facts and writeups — not live vendor
exports.

## GitHub surface (Sebas)

Sebas (`agents/sebas.md`) is the librarian for this record: layout, labels,
issues, ADR index, README-as-map. It does not write application code. Mechanical
git/PR is `se-release-engineer`. The two roles do not collapse.
