import { ILegalRepository } from "../ports/ILegalRepository";
import { LegalDocument } from "../../../domain/legal/entities/legal-document";
import { LegalDocumentFactory } from "../../../domain/legal/factories/legal-document.factory";
import { TamperDetectedError } from "../../../domain/legal/errors/tamper-detected.error";

export interface GetLegalDocumentInput {
  type: string;
  version?: string;
}

/**
 * GetLegalDocument Use Case
 * 
 * Retrieves a legal document and verifies its integrity using content hashing.
 * This fulfills the 2026 Digital Audit Trail requirement for high-risk AI systems.
 * 
 * COMPLIANCE MAPPING (EU AI Act 2026):
 * - Article 12 (Record-keeping): Ensures all retrieved legal records are authentic.
 * - Article 15 (Cybersecurity): Detects and prevents the use of tampered legal documents.
 */
export class GetLegalDocument {
  constructor(
    private readonly repository: ILegalRepository,
    private readonly factory: LegalDocumentFactory
  ) {}

  public async execute(input: GetLegalDocumentInput): Promise<LegalDocument> {
    let document: LegalDocument | null;

    if (input.version) {
      document = await this.repository.getByVersion(input.type, input.version);
    } else {
      document = await this.repository.getLatestByType(input.type);
    }

    if (!document) {
      throw new Error(`Legal document not found: ${input.type}${input.version ? ` (v${input.version})` : ""}`);
    }

    // VERIFICATION STEP: Recalculate hash and compare with stored hash
    const currentHash = this.factory.calculateHash(
      document.title,
      document.version,
      document.sections
    );

    if (!document.verifyIntegrity(currentHash)) {
      // AUDIT LOG: In a real system, we would log this event to a secure audit trail
      console.error(`[AUDIT FAILURE] Tamper detected in ${document.id.value} v${document.version}`);
      throw new TamperDetectedError(document.id.value, document.version);
    }

    // AUDIT LOG: Successful verification
    console.log(`[AUDIT SUCCESS] Integrity verified for ${document.id.value} v${document.version}`);

    return document;
  }
}
