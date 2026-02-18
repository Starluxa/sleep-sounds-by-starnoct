import { useState, useEffect, useMemo, useCallback } from 'react';
import { GetLegalDocument, GetLegalDocumentInput } from "../../src/application/legal/use-cases/GetLegalDocument";
import { FileSystemLegalRepository } from "../../src/infrastructure/legal/repositories/FileSystemLegalRepository";
import { StaticLegalDocumentRepository } from "../../src/infrastructure/legal/repositories/static-legal-document.repository";
import { LegalDocumentFactory } from "../../src/domain/legal/factories/legal-document.factory";
import { CryptoHashService } from "../../src/infrastructure/legal/services/crypto-hash.service";
import { LegalDocument } from "../../src/domain/legal/entities/legal-document";
import { TamperDetectedError } from "../../src/domain/legal/errors/tamper-detected.error";

export interface UseLegalDocumentReturn {
  document: LegalDocument | null;
  loading: boolean;
  error: Error | TamperDetectedError | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook to fetch and verify legal documents.
 * Acts as an "Adaptation Bridge" between the Presentation layer (React) 
 * and the Application layer (Use Cases).
 * 
 * COMPLIANCE MAPPING (EU AI Act 2026):
 * - Article 12 (Record-keeping): Facilitates retrieval of verified legal records.
 * - Article 15 (Cybersecurity): Exposes tamper detection results to the UI.
 */
export function useLegalDocument(type: string, version?: string): UseLegalDocumentReturn {
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Dependency Injection Setup
  // We use useMemo to ensure dependencies are only instantiated once per hook instance.
  // In a larger app, these might come from a React Context (Composition Root).
  const useCase = useMemo(() => {
    const hashService = new CryptoHashService();
    const factory = new LegalDocumentFactory(hashService);
    const staticRepo = new StaticLegalDocumentRepository(factory);
    const repository = new FileSystemLegalRepository(factory, staticRepo);
    return new GetLegalDocument(repository, factory);
  }, []);

  /**
   * Executes the use case to fetch the document.
   */
  const fetchDocument = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const input: GetLegalDocumentInput = { type, version };
      const result = await useCase.execute(input);
      setDocument(result);
    } catch (err) {
      // We specifically handle TamperDetectedError to allow the UI to react accordingly
      if (err instanceof TamperDetectedError) {
        console.error(`[SECURITY ALERT] Tamper detected for ${type} v${version || 'latest'}`);
      } else {
        console.error(`[useLegalDocument] Error fetching ${type}:`, err);
      }
      
      setError(err instanceof Error ? err : new Error(String(err)));
      setDocument(null);
    } finally {
      setLoading(false);
    }
  }, [useCase, type, version]);

  // Next.js 15/16 & React 19: Side effects must be isolated in useEffect
  // to ensure they only run on the client and don't block hydration.
  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  return {
    document,
    loading,
    error,
    refresh: fetchDocument
  };
}
