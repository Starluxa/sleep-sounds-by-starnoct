/**
 * Error thrown when a legal document's content hash does not match its stored hash.
 * 
 * COMPLIANCE MAPPING (EU AI Act 2026):
 * - Article 15 (Cybersecurity): Detects unauthorized modifications to legal records.
 * - Article 73: Provides forensic evidence of system integrity failure.
 */
export class TamperDetectedError extends Error {
  constructor(documentId: string, version: string) {
    super(`Tamper detected in legal document: ${documentId} (v${version}). Content hash mismatch.`);
    this.name = "TamperDetectedError";
  }
}
