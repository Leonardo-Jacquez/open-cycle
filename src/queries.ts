import {
  Finding,
  FindingCluster,
  Envelope,
  BountyPullPayload,
  DisclosedReport,
  QueryId,
} from "./types.js";
import { createEnvelope, refuseEnvelope } from "./engine.js";

/**
 * Executes Q-FINDING: retrieves a specific finding by ID.
 * Refuses if the finding does not exist.
 *
 * @param findings Collection of findings.
 * @param findingId Target finding ID.
 * @returns Standard query envelope.
 */
export function queryFinding(findings: Finding[], findingId: string): Envelope<Finding> {
  if (!findingId || findingId.trim().length === 0) {
    return refuseEnvelope("Q-FINDING", "findingId cannot be empty");
  }
  const finding = findings.find((f) => f.id === findingId);
  if (!finding) {
    return refuseEnvelope("Q-FINDING", `Finding "${findingId}" not found`);
  }
  return createEnvelope("Q-FINDING", finding);
}

/**
 * Executes Q-CLUSTER: retrieves a specific finding cluster by ID.
 * Refuses if the cluster does not exist or has no findings.
 *
 * @param clusters Collection of finding clusters.
 * @param clusterId Target cluster ID.
 * @returns Standard query envelope.
 */
export function queryCluster(
  clusters: FindingCluster[],
  clusterId: string
): Envelope<FindingCluster> {
  if (!clusterId || clusterId.trim().length === 0) {
    return refuseEnvelope("Q-CLUSTER", "clusterId cannot be empty");
  }
  const cluster = clusters.find((c) => c.clusterId === clusterId);
  if (!cluster || cluster.findings.length === 0) {
    return refuseEnvelope("Q-CLUSTER", `Cluster "${clusterId}" not found or empty`);
  }
  return createEnvelope("Q-CLUSTER", cluster);
}

/**
 * Result structure for Q-SCOPE query.
 */
export interface ScopeQueryResult {
  target: string;
  inScope: boolean;
  eligibleForBounty: boolean;
  matchedRule?: string;
  policyNotes?: string[];
}

/**
 * Executes Q-SCOPE: verifies whether an asset, URL, or endpoint is eligible in the program scope.
 * Refuses if scope or target is empty.
 *
 * @param bountyData Bounty payload from Layer 1.
 * @param target Target URL, endpoint, or asset identifier to verify.
 * @returns Standard query envelope with scope resolution.
 */
export function queryScope(
  bountyData: BountyPullPayload,
  target: string
): Envelope<ScopeQueryResult> {
  if (!target || target.trim().length === 0) {
    return refuseEnvelope("Q-SCOPE", "Target parameter cannot be empty");
  }
  if (!bountyData || !bountyData.scope) {
    return refuseEnvelope("Q-SCOPE", "Bounty program scope is missing");
  }

  const inScopeMatch = bountyData.scope.inScope.find((s) =>
    target.includes(s.target) || s.target.includes(target)
  );

  const outOfScopeMatch = bountyData.scope.outOfScope.find((s) =>
    target.includes(s.target) || s.target.includes(target)
  );

  if (outOfScopeMatch) {
    return createEnvelope("Q-SCOPE", {
      target,
      inScope: false,
      eligibleForBounty: false,
      matchedRule: `Explicitly out of scope: ${outOfScopeMatch.target}`,
      policyNotes: bountyData.scope.policyNotes,
    });
  }

  if (inScopeMatch) {
    return createEnvelope("Q-SCOPE", {
      target,
      inScope: true,
      eligibleForBounty: inScopeMatch.eligibleForBounty,
      matchedRule: inScopeMatch.target,
      policyNotes: bountyData.scope.policyNotes,
    });
  }

  return createEnvelope("Q-SCOPE", {
    target,
    inScope: false,
    eligibleForBounty: false,
    matchedRule: "Not found in program scope definitions",
    policyNotes: bountyData.scope.policyNotes,
  });
}

/**
 * Result structure for Q-DUP query.
 */
export interface DuplicateQueryResult {
  candidateId: string;
  isDuplicate: boolean;
  matchingReports: DisclosedReport[];
  duplicateConfidence: "none" | "low" | "medium" | "high";
  rationale: string;
}

/**
 * Executes Q-DUP: checks candidate finding or cluster against disclosed reports for duplicates.
 * Refuses if input parameters are empty.
 *
 * @param bountyData Bounty payload from Layer 1 containing disclosed reports.
 * @param cluster Finding cluster to evaluate for duplication.
 * @returns Standard query envelope with duplicate determination.
 */
