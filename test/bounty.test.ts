import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  BountyLayer1Adapter,
  AppSecLayer1Adapter,
  BountyPullPayload,
  Finding,
  FindingCluster,
  collapseFindings,
  createEnvelope,
  refuseEnvelope,
  queryScope,
  queryDuplicates,
  queryImpact,
  queryFinding,
  queryCluster,
  dispatchQuery,
  generateDraft,
  executeBountySubmission,
  evaluateBountyEnvelope,
  validateInstructionBudget,
  DRAFTER_SYSTEM_DIRECTIVES,
  HumanStamp,
} from "../src/index.js";

/**
 * Loads the public OWASP Juice Shop bounty fixture.
 *
 * @returns Parsed BountyPullPayload from fixtures.
 */
function loadJuiceShopFixture(): BountyPullPayload {
  const fixturePath = path.resolve(process.cwd(), "fixtures/juice-shop-bounty.json");
  const raw = fs.readFileSync(fixturePath, "utf-8");
  return JSON.parse(raw) as BountyPullPayload;
}

describe("Layer 1: Bug-Bounty Adapter (ADR 0001, ADR 0004)", () => {
  it("ingests public Juice Shop bounty payload with valid provenance", () => {
    const fixture = loadJuiceShopFixture();
    const adapter = new BountyLayer1Adapter();
    adapter.registerProgram(fixture);

    const pulled = adapter.pull("owasp-juice-shop");
    assert.equal(pulled.scope.programId, "owasp-juice-shop");
    assert.equal(pulled.scope.inScope.length, 5);
    assert.equal(pulled.assets.length, 4);
    assert.equal(pulled.disclosedReports.length, 2);
    assert.equal(pulled.reconNotes.length, 2);
    assert.equal(pulled.provenance.isPublicOrOwned, true);
  });

  it("enforces refuse-on-empty on unconfigured or empty program identifiers", () => {
    const adapter = new BountyLayer1Adapter();
    assert.throws(() => adapter.pull("non-existent-program"), /Refuse: program "non-existent-program" not found or empty/);
    assert.throws(() => adapter.pull(""), /Refuse: programId cannot be empty/);
  });

  it("refuses payloads with empty scope or empty assets", () => {
    const adapter = new BountyLayer1Adapter();
    const emptyScopePayload: BountyPullPayload = {
      scope: {
        programId: "empty-scope",
        programName: "Empty Scope Program",
        inScope: [],
        outOfScope: [],
      },
      assets: [
        {
          assetId: "A1",
          name: "Test",
          type: "web",
          uri: "https://example.com",
          verified: true,
        },
      ],
      disclosedReports: [],
      reconNotes: [],
      provenance: {
        source: "Public",
        timestamp: "2026-09-08T00:00:00Z",
        target: "Test",
        isPublicOrOwned: true,
      },
    };

    assert.equal(adapter.validate(emptyScopePayload), false);
    assert.throws(() => adapter.registerProgram(emptyScopePayload), /Invalid bounty payload/);
  });

  it("enforces ADR 0001 by refusing private or non-public provenance", () => {
    const adapter = new BountyLayer1Adapter();
    const fixture = loadJuiceShopFixture();
    const invalidProvenance: BountyPullPayload = {
      ...fixture,
      provenance: {
        ...fixture.provenance,
        isPublicOrOwned: false,
      },
    };

    assert.equal(adapter.validate(invalidProvenance), false);
    assert.throws(() => adapter.registerProgram(invalidProvenance), /Invalid bounty payload/);
  });

  it("enforces ADR 0001 by refusing cross-tenant contamination of unrelated disclosed reports", () => {
    const adapter = new BountyLayer1Adapter();
    const fixture = loadJuiceShopFixture();
    const foreignReportPayload: BountyPullPayload = {
      ...fixture,
      disclosedReports: [
        {
          reportId: "DISC-FOREIGN-01",
          title: "Foreign Company Report",
          cwe: "CWE-89",
          severity: "critical",
          asset: "https://unrelated-enterprise-tenant.com/api/payroll",
          summary: "Vulnerability in unrelated enterprise payroll portal.",
          disclosedAt: "2025-01-01",
        },
      ],
    };

    assert.equal(adapter.validate(foreignReportPayload), false);
    assert.throws(() => adapter.registerProgram(foreignReportPayload), /Invalid bounty payload/);
  });

  it("demonstrates clean Layer 1 swapping without modifying harness", () => {
    const bountyAdapter = new BountyLayer1Adapter();
    const appsecAdapter = new AppSecLayer1Adapter();

    const fixture = loadJuiceShopFixture();
    bountyAdapter.registerProgram(fixture);

    appsecAdapter.registerPin({
      pin: "v17.0.0",
      findings: [
        {
          id: "FINDING-SEMGREP-01",
          tool: "semgrep",
          ruleId: "CWE-89",
          severity: "high",
          file: "routes/login.ts",
          line: 42,
          message: "Potential SQL injection",
          proven: true,
          reachable: true,
          relatedIds: [],
          cycles: ["v17"],
          provenance: {
            source: "Semgrep",
            timestamp: "2026-09-08T00:00:00Z",
            target: "v17.0.0",
            isPublicOrOwned: true,
          },
        },
      ],
      provenance: {
        source: "Public Juice Shop v17.0.0",
        timestamp: "2026-09-08T00:00:00Z",
        target: "OWASP Juice Shop",
        isPublicOrOwned: true,
      },
    });

    const pulledBounty = bountyAdapter.pull("owasp-juice-shop");
    const pulledAppSec = appsecAdapter.pull("v17.0.0");

    assert.equal(pulledBounty.scope.programId, "owasp-juice-shop");
    assert.equal(pulledAppSec.pin, "v17.0.0");
    assert.equal(pulledAppSec.findings.length, 1);
  });
});

