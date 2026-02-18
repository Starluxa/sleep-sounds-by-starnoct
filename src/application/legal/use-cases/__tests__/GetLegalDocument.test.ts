import { GetLegalDocument } from "../GetLegalDocument";
import { ILegalRepository } from "../../ports/ILegalRepository";
import { LegalDocument } from "../../../../domain/legal/entities/legal-document";
import { LegalDocumentFactory } from "../../../../domain/legal/factories/legal-document.factory";
import { IHashService } from "../../../../domain/legal/services/hash.service";
import { TamperDetectedError } from "../../../../domain/legal/errors/tamper-detected.error";
import { LegalDocumentId } from "../../../../domain/legal/value-objects/legal-document-id";

/**
 * Test suite for GetLegalDocument Use Case.
 * Run with: npx tsx src/application/legal/use-cases/__tests__/GetLegalDocument.test.ts
 */

class MockHashService implements IHashService {
  hash(content: string): string {
    // Ensure hash is at least 32 characters
    return "mock-hash-" + content.length.toString().padStart(22, "0");
  }
  getAlgorithm(): string {
    return "MOCK";
  }
}

class MockLegalRepository implements ILegalRepository {
  private docs: Map<string, LegalDocument> = new Map();

  async getLatestByType(type: string): Promise<LegalDocument | null> {
    return this.docs.get(type) || null;
  }
  async getByVersion(type: string, version: string): Promise<LegalDocument | null> {
    return this.docs.get(`${type}_${version}`) || null;
  }
  async getById(id: LegalDocumentId): Promise<LegalDocument | null> {
    return null;
  }
  async save(document: LegalDocument): Promise<void> {
    this.docs.set(document.id.value, document);
    this.docs.set(`${document.id.value}_${document.version}`, document);
  }
  async listVersions(type: string): Promise<LegalDocument[]> {
    return [];
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error("Assertion failed: " + message);
  }
}

async function runTests() {
  console.log("Running GetLegalDocument Use Case Tests...");

  const hashService = new MockHashService();
  const factory = new LegalDocumentFactory(hashService);
  const repository = new MockLegalRepository();
  const useCase = new GetLegalDocument(repository, factory);

  // 1. Test successful retrieval and verification
  const validDoc = factory.create(
    "privacy-policy",
    "Privacy Policy",
    "1.0.0",
    [{ heading: "Section 1", content: "Content 1" }]
  );
  await repository.save(validDoc);

  const result = await useCase.execute({ type: "privacy-policy" });
  assert(result.id.value === "privacy-policy", "Should retrieve correct document");
  console.log("✅ Successful retrieval test passed");

  // 2. Test tamper detection
  // We simulate tampering by reconstructing the entity with a WRONG hash
  const tamperedDoc = factory.reconstruct(
    "terms-of-service",
    "Terms of Service",
    "1.0.0",
    [{ heading: "Section 1", content: "Content 1" }],
    new Date(),
    new Date(),
    "wrong-hash-value-that-is-long-enough-32-chars"
  );
  await repository.save(tamperedDoc);

  try {
    await useCase.execute({ type: "terms-of-service" });
    assert(false, "Should have thrown TamperDetectedError");
  } catch (e) {
    assert(e instanceof TamperDetectedError, "Should throw TamperDetectedError");
    console.log("✅ Tamper detection test passed");
  }

  console.log("All tests passed! 🚀");
}

runTests().catch(err => {
  console.error("❌ Tests failed:", err);
  process.exit(1);
});
