import { LegalDocument } from "../entities/legal-document";
import { LegalDocumentId } from "../value-objects/legal-document-id";
import { ContentHash } from "../value-objects/content-hash";
import { LegalSection } from "../entities/legal-section";
import { IHashService } from "../services/hash.service";

/**
 * Factory for creating LegalDocument entities.
 * Handles the complexity of hash generation and initial versioning.
 */
export class LegalDocumentFactory {
  constructor(private readonly hashService: IHashService) {}

  public create(
    id: string,
    title: string,
    version: string,
    sections: { heading: string; content?: string; list?: string[] }[],
    effectiveDate: Date = new Date()
  ): LegalDocument {
    const domainSections = sections.map((s) => LegalSection.create(s));
    
    // Serialize content for hashing
    const contentToHash = JSON.stringify({
      title,
      version,
      sections: domainSections.map(s => ({
        h: s.heading,
        c: s.content,
        l: s.list
      }))
    });

    const hashValue = this.hashService.hash(contentToHash);
    const hash = ContentHash.create(hashValue, this.hashService.getAlgorithm());

    return LegalDocument.create(
      {
        title,
        version,
        sections: domainSections,
        lastUpdated: new Date(),
        effectiveDate,
        hash
      },
      LegalDocumentId.create(id)
    );
  }

  /**
   * Reconstructs a LegalDocument from stored data, including its stored hash.
   * This allows for integrity verification later.
   */
  public reconstruct(
    id: string,
    title: string,
    version: string,
    sections: { heading: string; content?: string; list?: string[] }[],
    lastUpdated: Date,
    effectiveDate: Date,
    storedHash: string,
    algorithm: string = "SHA-256"
  ): LegalDocument {
    const domainSections = sections.map((s) => LegalSection.create(s));
    const hash = ContentHash.create(storedHash, algorithm);

    return LegalDocument.create(
      {
        title,
        version,
        sections: domainSections,
        lastUpdated,
        effectiveDate,
        hash
      },
      LegalDocumentId.create(id)
    );
  }

  /**
   * Calculates the hash for a given set of document components.
   * Used by Use Cases to verify integrity against the stored hash.
   */
  public calculateHash(
    title: string,
    version: string,
    sections: LegalSection[]
  ): ContentHash {
    const contentToHash = JSON.stringify({
      title,
      version,
      sections: sections.map(s => ({
        h: s.heading,
        c: s.content,
        l: s.list
      }))
    });

    const hashValue = this.hashService.hash(contentToHash);
    return ContentHash.create(hashValue, this.hashService.getAlgorithm());
  }
}
