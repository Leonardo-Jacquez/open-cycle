import { PullProvenance } from "../types.js";

/**
 * Base abstract interface for Layer 1 adapters.
 */
export interface Layer1Adapter<T> {
  pull(identifier: string): T;
  validate(payload: T): boolean;
}

/**
 * Validates pull provenance against the public-only constraint (ADR 0001).
 *
 * @param provenance The provenance record attached to the pull.
 * @returns True if provenance meets public/owned-program rules.
 */
export function validatePublicProvenance(provenance: PullProvenance): boolean {
  if (!provenance.isPublicOrOwned) {
    return false;
  }
  if (!provenance.source || provenance.source.trim().length === 0) {
    return false;
  }
  if (!provenance.target || provenance.target.trim().length === 0) {
    return false;
  }
  return true;
}
