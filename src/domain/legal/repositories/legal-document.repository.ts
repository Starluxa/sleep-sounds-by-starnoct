import { LegalDocument } from "../entities/legal-document";
import { LegalDocumentId } from "../value-objects/legal-document-id";

/**
 * Repository interface for LegalDocument entities.
 * Follows the Repository pattern to abstract persistence.
 */
export interface ILegalDocumentRepository {
  findById(id: LegalDocumentId): Promise<LegalDocument | null>;
  findByType(type: string): Promise<LegalDocument | null>; // e.g. 'privacy-policy'
  save(document: LegalDocument): Promise<void>;
  findAllVersions(id: LegalDocumentId): Promise<LegalDocument[]>;
}
