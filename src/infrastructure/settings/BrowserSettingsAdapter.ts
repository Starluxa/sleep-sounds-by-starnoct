/**
 * Browser Settings Adapter - Infrastructure Layer
 *
 * This adapter implements the ISettingsGateway port for web browsers.
 * It provides concrete implementations for opening email clients, app stores,
 * and navigating within the application using standard browser APIs.
 *
 * Infrastructure Layer: Mechanism (How external actions are performed)
 * - Uses browser-specific APIs (window.location.href, window.open)
 * - Handles platform-specific implementation details
 * - Adapts browser APIs to the domain interface
 */

import { ISettingsGateway, EmailConfig } from '../../core/settings/ISettingsGateway';

/**
 * BrowserSettingsAdapter - Web browser implementation of ISettingsGateway
 *
 * This adapter uses standard browser APIs to perform external actions:
 * - openEmail: Uses mailto: scheme via window.location.href
 * - openStore: Uses window.open() to open app store in new tab
 * - navigate: Uses window.location.href for client-side navigation
 *
 * The adapter remains in the Infrastructure layer and implements the Port
 * defined in the Domain layer, ensuring the Domain remains platform-agnostic.
 */
export class BrowserSettingsAdapter implements ISettingsGateway {
  /**
   * Opens the email client with pre-filled configuration
   *
   * Uses the mailto: URI scheme to open the default email client
   * with recipient, subject, and body pre-filled.
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

    // Construct mailto URI with encoded parameters
    const subjectEncoded = encodeURIComponent(subject || '');
    const bodyEncoded = encodeURIComponent(body || '');
    const mailtoUri = `mailto:${recipient}?subject=${subjectEncoded}&body=${bodyEncoded}`;

    // Use window.location.href to trigger email client
    // This is more reliable than window.open for mailto links
    window.location.href = mailtoUri;
  }

  /**
   * Opens the app store for rating or viewing the app
   *
   * For web browsers, this opens the app store URL in a new tab/window.
   * The appId parameter should be the full store URL for web access.
   *
   * @param appId - The app store URL or identifier
   * @returns Promise that resolves when the app store is opened
   */
  async openStore(appId: string): Promise<void> {
    if (!appId || appId.trim() === '') {
      throw new Error('App ID/URL is required for store navigation');
    }

    // For web browsers, assume appId is a full URL
    // Open in new tab to avoid navigating away from the app
    const storeWindow = window.open(appId, '_blank', 'noopener,noreferrer');

    // Check if popup was blocked
    if (!storeWindow) {
      throw new Error('Failed to open app store - popup may be blocked');
    }
  }

  /**
   * Navigates to a specific path within the application
   *
   * Uses window.location.href for navigation. This works for both
   * client-side routing (SPA) and server-side navigation.
   *
   * @param path - The path to navigate to (e.g., '/saved-mixes', '/help')
   * @returns Promise that resolves when navigation is initiated
   */
  async navigate(path: string): Promise<void> {
    if (!path || path.trim() === '') {
      throw new Error('Path is required for navigation');
    }

    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Use window.location.href for navigation
    // This works for both Next.js routing and direct URL changes
    window.location.href = normalizedPath;
  }
}