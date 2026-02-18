import { LegalDocument } from "../../../domain/legal/entities/legal-document";
import { LegalDocumentId } from "../../../domain/legal/value-objects/legal-document-id";

/**
 * ILegalRepository Port (Gateway)
 * 
 * This interface defines the contract for legal document persistence and retrieval
 * in the Application layer. It is async-first to support Next.js 15/16 and 
 * Native Bridge (Capacitor) requirements.
 * 
 * COMPLIANCE MAPPING (EU AI Act 2026):
 * - Article 12 (Record-keeping): Ensures all legal versions are retrievable for audit.
 * - Article 15 (Cybersecurity): Supports persistence of tamper-evident documents.
 */
export interface ILegalRepository {
  /**
   * Retrieves the latest version of a document by its type (e.g., 'privacy-policy').
   */
  getLatestByType(type: string): Promise<LegalDocument | null>;

  /**
   * Retrieves a specific version of a document by its type and version string.
   */
  getByVersion(type: string, version: string): Promise<LegalDocument | null>;

  /**
   * Retrieves a document by its unique ID.
   */
  getById(id: LegalDocumentId): Promise<LegalDocument | null>;

  /**
   * Persists or caches a document to the storage (e.g., Native Filesystem).
   */
  save(document: LegalDocument): Promise<void>;

  /**
   * Lists all available versions for a specific document type.
   */
  listVersions(type: string): Promise<LegalDocument[]>;
}
