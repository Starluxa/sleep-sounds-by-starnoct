/**
 * Settings Factory - Domain Layer
 * 
 * This factory creates and configures settings items based on the platform context.
 * It remains in the Domain layer by using pure TypeScript and avoiding any framework
 * or infrastructure dependencies.
 * 
 * The factory uses the PlatformContext to determine which settings items should be
 * visible on each platform (Web, Android, iOS) and includes platform-specific
 * metadata without leaking implementation details.
 * 
 * Domain Layer: Policy (What settings items to show and how to configure them)
 * - Pure TypeScript with no framework dependencies
 * - Platform-agnostic business logic
 * - Centralized configuration rules
 */

import {
  ISettingsItem,
  ISettingsSection,
  ISettingsMenu,
  SettingsMenuItemType,
  SettingsActionType,
} from './types';

// ============================================================================
// PLATFORM CONTEXT
// ============================================================================

/**
 * PlatformContext - Represents the runtime platform environment
 * 
 * This type defines the different platforms the application can run on.
 * It's used by the factory to determine which settings items should be
 * visible and how they should be configured.
 * 
 * Note: This is a pure domain type. The actual platform detection
 * happens in the infrastructure layer (adapters).
 */
export type PlatformContext = 'web' | 'android' | 'ios';

// ============================================================================
// PLATFORM-SPECIFIC METADATA
// ============================================================================

/**
 * PlatformMetadata - Platform-specific configuration data
 * 
 * This interface defines the structure for platform-specific metadata
 * that can be included in settings items. The metadata is pure data
 * and doesn't contain any implementation logic.
 */
export interface PlatformMetadata {
  /** Platform-specific action URI (e.g., market:// for Android) */
  readonly actionUri?: string;
  
  /** Platform-specific email subject for feedback */
  readonly emailSubject?: string;
  
  /** Platform-specific app store ID */
  readonly appStoreId?: string;
  
  /** Platform-specific package name */
  readonly packageName?: string;
  
  /** Additional platform-specific data */
  readonly [key: string]: unknown;
}

// ============================================================================
// SETTINGS FACTORY
// ============================================================================

/**
 * SettingsFactory - Factory for creating platform-aware settings items
 * 
 * This factory is responsible for creating and configuring settings items
 * based on the platform context. It encapsulates the business rules for
 * which settings should be visible on each platform and how they should
 * be configured.
 * 
 * The factory remains in the Domain layer by:
 * 1. Using only pure TypeScript (no framework imports)
 * 2. Accepting platform context as a parameter (not detecting it internally)
 * 3. Returning domain interfaces (ISettingsItem, ISettingsSection, ISettingsMenu)
 * 4. Including platform-specific data as metadata (not implementation logic)
 */
export class SettingsFactory {
  /**
   * Creates a settings menu for the specified platform
   * 
   * @param platform - The platform context (web, android, ios)
   * @returns ISettingsMenu with platform-appropriate items
   */
  static createMenu(platform: PlatformContext): ISettingsMenu {
    const sections = this.createSections(platform);
    
    return {
      id: 'settings-menu',
      sections,
      version: 1,
      hasSections: () => sections.length > 0,
      getSectionCount: () => sections.length,
      getActiveSectionCount: () => sections.filter(s => s.isActive()).length,
      getItemCount: () => sections.reduce((sum, section) => sum + section.getItemCount(), 0),
      getActiveItemCount: () => sections.reduce((sum, section) => sum + section.getActiveItemCount(), 0),
    };
  }

  /**
   * Creates settings sections for the specified platform
   * 
   * @param platform - The platform context
   * @returns Array of ISettingsSection objects
   */
  private static createSections(platform: PlatformContext): ISettingsSection[] {
    return [
      this.createAccountSection(platform),
      this.createPreferencesSection(platform),
      this.createSupportSection(platform),
      this.createAboutSection(platform),
    ].filter(section => section.visible);
  }

