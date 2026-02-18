/**
 * Settings Gateway Port - Domain Layer
 * 
 * This interface defines the contract for external actions that the settings menu
 * needs to perform. It is a "Port" in Hexagonal Architecture, representing the
 * boundary between the Domain layer and the Infrastructure layer.
 * 
 * The Domain layer defines this interface to specify WHAT external actions need
 * to be performed, while the Infrastructure layer implements ADAPTERS that
 * specify HOW those actions are performed on specific platforms (Web, Android, iOS).
 * 
 * This interface remains pure and platform-agnostic:
 * - No framework imports (React, Capacitor, etc.)
 * - No platform-specific implementations
 * - Only defines the contract for external actions
 * 
 * Domain Layer: Policy (What external actions are needed)
 * - Pure TypeScript with no framework dependencies
 * - Platform-agnostic interface definition
 * - Centralized contract for external interactions
 */

// ============================================================================
// VALUE OBJECTS
// ============================================================================

/**
 * EmailConfig - Configuration for opening an email client
 * 
 * This is a Value Object that encapsulates the data needed to compose an email.
 * It is immutable and defined by its attributes (recipient, subject, body).
 * 
 * The Domain layer defines this structure so that Infrastructure adapters
 * can properly format and send emails on different platforms.
 */
export interface EmailConfig {
  /** Email recipient address */
  readonly recipient: string;
  
  /** Email subject line */
  readonly subject: string;
  
  /** Email body content */
  readonly body: string;
}

// ============================================================================
// PORT INTERFACE
// ============================================================================

/**
 * ISettingsGateway - Port interface for external actions
 * 
 * This interface defines the contract for external actions that the settings
 * menu needs to perform. It is implemented by Adapters in the Infrastructure
 * layer that handle platform-specific implementations.
 * 
 * Key Design Principles:
 * 1. Pure interface - no implementation logic
 * 2. Platform-agnostic - works on Web, Android, iOS
 * 3. Async operations - all methods return Promises
 * 4. No side effects in interface - only defines the contract
 * 5. Domain-driven - methods reflect domain needs, not technical details
 * 
 * Example implementations:
 * - Web Adapter: Uses window.open() for email, window.location.href for navigation
 * - Android Adapter: Uses Intent with FLAG_ACTIVITY_NO_HISTORY for email
 * - iOS Adapter: Uses MFMailComposeViewController or deep links
 */
export interface ISettingsGateway {
  /**
   * Opens the email client with pre-filled configuration
   * 
   * This method abstracts the platform-specific way of opening an email client
   * with pre-filled recipient, subject, and body. The Domain layer doesn't care
   * about the implementation details (mailto: scheme, Intent, MFMailComposeViewController).
   * 
   * @param config - Email configuration with recipient, subject, and body
   * @returns Promise that resolves when the email client is opened
   * 
   * @example
   * // Domain layer usage
   * await settingsGateway.openEmail({
   *   recipient: 'starnoctapps@proton.me',
   *   subject: 'StarNoct Sleep Sounds Feedback',
   *   body: 'Please provide your feedback here...'
   * });
   */
  openEmail(config: EmailConfig): Promise<void>;

  /**
   * Opens the app store for rating or viewing the app
   * 
   * This method abstracts the platform-specific way of opening an app store.
   * The Domain layer provides the app ID, and the Adapter handles the
   * platform-specific URI scheme (market:// for Android, App Store URL for iOS).
   * 
   * @param appId - The application identifier (package name or app store ID)
   * @returns Promise that resolves when the app store is opened
   * 
   * @example
   * // Domain layer usage
   * await settingsGateway.openStore('com.starnoct.sleepsounds');
   */
  openStore(appId: string): Promise<void>;

  /**
   * Navigates to a specific path within the application
   * 
   * This method abstracts the platform-specific way of navigating between
   * screens or pages. The Domain layer provides a path, and the Adapter
   * handles the navigation mechanism (Next.js router, Capacitor navigation, etc.).
   * 
   * @param path - The path to navigate to (e.g., '/saved-mixes', '/help')
   * @returns Promise that resolves when navigation is initiated
   * 
   * @example
   * // Domain layer usage
   * await settingsGateway.navigate('/saved-mixes');
   */
  navigate(path: string): Promise<void>;
}
