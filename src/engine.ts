import {
  Finding,
  FindingCluster,
  Envelope,
  SeverityLevel,
  HumanStamp,
  EvaluationResult,
} from "./types.js";
import { CONTRACTS } from "./lib/appsec/protocol.js";

/**
 * Collapses related findings (e.g. SAST + DAST for same CWE/location) into single canonical clusters.
 *
 * @param findings List of canonical findings from Layer 2.
 * @returns Array of grouped finding clusters.
 */
export function collapseFindings(findings: Finding[]): FindingCluster[] {
  const clusters: FindingCluster[] = [];
  const processed = new Set<string>();

  for (const finding of findings) {
    if (processed.has(finding.id)) {
      continue;
    }

    const clusterMembers: Finding[] = [finding];
    processed.add(finding.id);

    const relatedSet = new Set<string>(finding.relatedIds);

    for (const other of findings) {
      if (processed.has(other.id)) {
        continue;
      }

      const isDirectlyRelated =
        relatedSet.has(other.id) || other.relatedIds.includes(finding.id);
      const isSameBug =
        finding.ruleId === other.ruleId &&
        Boolean(finding.file) &&
        finding.file === other.file;

      if (isDirectlyRelated || isSameBug) {
        clusterMembers.push(other);
        processed.add(other.id);
        other.relatedIds.forEach((id) => relatedSet.add(id));
      }
    }

    clusters.push({
      clusterId: `CLUSTER-${finding.id}`,
      primaryFindingId: finding.id,
      findings: clusterMembers,
      cwe: finding.ruleId,
      title: finding.message,
    });
  }

  return clusters;
}

/**
 * Calculates deterministic delta between baseline and current cycles.
 * The model is forbidden from computing still/new/gone.
 *
 * @param findings All findings across cycles.
 * @param baselineCycle Baseline cycle identifier (e.g., v16 or aug).
 * @param currentCycle Current cycle identifier (e.g., v17 or sep).
 * @returns Deterministic counts and grouped finding lists.
 */
export function calculateDelta(
  findings: Finding[],
  baselineCycle: string,
  currentCycle: string
): {
  still: Finding[];
  newFindings: Finding[];
  gone: Finding[];
} {
  const current = findings.filter((f) => f.cycles.includes(currentCycle));
  const baseline = findings.filter((f) => f.cycles.includes(baselineCycle));

  const currentIds = new Set(current.map((f) => f.id));
  const baselineIds = new Set(baseline.map((f) => f.id));

  return {
    still: current.filter((f) => baselineIds.has(f.id)),
    newFindings: current.filter((f) => !baselineIds.has(f.id)),
    gone: baseline.filter((f) => !currentIds.has(f.id)),
  };
}

/**
 * Severity ranking weights for deterministic sorting.
 */
const SEVERITY_WEIGHTS: Record<SeverityLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

/**
 * Computes deterministic rank for a finding.
 *
 * @param finding Finding to evaluate.
 * @returns Numerical rank value (lower numbers indicate higher urgency).
 */
export function rankFinding(finding: Finding): number {
  const baseWeight = SEVERITY_WEIGHTS[finding.severity] ?? 9;
  const provenBonus = finding.proven ? -1 : 0;
  const reachBonus = finding.reachable === true ? -1 : 0;
  return baseWeight * 10 + provenBonus + reachBonus;
}

/**
 * Applies deterministic drop rules to exclude low-signal noise from worklists.
 *
 * @param finding Finding to inspect.
 * @returns True if the finding should be retained, false if dropped.
 */
export function applyDropRules(finding: Finding): boolean {
  if (finding.reachable === false) {
    return false;
  }
  if (finding.severity === "low" || finding.severity === "info") {
    return false;
  }
  return true;
}

/**
 * Creates a standard envelope payload enforcing refusal on empty data and character caps.
 *
 * @param queryId Identifier of the executed query.
 * @param data Data payload for the envelope.
 * @returns Envelope containing data or explicit refusal.
 */