  /**
   * Creates the Account section
   */
  private static createAccountSection(platform: PlatformContext): ISettingsSection {
    const items: ISettingsItem[] = [
      {
        id: 'saved-mixes',
        type: SettingsMenuItemType.NAVIGATION,
        label: 'Saved Sound Mixes',
        description: 'View and manage your saved sound combinations',
        icon: 'folder',
        action: '/saved-mixes',
        actionType: SettingsActionType.INTERNAL_NAV,
        enabled: true,
        visible: true,
        version: 1,
        isActive: () => true,
        hasValue: () => false,
        hasOptions: () => false,
        hasRange: () => false,
        hasAction: () => true,
        hasIcon: () => true,
        hasDescription: () => true,
      },
      {
        id: 'export-mixes',
        type: SettingsMenuItemType.BUTTON,
        label: 'Export Mixes',
        description: 'Export your saved mixes as a backup',
        icon: 'download',
        action: 'export-mixes',
        actionType: SettingsActionType.INTERNAL_NAV,
        enabled: true,
        visible: true,
        version: 1,
        isActive: () => true,
        hasValue: () => false,
        hasOptions: () => false,
        hasRange: () => false,
        hasAction: () => true,
        hasIcon: () => true,
        hasDescription: () => true,
      },
    ];

    return {
      id: 'account',
      title: 'Account',
      description: 'Manage your saved content',
      items,
      enabled: true,
      visible: true,
      version: 1,
      isActive: () => true,
      hasItems: () => items.length > 0,
      hasDescription: () => true,
      getItemCount: () => items.length,
      getActiveItemCount: () => items.filter(item => item.isActive()).length,
    };
  }

  /**
   * Creates the Preferences section
   */
  private static createPreferencesSection(platform: PlatformContext): ISettingsSection {
    const items: ISettingsItem[] = [
      {
        id: 'sound-volume',
        type: SettingsMenuItemType.SLIDER,
        label: 'Sound Volume',
        description: 'Adjust the master volume for all sounds',
        icon: 'volume-high',
        value: 75,
        min: 0,
        max: 100,
        step: 1,
        enabled: true,
        visible: true,
        version: 1,
        isActive: () => true,
        hasValue: () => true,
        hasOptions: () => false,
        hasRange: () => true,
        hasAction: () => false,
        hasIcon: () => true,
        hasDescription: () => true,
      },
      {
        id: 'timer-duration',
        type: SettingsMenuItemType.SELECT,
        label: 'Default Timer Duration',
        description: 'Set the default duration for sleep timer',
        icon: 'timer',
        value: '30',
        options: ['15', '30', '45', '60', '90', '120'],
        enabled: true,
        visible: true,
        version: 1,
        isActive: () => true,
        hasValue: () => true,
        hasOptions: () => true,
        hasRange: () => false,
        hasAction: () => false,
        hasIcon: () => true,
        hasDescription: () => true,
      },
      {
        id: 'auto-play',
        type: SettingsMenuItemType.TOGGLE,
        label: 'Auto-play on Launch',
        description: 'Automatically start playing when the app opens',
        icon: 'play-circle',
        value: false,
        enabled: true,
        visible: true,
        version: 1,
        isActive: () => true,
        hasValue: () => true,
        hasOptions: () => false,
        hasRange: () => false,
        hasAction: () => false,
        hasIcon: () => true,
        hasDescription: () => true,
      },
    ];

    return {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your listening experience',
      items,
      enabled: true,
      visible: true,
      version: 1,
      isActive: () => true,
      hasItems: () => items.length > 0,
      hasDescription: () => true,
      getItemCount: () => items.length,
      getActiveItemCount: () => items.filter(item => item.isActive()).length,
    };
  }