describe("Layer 2 & Deterministic Core Invariants", () => {
  it("collapses same-bug findings into a single cluster", () => {
    const findings: Finding[] = [
      {
        id: "FINDING-SEMGREP-01",
        tool: "semgrep",
        ruleId: "CWE-89",
        severity: "high",
        file: "routes/login.ts",
        line: 35,
        message: "SQL Injection in login router",
        proven: false,
        reachable: true,
        relatedIds: ["FINDING-ZAP-01"],
        cycles: ["v17"],
        provenance: {
          source: "Semgrep",
          timestamp: "2026-09-08T00:00:00Z",
          target: "v17.0.0",
          isPublicOrOwned: true,
        },
      },
      {
        id: "FINDING-ZAP-01",
        tool: "zap",
        ruleId: "CWE-89",
        severity: "critical",
        file: "routes/login.ts",
        line: 35,
        message: "SQL Injection authenticated live",
        proven: true,
        reachable: true,
        relatedIds: ["FINDING-SEMGREP-01"],
        cycles: ["v17"],
        provenance: {
          source: "ZAP",
          timestamp: "2026-09-08T00:00:00Z",
          target: "v17.0.0",
          isPublicOrOwned: true,
        },
      },
    ];

    const clusters = collapseFindings(findings);
    assert.equal(clusters.length, 1);
    assert.equal(clusters[0].clusterId, "CLUSTER-FINDING-SEMGREP-01");
    assert.equal(clusters[0].findings.length, 2);
  });

  it("enforces refuse-on-empty envelopes for null, undefined, or empty lists", () => {
    const nullEnv = createEnvelope("Q-SCOPE", null);
    assert.equal(nullEnv.ok, false);
    assert.equal(nullEnv.empty, true);
    assert.match(nullEnv.error || "", /REFUSE: Query returned empty result/);

    const emptyArrayEnv = createEnvelope("Q-SCOPE", []);
    assert.equal(emptyArrayEnv.ok, false);
    assert.equal(emptyArrayEnv.empty, true);
    assert.match(emptyArrayEnv.error || "", /REFUSE: Query returned empty array/);
  });

  it("enforces K-CTX 8000 character limit on envelopes", () => {
    const hugePayload = { text: "A".repeat(9000) };
    const env = createEnvelope("Q-IMPACT", hugePayload);
    assert.equal(env.ok, false);
    assert.match(env.error || "", /exceeds cap of 8000 characters/);
  });

  it("enforces K-INSTR instruction budget <= 12 directives", () => {
    assert.equal(validateInstructionBudget(), true);
    assert.equal(DRAFTER_SYSTEM_DIRECTIVES.length, 12);
  });
});