export function createEnvelope<T>(queryId: string, data: T | null | undefined): Envelope<T> {
  if (data === null || data === undefined) {
    return {
      ok: false,
      queryId,
      error: "REFUSE: Query returned empty result",
      empty: true,
    };
  }

  if (Array.isArray(data) && data.length === 0) {
    return {
      ok: false,
      queryId,
      error: "REFUSE: Query returned empty array",
      empty: true,
    };
  }

  const serialized = JSON.stringify(data);
  if (serialized.length > CONTRACTS.K_CTX.limit) {
    return {
      ok: false,
      queryId,
      error: `REFUSE: Context length ${serialized.length} exceeds cap of ${CONTRACTS.K_CTX.limit} characters`,
    };
  }

  return {
    ok: true,
    queryId,
    data,
    empty: false,
  };
}

/**
 * Constructs an explicit refusal envelope.
 *
 * @param queryId Identifier of the refusing query.
 * @param reason Descriptive refusal reason.
 * @returns Failed envelope instance.
 */
export function refuseEnvelope(queryId: string, reason: string): Envelope<never> {
  return {
    ok: false,
    queryId,
    error: `REFUSE: ${reason}`,
    empty: true,
  };
}

/**
 * Validates a human stamp on state-modifying actions per C-HITL.
 *
 * @param stamp Human review stamp.
 * @returns True if the action is explicitly authorized by a human.
 */
export function verifyHumanStamp(stamp?: HumanStamp | null): boolean {
  if (!stamp) {
    return false;
  }
  if (!stamp.approved) {
    return false;
  }
  if (!stamp.signedBy || stamp.signedBy.trim().length === 0) {
    return false;
  }
  if (!stamp.timestamp || stamp.timestamp.trim().length === 0) {
    return false;
  }
  return stamp.decision === "submit" || stamp.decision === "apply";
}

/**
 * Independent no-LLM evaluator for validating delivery and bounty draft envelopes.
 *
 * @param params Audit parameters.
 * @returns EvaluationResult detailing check statuses.
 */
export function evaluateBountyEnvelope(params: {
  envelope: Envelope<unknown>;
  cluster?: FindingCluster;
  humanStamp?: HumanStamp;
  draftText?: string;
}): EvaluationResult {
  const checks: { name: string; passed: boolean; reason?: string }[] = [];

  const envelopePassed = params.envelope.ok && !params.envelope.empty;
  checks.push({
    name: "C-REFUSE: Non-empty envelope",
    passed: envelopePassed,
    reason: envelopePassed ? undefined : "Empty or invalid envelope",
  });

  const serializedLen = JSON.stringify(params.envelope.data ?? "").length;
  const ctxPassed = serializedLen <= CONTRACTS.K_CTX.limit;
  checks.push({
    name: "K-CTX: Context window cap <= 8000 chars",
    passed: ctxPassed,
    reason: ctxPassed ? undefined : `Envelope size ${serializedLen} exceeded cap`,
  });

  if (params.humanStamp !== undefined) {
    const hitlPassed = verifyHumanStamp(params.humanStamp);
    checks.push({
      name: "C-HITL: Human authorization stamp",
      passed: hitlPassed,
      reason: hitlPassed ? undefined : "Human stamp missing or rejected",
    });
  }

  if (params.draftText && params.cluster) {
    const validIds = new Set([
      params.cluster.clusterId,
      params.cluster.primaryFindingId,
      ...params.cluster.findings.map((f) => f.id),
    ]);

    const idRegex = /(?:FINDING-[A-Z0-9_-]+|CLUSTER-[A-Z0-9_-]+|JUICE-[A-Z0-9_-]+|DISC-[A-Z0-9_-]+)/g;
    const matches = params.draftText.match(idRegex) || [];
    const hallucinated = matches.filter((id) => !validIds.has(id));

    const noHallucinations = hallucinated.length === 0;
    checks.push({
      name: "C-ENVELOPE: Cites only valid envelope IDs",
      passed: noHallucinations,
      reason: noHallucinations ? undefined : `Hallucinated IDs: ${hallucinated.join(", ")}`,
    });
  }

  const passed = checks.every((c) => c.passed);
  return { passed, checks };
}
