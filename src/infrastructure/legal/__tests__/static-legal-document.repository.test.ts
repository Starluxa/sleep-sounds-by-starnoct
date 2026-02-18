import { StaticLegalDocumentRepository } from "../repositories/static-legal-document.repository";
import { LegalDocumentFactory } from "../../../domain/legal/factories/legal-document.factory";
import { CryptoHashService } from "../services/crypto-hash.service";
import { LegalDocumentId } from "../../../domain/legal/value-objects/legal-document-id";

/**
 * Simple test suite for StaticLegalDocumentRepository.
 * Run with: npx tsx src/infrastructure/legal/__tests__/static-legal-document.repository.test.ts
 */

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error("Assertion failed: " + message);
  }
}

async function runTests() {
  console.log("Running StaticLegalDocumentRepository Tests...");

  const hashService = new CryptoHashService();
  const factory = new LegalDocumentFactory(hashService);
  const repository = new StaticLegalDocumentRepository(factory);

  // Test Privacy Policy
  const privacyId = LegalDocumentId.create("privacy-policy");
  const privacyDoc = await repository.findById(privacyId);
  assert(!!privacyDoc, "Privacy Policy should be found");
  assert(privacyDoc?.title === "Privacy Policy", "Privacy Policy title should match");
  assert(privacyDoc?.version === "1.0.0", "Privacy Policy version should be 1.0.0");
  assert(!!privacyDoc?.hash.value && privacyDoc.hash.value.length > 0, "Privacy Policy should have a hash");
  console.log("✅ Privacy Policy test passed");

  // Test Terms of Service
  const termsId = LegalDocumentId.create("terms-of-service");
  const termsDoc = await repository.findById(termsId);
  assert(!!termsDoc, "Terms of Service should be found");
  assert(termsDoc?.title === "Terms of Service", "Terms of Service title should match");
  assert(termsDoc?.version === "1.0.0", "Terms of Service version should be 1.0.0");
  console.log("✅ Terms of Service test passed");

  // Test findByType
  const typeDoc = await repository.findByType("privacy-policy");
  assert(typeDoc?.title === "Privacy Policy", "findByType should work");
  console.log("✅ findByType test passed");

  // Test findAllVersions
  const versions = await repository.findAllVersions(privacyId);
  assert(versions.length === 1, "Should return 1 version");
  assert(versions[0].version === "1.0.0", "Version should be 1.0.0");
  console.log("✅ findAllVersions test passed");

  // Test non-existent
  const nonExistentId = LegalDocumentId.create("non-existent");
  const nonExistentDoc = await repository.findById(nonExistentId);
  assert(nonExistentDoc === null, "Should return null for non-existent");
  console.log("✅ Non-existent document test passed");

  console.log("All StaticLegalDocumentRepository tests passed! 🚀");
}

runTests().catch(err => {
  console.error("❌ Tests failed:", err);
  process.exit(1);
});