describe("Layer 3: Query Registry (Q-SCOPE, Q-DUP, Q-IMPACT, Q-CLUSTER, Q-FINDING)", () => {
  it("resolves Q-SCOPE for in-scope endpoints and out-of-scope infrastructure", () => {
    const fixture = loadJuiceShopFixture();

    const inScopeEnv = queryScope(fixture, "/rest/user/login");
    assert.equal(inScopeEnv.ok, true);
    assert.equal(inScopeEnv.data?.inScope, true);
    assert.equal(inScopeEnv.data?.eligibleForBounty, true);

    const outScopeEnv = queryScope(fixture, "test.herokuapp.com infrastructure");
    assert.equal(outScopeEnv.ok, true);
    assert.equal(outScopeEnv.data?.inScope, false);
    assert.equal(outScopeEnv.data?.eligibleForBounty, false);

    const emptyTargetEnv = queryScope(fixture, "");
    assert.equal(emptyTargetEnv.ok, false);
    assert.equal(emptyTargetEnv.empty, true);
  });

  it("resolves Q-DUP by matching disclosed reports and calculating duplication confidence", () => {
    const fixture = loadJuiceShopFixture();
    const cluster: FindingCluster = {
      clusterId: "CLUSTER-SQLI",
      primaryFindingId: "F1",
      cwe: "CWE-89",
      title: "SQL Injection in User Login",
      findings: [
        {
          id: "F1",
          tool: "dast",
          ruleId: "CWE-89",
          severity: "critical",
          file: "/rest/user/login",
          message: "SQL Injection in login",
          proven: true,
          reachable: true,
          relatedIds: [],
          cycles: ["v17"],
          provenance: fixture.provenance,
        },
      ],
    };

    const dupEnv = queryDuplicates(fixture, cluster);
    assert.equal(dupEnv.ok, true);
    assert.equal(dupEnv.data?.isDuplicate, true);
    assert.equal(dupEnv.data?.duplicateConfidence, "high");
    assert.equal(dupEnv.data?.matchingReports.length, 1);
    assert.equal(dupEnv.data?.matchingReports[0].reportId, "DISC-001");
  });

  it("resolves Q-DUP cleanly when no duplicates exist", () => {
    const fixture = loadJuiceShopFixture();
    const cluster: FindingCluster = {
      clusterId: "CLUSTER-SSRF",
      primaryFindingId: "F2",
      cwe: "CWE-918",
      title: "Server Side Request Forgery",
      findings: [
        {
          id: "F2",
          tool: "sast",
          ruleId: "CWE-918",
          severity: "high",
          file: "routes/redirect.ts",
          message: "SSRF in URL preview",
          proven: false,
          reachable: true,
          relatedIds: [],
          cycles: ["v17"],
          provenance: fixture.provenance,
        },
      ],
    };

    const dupEnv = queryDuplicates(fixture, cluster);
    assert.equal(dupEnv.ok, true);
    assert.equal(dupEnv.data?.isDuplicate, false);
    assert.equal(dupEnv.data?.matchingReports.length, 0);
  });

  it("resolves Q-IMPACT with structured severity and remediation guidance", () => {
    const fixture = loadJuiceShopFixture();
    const cluster: FindingCluster = {
      clusterId: "CLUSTER-SQLI-01",
      primaryFindingId: "F-01",
      cwe: "CWE-89",
      title: "SQL Injection",
      findings: [
        {
          id: "F-01",
          tool: "zap",
          ruleId: "CWE-89",
          severity: "critical",
          file: "/rest/user/login",
          message: "Live SQL injection",
          proven: true,
          reachable: true,
          relatedIds: [],
          cycles: ["v17"],
          provenance: fixture.provenance,
        },
      ],
    };

    const impactEnv = queryImpact(cluster);
    assert.equal(impactEnv.ok, true);
    assert.equal(impactEnv.data?.findingId, "CLUSTER-SQLI-01");
    assert.equal(impactEnv.data?.severity, "critical");
    assert.equal(impactEnv.data?.proven, true);
    assert.match(impactEnv.data?.impactVector || "", /Confirmed live exploitability/);
    assert.match(impactEnv.data?.remediationRecommendation || "", /parameterized SQL queries/);
  });

  it("dispatches shared queries Q-FINDING and Q-CLUSTER through registry", () => {
    const finding: Finding = {
      id: "FINDING-TEST-01",
      tool: "manual",
      ruleId: "CWE-79",
      severity: "medium",
      message: "Test finding",
      proven: false,
      reachable: null,
      relatedIds: [],
      cycles: ["v17"],
      provenance: {
        source: "Test",
        timestamp: "2026-09-08T00:00:00Z",
        target: "Test",
        isPublicOrOwned: true,
      },
    };
    const cluster: FindingCluster = {
      clusterId: "CLUSTER-TEST-01",
      primaryFindingId: "FINDING-TEST-01",
      title: "Test Cluster",
      findings: [finding],
    };

    const findingEnv = dispatchQuery("Q-FINDING", {
      findings: [finding],
      findingId: "FINDING-TEST-01",
    });
    assert.equal(findingEnv.ok, true);

    const clusterEnv = dispatchQuery("Q-CLUSTER", {
      clusters: [cluster],
      clusterId: "CLUSTER-TEST-01",
    });
    assert.equal(clusterEnv.ok, true);

    const missingClusterEnv = dispatchQuery("Q-CLUSTER", {
      clusters: [cluster],
      clusterId: "CLUSTER-MISSING",
    });
    assert.equal(missingClusterEnv.ok, false);
    assert.equal(missingClusterEnv.empty, true);
  });
});

