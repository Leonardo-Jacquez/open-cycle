# ADR 0003: Deterministic shell, probabilistic drafts, human writes

## Status

Accepted (2026-09-08).

## Context

Long system-instruction dumps fracture attention. Frontier models follow on the
order of 150–200 instructions before half-attention; a CLAUDE.md paste into the
drafter is how the important rule gets lost. Counting, ranking, drop rules, and
packet scoring are not sentences. They are facts. Facts belong in code.

The complementary failure is letting the model mutate tickets or sign a packet.
A draft that sounds right is not a write.

## Decision

Split the system into two pools and a human gate.

**Deterministic (scripts, always):** pin delta (still / new / gone), DROP_RULES
+ worklist rank, same-bug collapse, refuse-on-empty envelopes, no-LLM packet
evaluator, Zod on the draft server function.

**Probabilistic (model, on request):** sentence drafts from one named envelope.
Four tasks only: `triage` | `ticket` | `close` | `packet`. Caps: ≤ 12 directives
in the system prompt, envelope ≤ 8000 characters, `max_tokens` 500,
user-initiated. No loop, no keystroke, no page-load calls.

**Human:** apply and sign are clicks. The model has no write tool.

Instruction budget is a contract (K-INSTR), not a vibe. This file does not get
dumped into the drafter. AGENTS.md is a pointer so agents do not load the whole
protocol as system prompt.

## Alternatives considered

- **Model tallies still/new/gone "and we check later."** Rejected — the check
  *is* the script. A later check is how invented counts ship.
- **Self-graded packets.** Rejected — the drafter does not grade itself
  (C-EVAL).
- **Apply on draft.** Rejected — 12-factor #7. Contact the human as a step.

## Consequences

- Empty envelope → refuse. No guessing.
- Drafts must cite IDs that appear in the envelope. Invented CVE / file /
  finding ID is a failed proof.
- Gone ≠ fixed. Closes need evidence text.
- Executable PreToolUse beyond the UI is contracted, not claimed.
- Sebas may not weaken these caps in README or AGENTS.md. A cap change is an
  ADR amendment, owner-ratified.
