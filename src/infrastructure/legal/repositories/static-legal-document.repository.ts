import { ILegalDocumentRepository } from "../../../domain/legal/repositories/legal-document.repository";
import { LegalDocument } from "../../../domain/legal/entities/legal-document";
import { LegalDocumentId } from "../../../domain/legal/value-objects/legal-document-id";
import { LegalDocumentFactory } from "../../../domain/legal/factories/legal-document.factory";
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from "../data/static-legal-data";

/**
 * Static implementation of ILegalDocumentRepository.
 * Seeds domain entities from legacy static data.
 * 
 * COMPLIANCE MAPPING (EU AI Act 2026):
 * - Article 12: Ensures static legal terms are versioned and traceable.
 */
export class StaticLegalDocumentRepository implements ILegalDocumentRepository {
  private readonly documents: Map<string, LegalDocument> = new Map();

  constructor(private readonly factory: LegalDocumentFactory) {
    this.seed();
  }

  private seed(): void {
    // Seed Privacy Policy
    const privacyPolicy = this.factory.create(
      "privacy-policy",
      PRIVACY_POLICY.title,
      "1.0.0",
      PRIVACY_POLICY.sections.map(s => ({
        heading: s.heading,
        content: s.content,
        list: s.list
      })),
      new Date("2024-11-01") // Based on "November 2024"
    );
    this.documents.set("privacy-policy", privacyPolicy);

    // Seed Terms of Service
    const termsOfService = this.factory.create(
      "terms-of-service",
      TERMS_OF_SERVICE.title,
      "1.0.0",
      TERMS_OF_SERVICE.sections.map(s => ({
        heading: s.heading,
        content: s.content,
        list: s.list
      })),
      new Date("2024-11-01") // Based on "November 2024"
    );
    this.documents.set("terms-of-service", termsOfService);
  }

  public async findById(id: LegalDocumentId): Promise<LegalDocument | null> {
    return this.documents.get(id.value) || null;
  }

  public async findByType(type: string): Promise<LegalDocument | null> {
    return this.documents.get(type) || null;
  }

  public async save(document: LegalDocument): Promise<void> {
    // Static repository is read-only for now, but we implement the interface
    this.documents.set(document.id.value, document);
  }

  public async findAllVersions(id: LegalDocumentId): Promise<LegalDocument[]> {
    const doc = this.documents.get(id.value);
    return doc ? [doc] : [];
  }
}