  /**
   * Creates the Support section
   * 
   * This section demonstrates platform-specific filtering and metadata.
   * Some items are only visible on specific platforms.
   */
  private static createSupportSection(platform: PlatformContext): ISettingsSection {
    const items: ISettingsItem[] = [
      // Rate App - Only visible on native platforms (Android/iOS)
      {
        id: 'rate-app',
        type: SettingsMenuItemType.BUTTON,
        label: 'Rate the App',
        description: 'Leave a review on the app store',
        icon: 'star',
        action: this.getRateAppAction(platform),
        actionType: SettingsActionType.RATE_APP,
        enabled: true,
        visible: platform !== 'web', // Only show on Android and iOS
        version: 1,
        isActive: () => true,
        hasValue: () => false,
        hasOptions: () => false,
        hasRange: () => false,
        hasAction: () => true,
        hasIcon: () => true,
        hasDescription: () => true,
      },
      // Feedback - Available on all platforms
      // TEMPORARILY DISABLED: "Send Feedback" button hidden from Settings menu
      // To re-enable, uncomment the following item configuration:
      // {
      //   id: 'feedback',
      //   type: SettingsMenuItemType.BUTTON,
      //   label: 'Send Feedback',
      //   description: 'Share your thoughts and suggestions',
      //   icon: 'mail',
      //   action: this.getFeedbackAction(platform),
      //   actionType: SettingsActionType.EMAIL_FEEDBACK,
      //   enabled: true,
      //   visible: true,
      //   version: 1,
      //   isActive: () => true,
      //   hasValue: () => false,
      //   hasOptions: () => false,
      //   hasRange: () => false,
      //   hasAction: () => true,
      //   hasIcon: () => true,
      //   hasDescription: () => true,
      // },
      // Help - Available on all platforms
      {
        id: 'help',
        type: SettingsMenuItemType.NAVIGATION,
        label: 'Help & FAQ',
        description: 'View frequently asked questions',
        icon: 'help-circle',
        action: '/help',
        actionType: SettingsActionType.INTERNAL_NAV,
        enabled: true,
        visible: true,
        version: 1,
        isActive: () => true,
        hasValue: () => false,
        hasOptions: () => false,
        hasRange: () => false,
        hasAction: () => true,
        hasIcon: () => true,
        hasDescription: () => true,
      },
    ].filter(item => item.visible); // Filter out items not visible on this platform

    return {
      id: 'support',
      title: 'Support',
      description: 'Get help and provide feedback',
      items,
      enabled: true,
      visible: items.length > 0, // Hide section if no items are visible
      version: 1,
      isActive: () => items.length > 0,
      hasItems: () => items.length > 0,
      hasDescription: () => true,
      getItemCount: () => items.length,
      getActiveItemCount: () => items.filter(item => item.isActive()).length,
    };
  }

  /**
   * Creates the About section
   */
  private static createAboutSection(platform: PlatformContext): ISettingsSection {
    const items: ISettingsItem[] = [
      {
        id: 'version',
        type: SettingsMenuItemType.BUTTON,
        label: 'App Version',
        description: 'Current version: 1.0.0',
        icon: 'information',
        action: 'version-info',
        actionType: SettingsActionType.INTERNAL_NAV,
        enabled: true,
        visible: true,
        version: 1,
        isActive: () => true,
        hasValue: () => false,
        hasOptions: () => false,
        hasRange: () => false,
        hasAction: () => true,
        hasIcon: () => true,
        hasDescription: () => true,
      },
      {
        id: 'privacy',
        type: SettingsMenuItemType.NAVIGATION,
        label: 'Privacy Policy',
        description: 'Read our privacy policy',
        icon: 'shield-check',
        action: '/privacy-policy',
        actionType: SettingsActionType.INTERNAL_NAV,
        enabled: true,
        visible: true,
        version: 1,
        isActive: () => true,
        hasValue: () => false,
        hasOptions: () => false,
        hasRange: () => false,
        hasAction: () => true,
        hasIcon: () => true,
        hasDescription: () => true,
      },
      {
        id: 'terms',
        type: SettingsMenuItemType.NAVIGATION,
        label: 'Terms of Service',
        description: 'Read our terms of service',
        icon: 'document-text',
        action: '/terms-of-service',
        actionType: SettingsActionType.INTERNAL_NAV,
        enabled: true,
        visible: true,
        version: 1,
        isActive: () => true,
        hasValue: () => false,
        hasOptions: () => false,
        hasRange: () => false,
        hasAction: () => true,
        hasIcon: () => true,
        hasDescription: () => true,
      },
    ];

    return {
      id: 'about',
      title: 'About',
      description: 'App information and legal documents',
      items,
      enabled: true,
      visible: true,
      version: 1,
      isActive: () => true,
      hasItems: () => items.length > 0,
      hasDescription: () => true,
      getItemCount: () => items.length,
      getActiveItemCount: () => items.filter(item => item.isActive()).length,
    };
  }

  /**
   * Gets the platform-specific action URI for rating the app
   * 
   * This method encapsulates platform-specific metadata without leaking
   * implementation details. The actual URI format is data, not logic.
   * 
   * @param platform - The platform context
   * @returns The action URI for rating the app
   */
  private static getRateAppAction(platform: PlatformContext): string {
    switch (platform) {
      case 'android':
        // Android: market:// URI for Google Play Store
        return 'market://details?id=com.starnoct.sleepsounds';
      case 'ios':
        // iOS: App Store URL (market:// doesn't work on iOS)
        return 'https://apps.apple.com/app/starnoct-sleep-sounds/id1234567890';
      case 'web':
        // Web: Not applicable (item is hidden on web)
        return '';
      default:
        return '';
    }
  }

