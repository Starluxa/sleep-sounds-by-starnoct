/**
 * Settings Orchestrator - Application Layer
 *
 * This class orchestrates the interaction between the SettingsFactory and the ISettingsGateway
 * in the Hexagonal Architecture. It acts as the "Switchboard" for the settings menu, handling
 * application logic such as determining what action to take when a user clicks a settings item.
 *
 * The Orchestrator coordinates domain entities and external services through ports (interfaces),
 * maintaining separation of concerns and keeping the core domain pure and platform-agnostic.
 *
 * Application Layer: Orchestration (How business operations are coordinated)
 * - Pure TypeScript with no framework dependencies
 * - Platform-agnostic business logic coordination
 * - Dependency injection for testability and modularity
 * - Handles conditional logic based on domain entity properties
 */

import {
  ISettingsGateway,
  EmailConfig,
} from './ISettingsGateway';
import {
  SettingsFactory,
  PlatformContext,
} from './SettingsFactory';
import {
  ISettingsMenu,
  ISettingsItem,
  SettingsActionType,
} from './types';

/**
 * SettingsOrchestrator - Coordinates settings menu operations
 *
 * This orchestrator implements the application logic for settings menu interactions.
 * It uses dependency injection to receive the gateway and factory, ensuring loose coupling
 * and adherence to the Dependency Inversion Principle.
 *
 * Key responsibilities:
 * - Retrieve platform-appropriate menus from the factory
 * - Handle user interactions with conditional logic based on item action types
 * - Coordinate external actions through the gateway port
 */
export class SettingsOrchestrator {
  /**
   * Constructor with dependency injection
   *
   * @param gateway - The gateway port for external actions
   * @param factory - The factory for creating domain entities
   */
  constructor(
    private readonly gateway: ISettingsGateway,
    private readonly factory: typeof SettingsFactory,
  ) {}

  /**
   * Retrieves a settings menu for the specified platform
   *
   * This method delegates to the factory to create a platform-appropriate menu,
   * maintaining separation between orchestration and entity creation.
   *
   * @param platform - The platform context (web, android, ios)
   * @returns A settings menu with platform-specific items
   */
  getMenu(platform: PlatformContext): ISettingsMenu {
    return this.factory.createMenu(platform);
  }

  /**
   * Handles a user click on a settings item
   *
   * This method implements the core orchestration logic, determining the appropriate
   * action based on the item's action type and coordinating with the gateway.
   * It handles conditional logic for different action types while keeping the
   * domain logic centralized and platform-agnostic.
   *
   * @param item - The settings item that was clicked
   * @returns Promise that resolves when the action is completed
   */
  async handleItemClick(item: ISettingsItem): Promise<void> {
    if (!item.actionType || !item.action) {
      // Item has no action, nothing to do
      return;
    }

    switch (item.actionType) {
      case SettingsActionType.EMAIL_FEEDBACK:
        await this.handleEmailFeedback(item);
        break;
      case SettingsActionType.RATE_APP:
        await this.handleRateApp(item);
        break;
      case SettingsActionType.INTERNAL_NAV:
        await this.handleInternalNavigation(item);
        break;
      default:
        // Unknown action type, ignore
        break;
    }
  }

  /**
   * Handles email feedback action
   *
   * Parses the mailto: URI from the item action to extract email configuration
   * and delegates to the gateway to open the email client.
   *
   * @param item - The settings item with EMAIL_FEEDBACK action
   * @private
   */
  private async handleEmailFeedback(item: ISettingsItem): Promise<void> {
    const config = this.parseEmailConfig(item.action!);
    if (config) {
      await this.gateway.openEmail(config);
    }
  }

  /**
   * Handles rate app action
   *
   * Extracts the app ID from the store URI in the item action
   * and delegates to the gateway to open the app store.
   *
   * @param item - The settings item with RATE_APP action
   * @private
   */
  private async handleRateApp(item: ISettingsItem): Promise<void> {
    const appId = this.extractAppId(item.action!);
    if (appId) {
      await this.gateway.openStore(appId);
    }
  }

  /**
   * Handles internal navigation action
   *
   * Uses the path from the item action and delegates to the gateway
   * to perform navigation within the application.
   *
   * @param item - The settings item with INTERNAL_NAV action
   * @private
   */
  private async handleInternalNavigation(item: ISettingsItem): Promise<void> {
    await this.gateway.navigate(item.action!);
  }

  /**
   * Parses email configuration from a mailto: URI
   *
   * Extracts recipient, subject, and body from a mailto: link.
   * Handles URL decoding for subject and body parameters.
   *
   * @param mailtoUri - The mailto: URI to parse
   * @returns EmailConfig if parsing succeeds, null otherwise
   * @private
   */
  private parseEmailConfig(mailtoUri: string): EmailConfig | null {
    try {
      if (!mailtoUri.startsWith('mailto:')) {
        return null;
      }

      const url = new URL(mailtoUri);
      const recipient = url.pathname;
      const subject = url.searchParams.get('subject') || '';
      const body = url.searchParams.get('body') || '';

      return {
        recipient: decodeURIComponent(recipient),
        subject: decodeURIComponent(subject),
        body: decodeURIComponent(body),
      };
    } catch {
      // Invalid URI format
      return null;
    }
  }

  /**
   * Extracts app ID from a store URI
   *
   * Parses Android market:// URIs and iOS App Store URLs to extract
   * the application identifier (package name or app store ID).
   *
   * @param storeUri - The store URI to parse
   * @returns App ID if extraction succeeds, null otherwise
   * @private
   */
  private extractAppId(storeUri: string): string | null {
    try {
      const url = new URL(storeUri);

      // Android: market://details?id=com.example.app
      if (url.protocol === 'market:') {
        return url.searchParams.get('id');
      }

      // iOS: https://apps.apple.com/app/id1234567890
      if (url.hostname === 'apps.apple.com' && url.pathname.startsWith('/app/')) {
        const match = url.pathname.match(/^\/app\/(?:[^\/]+\/)?(\d+)$/);
        return match ? match[1] : null;
      }

      // Fallback: return the full URI if it looks like an ID
      return storeUri;
    } catch {
      // Invalid URI format
      return null;
    }
  }
}