describe("Layer 4: Probabilistic Drafter & Tasks (report, severity, submit-note)", () => {
  it("drafts report, severity, and submit-note tasks strictly from envelope data", () => {
    const envelope = createEnvelope("Q-IMPACT", {
      findingId: "CLUSTER-JUICE-SQLI",
      asset: "/rest/user/login",
      cwe: "CWE-89",
      severity: "critical",
      proven: true,
      reachable: true,
      impactVector: "Confirmed live exploitability",
      remediationRecommendation: "Use parameterized queries",
    });

    const reportDraft = generateDraft({
      task: "report",
      queryId: "Q-IMPACT",
      envelope,
    });
    assert.equal(reportDraft.ok, true);
    assert.match(reportDraft.text || "", /Vulnerability Report for CLUSTER-JUICE-SQLI/);
    assert.match(reportDraft.text || "", /Asset: \/rest\/user\/login/);
    assert.deepEqual(reportDraft.citedIds, ["CLUSTER-JUICE-SQLI"]);
    assert.equal(reportDraft.requiresHumanStamp, true);

    const severityDraft = generateDraft({
      task: "severity",
      queryId: "Q-IMPACT",
      envelope,
    });
    assert.equal(severityDraft.ok, true);
    assert.match(severityDraft.text || "", /Severity Evaluation for CLUSTER-JUICE-SQLI/);
    assert.match(severityDraft.text || "", /Classified as critical severity/);

    const submitDraft = generateDraft({
      task: "submit-note",
      queryId: "Q-IMPACT",
      envelope,
    });
    assert.equal(submitDraft.ok, true);
    assert.match(submitDraft.text || "", /Submission Assessment for CLUSTER-JUICE-SQLI/);
    assert.match(submitDraft.text || "", /Awaiting mandatory human stamp/);
  });

  it("refuses to draft from an empty or error envelope", () => {
    const emptyEnv = refuseEnvelope("Q-IMPACT", "Missing required input");
    const draft = generateDraft({
      task: "report",
      queryId: "Q-IMPACT",
      envelope: emptyEnv,
    });

    assert.equal(draft.ok, false);
    assert.match(draft.error || "", /REFUSE: Cannot draft from empty or invalid envelope/);
  });
});

