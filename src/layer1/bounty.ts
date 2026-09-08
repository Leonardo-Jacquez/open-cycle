import {
  BountyPullPayload,
  BountyScope,
  BountyAsset,
  DisclosedReport,
  ReconNote,
  PullProvenance,
} from "../types.js";
import { Layer1Adapter, validatePublicProvenance } from "./base.js";

/**
 * Configuration options for the Bug-Bounty Layer 1 Adapter.
 */
export interface BountyAdapterConfig {
  maxReportLength?: number;
  maxAssetCount?: number;
  allowedPrograms?: string[];
}

/**
 * Layer 1 Adapter for bug-bounty intake.
 * Ingests public and owned-program data (scope, assets, disclosed reports, recon notes).
 * Enforces refuse-on-empty, source authorization, and no cross-program contamination.
 */
export class BountyLayer1Adapter implements Layer1Adapter<BountyPullPayload> {
  private readonly config: Required<BountyAdapterConfig>;
  private readonly programs: Map<string, BountyPullPayload> = new Map();

  /**
   * Initializes the BountyLayer1Adapter with optional configuration overrides.
   *
   * @param config Optional configuration constraints for payload ingestion.
   */
  constructor(config?: BountyAdapterConfig) {
    this.config = {
      maxReportLength: config?.maxReportLength ?? 4000,
      maxAssetCount: config?.maxAssetCount ?? 500,
      allowedPrograms: config?.allowedPrograms ?? ["juice-shop", "owasp-juice-shop"],
    };
  }

  /**
   * Registers a public or owned-program payload in the adapter.
   *
   * @param payload The complete bounty payload to store and validate.
   */
  public registerProgram(payload: BountyPullPayload): void {
    if (!this.validate(payload)) {
      throw new Error("Invalid bounty payload: fails ADR 0001 or empty constraints");
    }
    this.programs.set(payload.scope.programId, payload);
  }

  /**
   * Pulls bounty program data for a specified program ID.
   *
   * @param programId Unique identifier of the bounty program.
   * @returns Ingested and validated BountyPullPayload.
   */
  public pull(programId: string): BountyPullPayload {
    if (!programId || programId.trim().length === 0) {
      throw new Error("Refuse: programId cannot be empty");
    }

    const payload = this.programs.get(programId);
    if (!payload) {
      throw new Error(`Refuse: program "${programId}" not found or empty`);
    }

    if (!this.validate(payload)) {
      throw new Error("Refuse: payload failed invariant validation");
    }

    return payload;
  }

  /**
   * Validates that the payload adheres to public data rules, non-empty scope,
   * non-empty assets, and isolates program disclosures per ADR 0001.
   *
   * @param payload The bounty payload to inspect.
   * @returns True if payload complies with all Layer 1 invariants.
   */
  public validate(payload: BountyPullPayload): boolean {
    if (!payload || !payload.scope || !payload.provenance) {
      return false;
    }

    if (!validatePublicProvenance(payload.provenance)) {
      return false;
    }

    if (!payload.scope.programId || payload.scope.programId.trim().length === 0) {
      return false;
    }

    if (!Array.isArray(payload.scope.inScope) || payload.scope.inScope.length === 0) {
      return false;
    }

    if (!Array.isArray(payload.assets) || payload.assets.length === 0) {
      return false;
    }

    if (payload.assets.length > this.config.maxAssetCount) {
      return false;
    }

    for (const report of payload.disclosedReports) {
      if (report.summary.length > this.config.maxReportLength) {
        return false;
      }
      const assetBelongsToProgram =
        payload.assets.some((a) => report.asset.includes(a.name) || report.asset.includes(a.uri)) ||
        payload.scope.inScope.some((s) => report.asset.includes(s.target));

      if (!assetBelongsToProgram) {
        return false;
      }
    }

    return true;
  }
}
