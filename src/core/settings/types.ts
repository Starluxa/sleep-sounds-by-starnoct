/**
 * Pure Domain Types for Settings Menu
 * 
 * This file defines the core domain entities for the settings menu.
 * It is completely platform-agnostic and has no dependencies on React,
 * Capacitor, or any other framework.
 * 
 * Domain Layer: Policy (What a settings item is)
 * - Entities have identity and lifecycle
 * - Value Objects are immutable and defined by their attributes
 * - Domain invariants are enforced within entities
 * - All business rules are centralized here
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * SettingsActionType - Type of action to perform when a settings item is selected
 * Enum: Defines specific action types for settings items
 */
export enum SettingsActionType {
  EMAIL_FEEDBACK = 'EMAIL_FEEDBACK',    // Opens email client for feedback
  RATE_APP = 'RATE_APP',                // Opens app store for rating
  INTERNAL_NAV = 'INTERNAL_NAV',        // Navigates to internal screen
}

/**
 * SettingsMenuItemType - Type of settings menu item
 * Enum: Defines the visual and behavioral type of a settings item
 */
export enum SettingsMenuItemType {
  NAVIGATION = 'navigation',      // Navigates to another page/screen
  TOGGLE = 'toggle',              // Boolean toggle switch
  SELECT = 'select',              // Dropdown/select option
  SLIDER = 'slider',              // Range slider
  BUTTON = 'button',              // Action button
  LINK = 'link',                  // External link
  SECTION = 'section',            // Section header/group
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * ISettingsItem - Interface for a settings menu item
 * Interface: Defines the contract for settings items
 * 
 * This interface represents a pure domain entity that can be implemented
 * by various concrete classes. It maintains the "Pure Domain" requirement
 * by being platform-agnostic and framework-independent.
 */
export interface ISettingsItem {
  /** Unique identifier for the settings item */
  readonly id: string;
  
  /** Type of the settings item */
  readonly type: SettingsMenuItemType;
  
  /** Display label for the settings item */
  readonly label: string;
  
  /** Optional description or help text */
  readonly description?: string;
  
  /** Optional icon identifier */
  readonly icon?: string;
  
  /** Optional action to perform when item is selected */
  readonly action?: string;
  
  /** Optional action type for specific actions */
  readonly actionType?: SettingsActionType;
  
  /** Current value of the settings item (for toggle, select, slider) */
  readonly value?: string | number | boolean;
  
  /** Available options for select type items */
  readonly options?: string[];
  
  /** Minimum value for slider type items */
  readonly min?: number;
  
  /** Maximum value for slider type items */
  readonly max?: number;
  
  /** Step value for slider type items */
  readonly step?: number;
  
  /** Whether the item is enabled */
  readonly enabled: boolean;
  
  /** Whether the item is visible */
  readonly visible: boolean;
  
  /** Version number for optimistic locking */
  readonly version: number;
  
  /** Check if the item is currently active (enabled and visible) */
  isActive(): boolean;
  
  /** Check if the item has a value */
  hasValue(): boolean;
  
  /** Check if the item has options */
  hasOptions(): boolean;
  
  /** Check if the item has a range (min/max) */
  hasRange(): boolean;
  
  /** Check if the item has an action */
  hasAction(): boolean;
  
  /** Check if the item has an icon */
  hasIcon(): boolean;
  
  /** Check if the item has a description */
  hasDescription(): boolean;
}

/**
 * ISettingsSection - Interface for a settings menu section
 * Interface: Defines the contract for settings sections
 */
export interface ISettingsSection {
  /** Unique identifier for the section */
  readonly id: string;
  
  /** Display title for the section */
  readonly title: string;
  
  /** Optional description for the section */
  readonly description?: string;
  
  /** Items contained in this section */
  readonly items: ISettingsItem[];
  
  /** Whether the section is enabled */
  readonly enabled: boolean;
  
  /** Whether the section is visible */
  readonly visible: boolean;
  
  /** Version number for optimistic locking */
  readonly version: number;
  
  /** Check if the section is currently active (enabled and visible) */
  isActive(): boolean;
  
  /** Check if the section has items */
  hasItems(): boolean;
  
  /** Check if the section has a description */
  hasDescription(): boolean;
  
  /** Get the count of items in the section */
  getItemCount(): number;
  
  /** Get the count of active items in the section */
  getActiveItemCount(): number;
}

/**
 * ISettingsMenu - Interface for the entire settings menu
 * Interface: Defines the contract for the settings menu root aggregate
 */
export interface ISettingsMenu {
  /** Unique identifier for the menu */
  readonly id: string;
  
  /** Sections contained in this menu */
  readonly sections: ISettingsSection[];
  
  /** Version number for optimistic locking */
  readonly version: number;
  
  /** Check if menu has sections */
  hasSections(): boolean;
  
  /** Get the count of sections in the menu */
  getSectionCount(): number;
  
  /** Get the count of active sections in the menu */
  getActiveSectionCount(): number;
  
  /** Get the total count of items in the menu */
  getItemCount(): number;
  
  /** Get the total count of active items in the menu */
  getActiveItemCount(): number;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a SettingsActionType
 */
export function isSettingsActionType(value: unknown): value is SettingsActionType {
  return Object.values(SettingsActionType).includes(value as SettingsActionType);
}

/**
 * Type guard to check if a value is a SettingsMenuItemType
 */
export function isSettingsMenuItemType(value: unknown): value is SettingsMenuItemType {
  return Object.values(SettingsMenuItemType).includes(value as SettingsMenuItemType);
}

/**
 * Type guard to check if a value implements ISettingsItem
 */
export function isISettingsItem(value: unknown): value is ISettingsItem {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    'type' in value &&
    'label' in value &&
    'enabled' in value &&
    'visible' in value &&
    'version' in value &&
    typeof (value as ISettingsItem).isActive === 'function' &&
    typeof (value as ISettingsItem).hasValue === 'function' &&
    typeof (value as ISettingsItem).hasOptions === 'function' &&
    typeof (value as ISettingsItem).hasRange === 'function' &&
    typeof (value as ISettingsItem).hasAction === 'function' &&
    typeof (value as ISettingsItem).hasIcon === 'function' &&
    typeof (value as ISettingsItem).hasDescription === 'function'
  );
}

/**
 * Type guard to check if a value implements ISettingsSection
 */
export function isISettingsSection(value: unknown): value is ISettingsSection {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    'title' in value &&
    'items' in value &&
    'enabled' in value &&
    'visible' in value &&
    'version' in value &&
    typeof (value as ISettingsSection).isActive === 'function' &&
    typeof (value as ISettingsSection).hasItems === 'function' &&
    typeof (value as ISettingsSection).hasDescription === 'function' &&
    typeof (value as ISettingsSection).getItemCount === 'function' &&
    typeof (value as ISettingsSection).getActiveItemCount === 'function'
  );
}

/**
 * Type guard to check if a value implements ISettingsMenu
 */
export function isISettingsMenu(value: unknown): value is ISettingsMenu {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    'sections' in value &&
    'version' in value &&
    typeof (value as ISettingsMenu).hasSections === 'function' &&
    typeof (value as ISettingsMenu).getSectionCount === 'function' &&
    typeof (value as ISettingsMenu).getActiveSectionCount === 'function' &&
    typeof (value as ISettingsMenu).getItemCount === 'function' &&
    typeof (value as ISettingsMenu).getActiveItemCount === 'function'
  );
}
