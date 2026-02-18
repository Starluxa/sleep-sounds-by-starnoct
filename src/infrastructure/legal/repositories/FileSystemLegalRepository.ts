import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { ILegalRepository } from "../../../application/legal/ports/ILegalRepository";
import { LegalDocument } from "../../../domain/legal/entities/legal-document";
import { LegalDocumentId } from "../../../domain/legal/value-objects/legal-document-id";
import { LegalDocumentFactory } from "../../../domain/legal/factories/legal-document.factory";
import { StaticLegalDocumentRepository } from "./static-legal-document.repository";
import { ContentHash } from "../../../domain/legal/value-objects/content-hash";

/**
 * Native-Aware implementation of ILegalRepository.
 * Uses Capacitor Filesystem for persistent storage with fallback to static data.
 * 
 * COMPLIANCE MAPPING (EU AI Act 2026):
 * - Article 12 (Record-keeping): Ensures legal documents are persisted and versioned.
 * - Article 15 (Cybersecurity): Uses native storage to protect against web-layer eviction.
 */
export class FileSystemLegalRepository implements ILegalRepository {
  private readonly BASE_DIR = "legal";

  constructor(
    private readonly factory: LegalDocumentFactory,
    private readonly staticFallback: StaticLegalDocumentRepository
  ) {}

  public async getLatestByType(type: string): Promise<LegalDocument | null> {
    const versions = await this.listVersions(type);
    if (versions.length > 0) {
      return versions[0];
    }
    return this.staticFallback.findByType(type);
  }

  public async getByVersion(type: string, version: string): Promise<LegalDocument | null> {
    try {
      const path = this.getFilePath(type, version);
      const result = await Filesystem.readFile({
        path,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });

      const data = JSON.parse(result.data as string);
      return this.mapToEntity(type, data);
    } catch (e) {
      // Fallback to static if version matches (static only has 1.0.0)
      const staticDoc = await this.staticFallback.findByType(type);
      if (staticDoc && staticDoc.version === version) {
        return staticDoc;
      }
      return null;
    }
  }

  public async getById(id: LegalDocumentId): Promise<LegalDocument | null> {
    // In this system, ID is often the type for latest, or type_version
    if (id.value.includes("_")) {
      const [type, version] = id.value.split("_");
      return this.getByVersion(type, version);
    }
    return this.getLatestByType(id.value);
  }

  public async save(document: LegalDocument): Promise<void> {
    const type = document.id.value;
    const version = document.version;
    const path = this.getFilePath(type, version);
    const dir = `${this.BASE_DIR}/${type}`;

    await this.ensureDirectory(dir);

    const data = {
      title: document.title,
      version: document.version,
      sections: document.sections.map(s => ({
        heading: s.heading,
        content: s.content,
        list: s.list
      })),
      effectiveDate: document.effectiveDate.toISOString(),
      lastUpdated: document.lastUpdated.toISOString(),
      hash: document.hash.value
    };

    await Filesystem.writeFile({
      path,
      data: JSON.stringify(data),
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });
  }

  public async listVersions(type: string): Promise<LegalDocument[]> {
    const documents: LegalDocument[] = [];
    
    try {
      const dir = `${this.BASE_DIR}/${type}`;
      const result = await Filesystem.readdir({
        path: dir,
        directory: Directory.Data
      });

      for (const file of result.files) {
        // result.files is an array of FileInfo or string depending on Capacitor version
        // In Capacitor 5+, it's FileInfo[]. In 4- it was string[].
        // package.json says @capacitor/filesystem: ^7.1.5, so it's FileInfo[].
        const fileName = typeof file === 'string' ? file : file.name;
        
        if (fileName.endsWith(".json")) {
          const version = fileName.replace(".json", "");
          const doc = await this.getByVersion(type, version);
          if (doc) {
            documents.push(doc);
          }
        }
      }
    } catch (e) {
      // Directory might not exist yet
    }

    // Add static version if not already present
    const staticDoc = await this.staticFallback.findByType(type);
    if (staticDoc && !documents.some(d => d.version === staticDoc.version)) {
      documents.push(staticDoc);
    }

    // Sort by version descending (naive semver sort)
    return documents.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
  }

  /**
   * Helper to reconstruct a LegalDocument from a JSON string.
   */
  private mapToEntity(id: string, data: any): LegalDocument {
    // We use the factory's reconstruct method to preserve the stored hash
    return this.factory.reconstruct(
      id,
      data.title,
      data.version,
      data.sections,
      new Date(data.lastUpdated),
      new Date(data.effectiveDate),
      data.hash
    );
  }

  /**
   * Helper to get the file path for a specific document version.
   */
  private getFilePath(type: string, version: string): string {
    return `${this.BASE_DIR}/${type}/${version}.json`;
  }

  /**
   * Helper to ensure the directory exists.
   */
  private async ensureDirectory(path: string): Promise<void> {
    try {
      await Filesystem.mkdir({
        path,
        directory: Directory.Data,
        recursive: true
      });
    } catch (e) {
      // Ignore if directory already exists
    }
  }
}
