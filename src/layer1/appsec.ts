import { Finding, PullProvenance } from "../types.js";
import { Layer1Adapter, validatePublicProvenance } from "./base.js";

/**
 * AppSec pull payload containing findings and tool provenance.
 */
export interface AppSecPullPayload {
  pin: string;
  findings: Finding[];
  provenance: PullProvenance;
}

/**
 * Layer 1 Adapter for AppSec scanner tools across pinned versions.
 */
export class AppSecLayer1Adapter implements Layer1Adapter<AppSecPullPayload> {
  private readonly pins: Map<string, AppSecPullPayload> = new Map();

  /**
   * Registers an AppSec pin payload (e.g., v16.0.0 or v17.0.0).
   *
   * @param payload Pinned AppSec scanner findings and provenance.
   */
  public registerPin(payload: AppSecPullPayload): void {
    if (!this.validate(payload)) {
      throw new Error("Invalid AppSec payload: fails public provenance or empty constraints");
    }
    this.pins.set(payload.pin, payload);
  }

  /**
   * Pulls scanner data for a specific version pin.
   *
   * @param pin Version tag such as v16.0.0 or v17.0.0.
   * @returns AppSec pull payload for the pin.
   */
  public pull(pin: string): AppSecPullPayload {
    const payload = this.pins.get(pin);
    if (!payload) {
      throw new Error(`Refuse: pin "${pin}" not found or empty`);
    }
    return payload;
  }

  /**
   * Validates AppSec pull payload against provenance and non-empty constraints.
   *
   * @param payload AppSec pull payload to validate.
   * @returns True if payload is valid.
   */
  public validate(payload: AppSecPullPayload): boolean {
    if (!payload || !payload.pin || !payload.provenance) {
      return false;
    }
    if (!validatePublicProvenance(payload.provenance)) {
      return false;
    }
    if (!Array.isArray(payload.findings) || payload.findings.length === 0) {
      return false;
    }
    return true;
  }
}
