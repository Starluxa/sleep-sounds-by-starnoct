/**
 * Seed Provider Port - Domain Layer
 *
 * This interface defines the contract for providing a stable seed
 * for deterministic random number generation. It ensures hydration
 * parity between server and client by providing the same seed value.
 *
 * The Domain layer defines this interface to specify WHAT seed is needed,
 * while the Infrastructure layer implements ADAPTERS that specify HOW
 * the seed is obtained (hardcoded, version-based, session-based, etc.).
 *
 * This interface remains pure and platform-agnostic:
 * - No framework imports (React, Next.js, etc.)
 * - No platform-specific implementations
 * - Only defines the contract for seed provision
 *
 * Domain Layer: Policy (What seed is needed for deterministic generation)
 * - Pure TypeScript with no framework dependencies
 * - Platform-agnostic interface definition
 * - Centralized contract for seed access
 */

/**
 * ISeedProvider - Port interface for seed provision
 *
 * This interface defines the contract for obtaining a stable seed
 * that ensures deterministic random generation across server and client.
 * It is implemented by Adapters in the Infrastructure layer.
 *
 * Key Design Principles:
 * 1. Pure interface - no implementation logic
 * 2. Platform-agnostic - works on Web, Android, iOS
 * 3. Synchronous - seed must be immediately available
 * 4. Deterministic - same seed for hydration parity
 * 5. Domain-driven - focused on domain needs, not technical details
 *
 * Example implementations:
 * - Hardcoded seed for consistent onboarding experience
 * - Version-based seed for app updates
 * - Session-based seed for user-specific consistency
 */
export interface ISeedProvider {
  /**
   * Gets a stable seed for deterministic random generation
   *
   * This method provides a seed that ensures the same random sequence
   * is generated on both server and client, preventing hydration mismatches
   * in components that use procedural generation.
   *
   * @returns A numeric seed value for PRNG initialization
   *
   * @example
   * // Domain layer usage
   * const seed = seedProvider.getSeed();
   * const rng = new Mulberry32(seed);
   */
  getSeed(): number;
}