  /**
   * Gets the platform-specific action for sending feedback
   * 
   * This method encapsulates platform-specific email configuration.
   * The email subject is data, not implementation logic.
   * 
   * @param platform - The platform context
   * @returns The action URI for sending feedback
   */
  private static getFeedbackAction(platform: PlatformContext): string {
    const email = 'starnoctapps@proton.me';
    const subject = encodeURIComponent(this.getFeedbackSubject(platform));
    const body = encodeURIComponent('Please provide your feedback here...');
    
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }

  /**
   * Gets the platform-specific email subject for feedback
   * 
   * @param platform - The platform context
   * @returns The email subject
   */
  private static getFeedbackSubject(platform: PlatformContext): string {
    switch (platform) {
      case 'android':
        return 'StarNoct Sleep Sounds Feedback - Android';
      case 'ios':
        return 'StarNoct Sleep Sounds Feedback - iOS';
      case 'web':
        return 'StarNoct Sleep Sounds Feedback - Web';
      default:
        return 'StarNoct Sleep Sounds Feedback';
    }
  }

  /**
   * Creates a single settings item with platform-specific configuration
   * 
   * This method demonstrates how to create individual items with
   * platform-specific metadata.
   * 
   * @param itemId - The unique identifier for the settings item
   * @param platform - The platform context
   * @returns ISettingsItem with platform-appropriate configuration
   */
  static createItem(itemId: string, platform: PlatformContext): ISettingsItem | null {
    // This is a simplified example. In a real implementation, you might
    // have a registry of item configurations.
    
    const itemConfigs: Record<string, (platform: PlatformContext) => ISettingsItem> = {
      'rate-app': (p) => ({
        id: 'rate-app',
        type: SettingsMenuItemType.BUTTON,
        label: 'Rate the App',
        description: 'Leave a review on the app store',
        icon: 'star',
        action: this.getRateAppAction(p),
        actionType: SettingsActionType.RATE_APP,
        enabled: true,
        visible: p !== 'web',
        version: 1,
        isActive: () => true,
        hasValue: () => false,
        hasOptions: () => false,
        hasRange: () => false,
        hasAction: () => true,
        hasIcon: () => true,
        hasDescription: () => true,
      }),
      'feedback': (p) => ({
        id: 'feedback',
        type: SettingsMenuItemType.BUTTON,
        label: 'Send Feedback',
        description: 'Share your thoughts and suggestions',
        icon: 'mail',
        action: this.getFeedbackAction(p),
        actionType: SettingsActionType.EMAIL_FEEDBACK,
        enabled: true,
        visible: true,
        version: 1,
        isActive: () => true,
        hasValue: () => false,
        hasOptions: () => false,
        hasRange: () => false,
        hasAction: () => true,
        hasIcon: () => true,
        hasDescription: () => true,
      }),
    };

    const config = itemConfigs[itemId];
    return config ? config(platform) : null;
  }

  /**
   * Gets platform-specific metadata for a settings item
   * 
   * This method demonstrates how to extract platform-specific metadata
   * from a settings item. The metadata is pure data and doesn't contain
   * any implementation logic.
   * 
   * @param itemId - The unique identifier for the settings item
   * @param platform - The platform context
   * @returns Platform-specific metadata or null if not applicable
   */
  static getPlatformMetadata(itemId: string, platform: PlatformContext): PlatformMetadata | null {
    const metadataMap: Record<string, Record<PlatformContext, PlatformMetadata>> = {
      'rate-app': {
        android: {
          actionUri: 'market://details?id=com.starnoct.sleepsounds',
          packageName: 'com.starnoct.sleepsounds',
        },
        ios: {
          actionUri: 'https://apps.apple.com/app/starnoct-sleep-sounds/id1234567890',
          appStoreId: '1234567890',
        },
        web: {
          actionUri: '',
        },
      },
      'feedback': {
        android: {
          emailSubject: 'StarNoct Sleep Sounds Feedback - Android',
        },
        ios: {
          emailSubject: 'StarNoct Sleep Sounds Feedback - iOS',
        },
        web: {
          emailSubject: 'StarNoct Sleep Sounds Feedback - Web',
        },
      },
    };

    return metadataMap[itemId]?.[platform] || null;
  }
}
