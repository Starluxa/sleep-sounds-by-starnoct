/**
 * Stable Seed Provider - Infrastructure Adapter
 *
 * This adapter provides a stable, hardcoded seed for deterministic
 * random number generation. It ensures hydration parity by returning
 * the same seed value on both server and client.
 *
 * Infrastructure Layer: Mechanism (How the seed is provided)
 * - Implements the ISeedProvider port interface
 * - Dumb terminal that executes commands without business logic
 * - Platform-agnostic implementation (works on Web, Android, iOS)
 * - No dependencies on UI frameworks or external state
 */

import { ISeedProvider } from '../../core/onboarding/ISeedProvider';

/**
 * Stable seed value for deterministic generation
 *
 * This hardcoded seed ensures consistent star layouts across
 * server and client rendering, preventing hydration mismatches.
 * The value is arbitrary but stable for the app's lifetime.
 */
const STABLE_SEED = 0x12345678; // 305419896 in decimal

/**
 * StableSeedProvider - Infrastructure adapter for seed provision
 *
 * This class implements the ISeedProvider interface by providing
 * a hardcoded seed value. It acts as a dumb terminal that simply
 * returns the stable seed without any logic or external dependencies.
 *
 * Key Design Principles:
 * 1. Dumb infrastructure - no business logic, just data provision
 * 2. Dependency injection ready - can be injected into domain services
 * 3. Hydration-safe - same value on server and client
 * 4. Testable - deterministic output for reliable testing
 */
export class StableSeedProvider implements ISeedProvider {
  /**
   * Gets the stable seed for deterministic random generation
   *
   * Returns a hardcoded seed value that ensures the same random
   * sequence is generated on both server and client, maintaining
   * hydration parity for procedurally generated UI elements.
   *
   * @returns The stable seed value
   */
  public getSeed(): number {
    return STABLE_SEED;
  }
}