describe("Human Gate & Write Guard (K-WRITE, C-HITL)", () => {
  it("blocks state writes and submissions without valid human approval stamp", () => {
    const envelope = createEnvelope("Q-IMPACT", {
      findingId: "CLUSTER-JUICE-SQLI",
      asset: "/rest/user/login",
    });
    const draft = generateDraft({
      task: "submit-note",
      queryId: "Q-IMPACT",
      envelope,
    });

    const unapprovedStamp: HumanStamp = {
      approved: false,
      signedBy: "auditor",
      timestamp: "2026-09-08T00:00:00Z",
      decision: "dont_submit",
    };

    const blockedResult = executeBountySubmission(draft, unapprovedStamp);
    assert.equal(blockedResult.success, false);
    assert.equal(blockedResult.decision, "dont_submit");
    assert.match(blockedResult.message, /Refuse: Action blocked by write guard/);
  });

  it("allows submission when explicit human approval stamp is provided", () => {
    const envelope = createEnvelope("Q-IMPACT", {
      findingId: "CLUSTER-JUICE-SQLI",
      asset: "/rest/user/login",
    });
    const draft = generateDraft({
      task: "submit-note",
      queryId: "Q-IMPACT",
      envelope,
    });

    const approvedStamp: HumanStamp = {
      approved: true,
      signedBy: "lead-security-engineer",
      timestamp: "2026-09-08T00:00:00Z",
      decision: "submit",
      notes: "Verified against Juice Shop public guidelines",
    };

    const successResult = executeBountySubmission(draft, approvedStamp);
    assert.equal(successResult.success, true);
    assert.equal(successResult.decision, "submit");
    assert.match(successResult.message, /Bounty report successfully submitted by operator "lead-security-engineer"/);
  });
});

describe("End-to-End: Juice Shop Cluster through the Wall Proof", () => {
  it("runs a single Juice Shop cluster through all layers with no-LLM verification", () => {
    const fixture = loadJuiceShopFixture();
    const adapter = new BountyLayer1Adapter();
    adapter.registerProgram(fixture);
    const pulled = adapter.pull("owasp-juice-shop");

    const juiceFindings: Finding[] = [
      {
        id: "FINDING-JUICE-SQLI-01",
        tool: "semgrep",
        ruleId: "CWE-89",
        severity: "critical",
        file: "/rest/user/login",
        line: 42,
        message: "SQL Injection Admin bypass",
        proven: false,
        reachable: true,
        relatedIds: ["FINDING-JUICE-SQLI-02"],
        cycles: ["v17"],
        provenance: pulled.provenance,
      },
      {
        id: "FINDING-JUICE-SQLI-02",
        tool: "zap",
        ruleId: "CWE-89",
        severity: "critical",
        file: "/rest/user/login",
        line: 42,
        message: "Live exploit confirmed via auth bypass",
        proven: true,
        reachable: true,
        relatedIds: ["FINDING-JUICE-SQLI-01"],
        cycles: ["v17"],
        provenance: pulled.provenance,
      },
    ];

    const clusters = collapseFindings(juiceFindings);
    assert.equal(clusters.length, 1);
    const cluster = clusters[0];
    assert.equal(cluster.findings.length, 2);

    const scopeEnvelope = queryScope(pulled, "/rest/user/login");
    assert.equal(scopeEnvelope.ok, true);
    assert.equal(scopeEnvelope.data?.inScope, true);

    const dupEnvelope = queryDuplicates(pulled, cluster);
    assert.equal(dupEnvelope.ok, true);

    const impactEnvelope = queryImpact(cluster);
    assert.equal(impactEnvelope.ok, true);

    const reportDraft = generateDraft({
      task: "report",
      queryId: "Q-IMPACT",
      envelope: impactEnvelope,
    });
    assert.equal(reportDraft.ok, true);

    const stamp: HumanStamp = {
      approved: true,
      signedBy: "researcher-operator",
      timestamp: "2026-09-08T00:00:00Z",
      decision: "submit",
    };

    const submissionResult = executeBountySubmission(reportDraft, stamp);
    assert.equal(submissionResult.success, true);

    const evalResult = evaluateBountyEnvelope({
      envelope: impactEnvelope,
      cluster,
      humanStamp: stamp,
      draftText: reportDraft.text,
    });

    assert.equal(evalResult.passed, true);
    assert.equal(evalResult.checks.length, 4);
    assert.ok(evalResult.checks.every((c) => c.passed));
  });
});
