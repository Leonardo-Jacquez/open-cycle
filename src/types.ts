/**
 * Canonical type definitions for the Open Cycle protocol.
 */

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

export interface PullProvenance {
  source: string;
  timestamp: string;
  target: string;
  programId?: string;
  isPublicOrOwned: boolean;
}

export interface Finding {
  id: string;
  tool: string;
  ruleId: string;
  severity: SeverityLevel;
  file?: string;
  line?: number;
  message: string;
  proven: boolean;
  reachable: boolean | null;
  relatedIds: string[];
  cycles: string[];
  provenance: PullProvenance;
}

export interface FindingCluster {
  clusterId: string;
  primaryFindingId: string;
  findings: Finding[];
  cwe?: string;
  title: string;
}

export interface Envelope<T = unknown> {
  ok: boolean;
  queryId: string;
  data?: T;
  error?: string;
  empty?: boolean;
}

export interface ScopeTarget {
  target: string;
  type: "domain" | "url" | "api" | "repo" | "cidr";
  eligibleForBounty: boolean;
}

export interface BountyScope {
  programId: string;
  programName: string;
  inScope: ScopeTarget[];
  outOfScope: ScopeTarget[];
  policyNotes?: string[];
}

export interface BountyAsset {
  assetId: string;
  name: string;
  type: string;
  uri: string;
  verified: boolean;
}

export interface DisclosedReport {
  reportId: string;
  title: string;
  cwe: string;
  severity: SeverityLevel;
  asset: string;
  summary: string;
  disclosedAt: string;
  duplicateOf?: string;
}

export interface ReconNote {
  noteId: string;
  target: string;
  tool: string;
  observation: string;
  timestamp: string;
}

export interface BountyPullPayload {
  scope: BountyScope;
  assets: BountyAsset[];
  disclosedReports: DisclosedReport[];
  reconNotes: ReconNote[];
  provenance: PullProvenance;
}

export type QueryId =
  | "Q-DELTA"
  | "Q-CLUSTER"
  | "Q-WORKLIST"
  | "Q-NOISE"
  | "Q-CLOSE"
  | "Q-GAPS"
  | "Q-PACKET"
  | "Q-FINDING"
  | "Q-SCOPE"
  | "Q-DUP"
  | "Q-IMPACT";

export type DraftTask =
  | "triage"
  | "ticket"
  | "close"
  | "packet"
  | "report"
  | "severity"
  | "submit-note";

export interface DraftRequest {
  task: DraftTask;
  queryId: QueryId;
  envelope: Envelope<unknown>;
}

export interface DraftResponse {
  ok: boolean;
  text?: string;
  error?: string;
  task: DraftTask;
  citedIds: string[];
  requiresHumanStamp: boolean;
}

export interface HumanStamp {
  approved: boolean;
  signedBy: string;
  timestamp: string;
  decision: "submit" | "dont_submit" | "apply" | "reject";
  notes?: string;
}

export interface EvaluationResult {
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    reason?: string;
  }[];
}
