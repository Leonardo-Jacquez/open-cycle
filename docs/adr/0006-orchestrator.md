# ADR 0006: Orchestrator owns the DAG and collision scan

## Status

Accepted (2026-09-08).

## Context

Dependencies lived in prose (harness states, "human picks the next query") and
in people's heads (who may touch which file). Parallel work then collides:
two open tickets for one organized finding, a gone scan treated as a close,
INDEX ids drifting from the compile, PROTOCOL facts drifting from protocol.ts.

The coordinator never writes code. `se-delivery-lead` runs one unit PLAN → PR.
Sebas organizes the GitHub surface. `se-release-engineer` does git mechanics.
None of those roles own *declared dependencies* or *collision rules*. A fourth
role that "just sequences" would steal K-FLOW from the human.

## Decision

Make dependencies executable in `src/lib/appsec/orchestrate.ts`.

- **NODES** is the DAG. `requires` is the only edge. Bounty requires a signed
  packet. The model does not pick the next node.
- **OWNERS** names who may write a surface. File ownership is not an interface
  freeze. Parallel tracks freeze **SEAMS** first (record ids, protocol facts,
  delta counts, this DAG).
- **scanCollisions** is a script: `X-DUP-TICKET`, `X-GONE-OPEN`,
  `X-ORPHAN-TICKET`, `X-RECORD-DUP`, `X-MEMBER-SPLIT`. It does not write
  tickets. The human mitigates.
- **ready** is recursive on `requires`. Bounty is additionally gated on sign
  and no duplicate open tickets.
- The Brief **Orch** tab renders this file. It does not restate the DAG.
- The agent `orchestrator` is that specialist. It is not the coordinator, not
  delivery-lead, not sebas, not the release engineer.

C-ORCH is the constraint. K-FLOW stays: humans pick among ready nodes.

## Alternatives considered

- **Let se-delivery-lead own the DAG.** Rejected — that role runs one unit's
  build loop. The DAG is the cycle, not a unit.
- **Let sebas own collisions as issues.** Rejected — collisions are runtime
  facts on the bench (gone-open on this pin). GitHub issues are contracted
  BUILD rows.
- **Let the model sequence ready nodes.** Rejected — K-FLOW. Factor 8.

## Consequences

- On v17, JUICE-7 (`TRV-LIBXMLJS2`) and JUICE-9 (`ZAP-SCOREBOARD`) hit
  `X-GONE-OPEN` until close evidence is written. Gone ≠ fixed.
- Bounty Layer 1 stays gated on a signed AppSec packet.
- A second DAG markdown is a C-COPY violation. orchestrate.ts is the canon;
  the Orch tab renders it.

## Amendment A1 (2026-09-08)

`ready` is not "requires exist." That made every node except bounty ready.

- **done** is an observable cycle fact (pulls exist, worklist decided, packet drafted, signed, no X-GONE-OPEN).
- **ready** means requires are done, this node is not done, and no collision blocks it.
- **blocked** names the missing require or the collision id.
- Close requires delta only, so gone-open mitigation can run beside triage.
- Sign requires packet and close. X-GONE-OPEN therefore blocks the stamp until evidence exists.
- Collisions point at a knowledge record and a mitigate node. Q-ORCH publishes that snapshot as an envelope. Agents follow pointers. They do not get a dump of the DAG.
- The human still picks among ready nodes. The model does not.
