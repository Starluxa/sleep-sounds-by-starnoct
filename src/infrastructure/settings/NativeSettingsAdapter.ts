/**
 * Native Settings Adapter - Infrastructure Layer
 *
 * This adapter implements the ISettingsGateway port for native mobile platforms.
 * It provides concrete implementations using Capacitor plugins and native APIs
 * for opening email clients, app stores, and navigating within the application.
 *
 * Infrastructure Layer: Mechanism (How external actions are performed)
 * - Uses Capacitor plugins (AudioControl for email/store operations)
 * - Handles platform-specific implementation details
 * - Adapts native APIs to the domain interface
 */

import { ISettingsGateway, EmailConfig } from '../../core/settings/ISettingsGateway';
import { AudioControl } from '../../../app/lib/native-audio-bridge';

/**
 * NavigationCallback - Function type for navigation operations
 *
 * This callback allows the adapter to delegate navigation to the presentation layer,
 * maintaining separation between infrastructure and UI concerns.
 */
export type NavigationCallback = (path: string) => void;

/**
 * NativeSettingsAdapter - Native platform implementation of ISettingsGateway
 *
 * This adapter uses Capacitor plugins and native platform APIs:
 * - openEmail: Uses AudioControl plugin's openEmail method
 * - openStore: Uses AudioControl plugin's openStore method
 * - navigate: Uses provided navigation callback (typically Next.js router)
 *
 * The adapter bridges the domain interface with native platform capabilities
 * while maintaining the hexagonal architecture boundaries.
 */
export class NativeSettingsAdapter implements ISettingsGateway {
  /**
   * Navigation callback for handling internal navigation
   *
   * This callback is injected to allow the adapter to perform navigation
   * without directly depending on framework-specific routing logic.
   */
  private readonly navigateCallback: NavigationCallback;

  /**
   * Creates a new NativeSettingsAdapter instance
   *
   * @param navigateCallback - Callback function for navigation operations
   */
  constructor(navigateCallback: NavigationCallback) {
    this.navigateCallback = navigateCallback;
  }

  /**
   * Opens the email client with pre-filled configuration
   *
   * Uses the AudioControl Capacitor plugin to open the native email client
   * with recipient, subject, and body pre-filled using platform-specific APIs.
   *
   * @param config - Email configuration with recipient, subject, and body
   * @returns Promise that resolves when the email client is opened
   */
  async openEmail(config: EmailConfig): Promise<void> {
    const { recipient, subject, body } = config;

    // Validate required parameters
    if (!recipient || recipient.trim() === '') {
      throw new Error('Recipient is required for email');
    }

    try {
      // Use AudioControl plugin to open native email client
      await AudioControl.openEmail({
        recipient: recipient.trim(),
        subject: subject || '',
        body: body || '',
      });
    } catch (error) {
      // Re-throw with more context
      throw new Error(`Failed to open email client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Opens the app store for rating or viewing the app
   *
   * Uses the AudioControl Capacitor plugin to open the native app store
   * using platform-specific store URIs (market:// for Android, App Store for iOS).
   *
   * @param appId - The application package name or store identifier
   * @returns Promise that resolves when the app store is opened
   */
  async openStore(appId: string): Promise<void> {
    if (!appId || appId.trim() === '') {
      throw new Error('App ID is required for store navigation');
    }

    try {
      // Use AudioControl plugin to open native app store
      await AudioControl.openStore({
        appId: appId.trim(),
      });
    } catch (error) {
      // Re-throw with more context
      throw new Error(`Failed to open app store: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Navigates to a specific path within the application
   *
   * Uses the injected navigation callback to perform internal navigation.
   * This allows the adapter to work with any routing mechanism (Next.js router,
   * React Router, etc.) without direct dependencies.
   *
   * @param path - The path to navigate to (e.g., '/saved-mixes', '/help')
   * @returns Promise that resolves when navigation is initiated
   */
  async navigate(path: string): Promise<void> {
    if (!path || path.trim() === '') {
      throw new Error('Path is required for navigation');
    }

    try {
      // Use the injected navigation callback
      this.navigateCallback(path.trim());
    } catch (error) {
      // Re-throw with more context
      throw new Error(`Failed to navigate to ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}