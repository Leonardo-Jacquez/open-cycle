/**
 * Structured protocol representation of PROTOCOL.md for Open Cycle.
 */

export const PROTOCOL_REV = "2026-09-08";

export const CONSTRAINTS = {
  PUBLIC: "Public data only. Reconstructions labeled as such. No customer tenants, SOWs, logos, or Jira.",
  HITL: "Human on every write. Model drafts. Apply and sign are explicit.",
  SCRIPT: "Scripts tally still / new / gone. The model may not count.",
  REFUSE: "Empty query envelope -> refuse. No guessing.",
  ENVELOPE: "The model may read a named query envelope and nothing else.",
  EVAL: "Packet scoring is a no-LLM evaluator. The drafter does not grade itself.",
  REACH: "Trivy does not do function-level reachability. imported=* is an extra engine, labeled.",
  SOR: "Do not invent a system of record. Tickets here are a research analog.",
  COPY: "One canonical copy of this protocol. Routes render it; they do not restate it.",
} as const;

export const CONTRACTS = {
  K_INSTR: {
    name: "Instruction budget",
    limit: 12,
    rule: "Directives in the draft system prompt must be <= 12.",
  },
  K_CTX: {
    name: "Context window",
    limit: 8000,
    rule: "Named envelope only, capped at 8000 characters.",
  },
  K_OUT: {
    name: "Output cap",
    limit: 500,
    rule: "max_tokens capped at 500. User-initiated.",
  },
  K_LINE: {
    name: "Line / file contracts",
    rule: "Invariants in engine.ts. Protocol is data. Draft prompt stays under 15 lines.",
  },
  K_IO: {
    name: "I/O schema",
    rule: "Input: { task, queryId, envelope }. Output: { ok, text | error }. Envelope.ok === false -> REFUSE.",
  },
  K_WRITE: {
    name: "Write guard",
    rule: "Model cannot mutate decisions, tickets, or the packet. Apply and sign are human clicks.",
  },
  K_FLOW: {
    name: "Control flow",
    rule: "Code owns step order. Model does not pick tools. Humans pick queries.",
  },
  K_SMALL: {
    name: "Small agents",
    rule: "Four core tasks (triage, ticket, close, packet) + three bounty tasks (report, severity, submit-note).",
  },
} as const;

export const LAYERS = [
  {
    number: 1,
    name: "Pull",
    job: "Tool-shaped JSON per pin. Provenance on every pull. Swappable for bug-bounty.",
  },
  {
    number: 2,
    name: "Normalize / join",
    job: "Canonical findings + explicit same-bug CLUSTERS. Extra engine: imported=true|false|null.",
  },
  {
    number: 3,
    name: "Query registry",
    job: "Named queries. Refuse on empty. Scripts tally still/new/gone.",
  },
  {
    number: 4,
    name: "Draft",
    job: "LLM reads one envelope, returns sentences. No writes.",
  },
] as const;

export const QUERY_REGISTRY = {
  APPSEC: ["Q-DELTA", "Q-WORKLIST", "Q-NOISE", "Q-CLOSE", "Q-GAPS", "Q-PACKET"] as const,
  SHARED: ["Q-CLUSTER", "Q-FINDING"] as const,
  BOUNTY: ["Q-SCOPE", "Q-DUP", "Q-IMPACT"] as const,
};

export const DRAFT_TASKS = [
  "triage",
  "ticket",
  "close",
  "packet",
  "report",
  "severity",
  "submit-note",
] as const;

export const TARGET_PINS = {
  target: "OWASP Juice Shop",
  baseline: {
    tag: "v16.0.0",
    commit: "a9b1dff",
    date: "2024-12-19",
  },
  current: {
    tag: "v17.0.0",
    commit: "1c04f0e",
    date: "2025-05-24",
  },
} as const;
