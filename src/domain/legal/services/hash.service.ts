/**
 * Interface for hashing services.
 * Injected into the domain to maintain purity while allowing cryptographic operations.
 */
export interface IHashService {
  hash(content: string): string;
  getAlgorithm(): string;
}
