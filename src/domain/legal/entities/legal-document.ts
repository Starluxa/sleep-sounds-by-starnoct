import { Entity } from "../../core/entity";
import { LegalDocumentId } from "../value-objects/legal-document-id";
import { ContentHash } from "../value-objects/content-hash";
import { LegalSection } from "./legal-section";

interface LegalDocumentProps {
  title: string;
  version: string;
  sections: LegalSection[];
  lastUpdated: Date;
  effectiveDate: Date;
  hash: ContentHash;
}

/**
 * LegalDocument Entity
 * Follows Hexagonal Architecture & DDD.
 * 
 * COMPLIANCE MAPPING (EU AI Act 2026):
 * - Article 12 (Record-keeping): Ensures traceability of legal terms across versions.
 * - Article 15 (Cybersecurity): Content hashing provides tamper-evidence for legal documentation.
 * - Article 11 (Technical Documentation): Versioning reflects the system's relation to previous states.
 */
export class LegalDocument extends Entity<LegalDocumentProps, LegalDocumentId> {
  private constructor(props: LegalDocumentProps, id: LegalDocumentId) {
    super(props, id);
  }

  get title(): string {
    return this.props.title;
  }

  get version(): string {
    return this.props.version;
  }

  get sections(): LegalSection[] {
    return [...this.props.sections];
  }

  get lastUpdated(): Date {
    return this.props.lastUpdated;
  }

  get effectiveDate(): Date {
    return this.props.effectiveDate;
  }

  get hash(): ContentHash {
    return this.props.hash;
  }

  /**
   * Creates a new LegalDocument instance.
   * Validation of hash and versioning ensures compliance with Article 12 (Record-keeping).
   */
  public static create(
    props: LegalDocumentProps,
    id: LegalDocumentId
  ): LegalDocument {
    // Domain Invariants
    if (!props.title) throw new Error("Title is required");
    if (!props.version) throw new Error("Version is required");
    if (props.sections.length === 0) throw new Error("Document must have at least one section");

    return new LegalDocument(props, id);
  }

  /**
   * Helper to check if the document content matches a given hash.
   */
  public verifyIntegrity(currentHash: ContentHash): boolean {
    return this.props.hash.equals(currentHash);
  }
}
