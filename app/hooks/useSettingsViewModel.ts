/**
 * Settings View Model Hook - Presentation Layer
 *
 * This React hook serves as the View Model for the settings page in the Hexagonal Architecture.
 * It coordinates between the UI (React components) and the application logic (SettingsOrchestrator).
 *
 * The View Model is "dumb" - it only coordinates data flow and user interactions,
 * delegating all business logic to the domain and application layers.
 *
 * Presentation Layer: UI Coordination (React hooks for state and event handling)
 * - React-specific implementation with hooks
 * - Platform-aware dependency injection
 * - Zero business logic - pure coordination
 * - Proper TypeScript typing for type safety
 */

import { Capacitor } from '@capacitor/core';
import { useInternalNavigation } from '../../src/infrastructure/settings/InternalNavAdapter';
import { BrowserSettingsAdapter } from '../../src/infrastructure/settings/BrowserSettingsAdapter';
import { NativeSettingsAdapter } from '../../src/infrastructure/settings/NativeSettingsAdapter';
import { SettingsOrchestrator } from '../../src/core/settings/SettingsOrchestrator';
import { SettingsFactory, PlatformContext } from '../../src/core/settings/SettingsFactory';
import { ISettingsMenu, ISettingsItem } from '../../src/core/settings/types';

/**
 * useSettingsViewModel - React hook for settings page coordination
 *
 * This hook encapsulates the coordination logic between the settings UI and the
 * settings orchestrator. It handles platform detection, dependency injection,
 * and provides the necessary data and handlers to the UI components.
 *
 * The hook follows React best practices:
 * - Uses custom hooks for dependency injection
 * - Provides stable references for menu data
 * - Handles async operations properly
 * - Maintains separation of concerns
 *
 * @returns Object containing menu data and interaction handlers
 */
export function useSettingsViewModel(): {
  menu: ISettingsMenu;
  onItemClick: (item: ISettingsItem) => Promise<void>;
} {
  // Determine the current platform using Capacitor
  const platform = Capacitor.getPlatform() as PlatformContext;

  // Get navigation callback for internal navigation
  const navigate = useInternalNavigation();

  // Instantiate the appropriate gateway adapter based on platform
  // This follows the Dependency Inversion Principle - the hook depends on abstractions
  const gateway = platform === 'web'
    ? new BrowserSettingsAdapter()
    : new NativeSettingsAdapter(navigate);

  // Instantiate the orchestrator with dependency injection
  // The orchestrator coordinates domain logic and external services
  const orchestrator = new SettingsOrchestrator(gateway, SettingsFactory);

  // Get the platform-appropriate settings menu
  // The menu is computed once per render, but remains stable if platform doesn't change
  const menu = orchestrator.getMenu(platform);

  // Handler for item clicks - delegates to the orchestrator
  // This maintains the "dumb" View Model pattern - no logic, just coordination
  const onItemClick = async (item: ISettingsItem): Promise<void> => {
    await orchestrator.handleItemClick(item);
  };

  // Return the coordinated data and handlers
  return {
    menu,
    onItemClick,
  };
}