export function queryDuplicates(
  bountyData: BountyPullPayload,
  cluster: FindingCluster
): Envelope<DuplicateQueryResult> {
  if (!cluster || !cluster.clusterId) {
    return refuseEnvelope("Q-DUP", "Cluster parameter cannot be empty");
  }
  if (!bountyData) {
    return refuseEnvelope("Q-DUP", "Bounty data cannot be empty");
  }

  const primary = cluster.findings[0];
  if (!primary) {
    return refuseEnvelope("Q-DUP", "Cluster contains no findings");
  }

  const reports = bountyData.disclosedReports || [];
  const matchingReports: DisclosedReport[] = [];

  for (const report of reports) {
    const cweMatch = cluster.cwe && report.cwe.toLowerCase() === cluster.cwe.toLowerCase();
    const assetMatch =
      Boolean(primary.file && report.asset.includes(primary.file)) ||
      report.asset.toLowerCase().includes(primary.message.toLowerCase());

    if (cweMatch || assetMatch) {
      matchingReports.push(report);
    }
  }

  if (matchingReports.length > 0) {
    const highConfidence = matchingReports.some(
      (r) =>
        Boolean(primary.file && r.asset.includes(primary.file)) &&
        r.cwe.toLowerCase() === (cluster.cwe ?? "").toLowerCase()
    );

    return createEnvelope("Q-DUP", {
      candidateId: cluster.clusterId,
      isDuplicate: true,
      matchingReports,
      duplicateConfidence: highConfidence ? "high" : "medium",
      rationale: `Matched ${matchingReports.length} disclosed report(s) on same vulnerability class or asset`,
    });
  }

  return createEnvelope("Q-DUP", {
    candidateId: cluster.clusterId,
    isDuplicate: false,
    matchingReports: [],
    duplicateConfidence: "none",
    rationale: "No matching disclosed reports found for asset and vulnerability class",
  });
}

/**
 * Result structure for Q-IMPACT query.
 */
export interface ImpactQueryResult {
  findingId: string;
  asset: string;
  cwe?: string;
  severity: string;
  proven: boolean;
  reachable: boolean | null;
  impactVector: string;
  remediationRecommendation: string;
}

/**
 * Executes Q-IMPACT: calculates security impact, attack vector, and reachability.
 * Refuses if finding or cluster is missing.
 *
 * @param cluster Finding cluster to evaluate for impact.
 * @returns Standard query envelope with impact assessment.
 */
export function queryImpact(cluster: FindingCluster): Envelope<ImpactQueryResult> {
  if (!cluster || cluster.findings.length === 0) {
    return refuseEnvelope("Q-IMPACT", "Cluster cannot be empty");
  }

  const primary = cluster.findings[0];
  const fileLocation = primary.file ?? "unknown-location";
  const provenLive = cluster.findings.some((f) => f.proven);
  const reachableAny = cluster.findings.some((f) => f.reachable === true);

  let impactVector = "Local / Speculative analysis";
  if (provenLive) {
    impactVector = "Confirmed live exploitability via runtime verification or DAST";
  } else if (reachableAny) {
    impactVector = "Reachable dependency path identified in application graph";
  }

  let remediation = "Investigate code location and apply secure input validation / patching";
  if (primary.ruleId.includes("SQLI") || primary.ruleId.includes("CWE-89")) {
    remediation = "Use parameterized SQL queries and object relational mapping abstraction";
  } else if (primary.ruleId.includes("XSS") || primary.ruleId.includes("CWE-79")) {
    remediation = "Enforce contextual output encoding and robust Content-Security-Policy headers";
  }

  return createEnvelope("Q-IMPACT", {
    findingId: cluster.clusterId,
    asset: fileLocation,
    cwe: cluster.cwe,
    severity: primary.severity,
    proven: provenLive,
    reachable: reachableAny,
    impactVector,
    remediationRecommendation: remediation,
  });
}

/**
 * Dispatches query execution by QueryId.
 *
 * @param queryId Named query identifier.
 * @param context Input datasets for query resolution.
 * @returns Query envelope.
 */
export function dispatchQuery(
  queryId: QueryId,
  context: {
    findings?: Finding[];
    clusters?: FindingCluster[];
    bountyData?: BountyPullPayload;
    targetId?: string;
    clusterId?: string;
    findingId?: string;
  }
): Envelope<unknown> {
  switch (queryId) {
    case "Q-SCOPE":
      if (!context.bountyData || !context.targetId) {
        return refuseEnvelope("Q-SCOPE", "Missing bounty data or targetId");
      }
      return queryScope(context.bountyData, context.targetId);

    case "Q-DUP":
      if (!context.bountyData || !context.clusterId || !context.clusters) {
        return refuseEnvelope("Q-DUP", "Missing bounty data or cluster context");
      }
      const targetCluster = context.clusters.find((c) => c.clusterId === context.clusterId);
      if (!targetCluster) {
        return refuseEnvelope("Q-DUP", `Cluster ${context.clusterId} not found`);
      }
      return queryDuplicates(context.bountyData, targetCluster);

    case "Q-IMPACT":
      if (!context.clusterId || !context.clusters) {
        return refuseEnvelope("Q-IMPACT", "Missing cluster context");
      }
      const impactCluster = context.clusters.find((c) => c.clusterId === context.clusterId);
      if (!impactCluster) {
        return refuseEnvelope("Q-IMPACT", `Cluster ${context.clusterId} not found`);
      }
      return queryImpact(impactCluster);

    case "Q-FINDING":
      return queryFinding(context.findings || [], context.findingId || "");

    case "Q-CLUSTER":
      return queryCluster(context.clusters || [], context.clusterId || "");

    default:
      return refuseEnvelope(queryId, `Unsupported query "${queryId}"`);
  }
}
