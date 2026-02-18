import { CardSize } from '@/contexts/accessibility-context';

/**
 * Card size configurations for accessibility
 * Uses image aspect ratio of 0.69 (2:3 portrait)
 */
export const CARD_SIZE_CONFIG = {
  small: {
    // Compact view - fits more cards on screen
    containerClass: 'h-24', // 96px height
    width: 66, // 96 * 0.69 = ~66px
    // Slightly smaller icon helps keep 3-up mobile layouts readable
    iconSize: 'text-lg',
    titleSize: 'text-xs',
    countSize: 'text-xs',
    padding: 'p-2',
  },
  medium: {
    // Default view - balanced
    containerClass: 'h-32', // 128px height
    width: 88, // 128 * 0.69 = ~88px
    iconSize: 'text-3xl',
    titleSize: 'text-sm',
    countSize: 'text-sm',
    padding: 'p-3',
  },
  large: {
    // Accessible view - easier to read for older users
    containerClass: 'h-40', // 160px height
    width: 110, // 160 * 0.69 = ~110px
    iconSize: 'text-4xl',
    titleSize: 'text-base',
    countSize: 'text-base',
    padding: 'p-4',
  },
} as const;

/**
 * Get card size configuration
 */
export function getCardSizeConfig(size: CardSize) {
  return CARD_SIZE_CONFIG[size];
}

/**
 * Grid column classes for responsive layouts
 */
export const GRID_COLUMNS = {
  // Mobile-first layout:
  // - small: prefer 3-up on typical phones, but fall back to 2-up on ultra-narrow screens
  // - medium: prefer 2-up on typical phones, but fall back to 1-up on ultra-narrow screens
  // - large: 1-up on phones
  //
  // NOTE: `min-[360px]` is an arbitrary Tailwind breakpoint that provides a
  // best-practice readability fallback for extremely small devices.
  small: 'grid-cols-2 min-[360px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7',
  medium: 'grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  large: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
} as const;

/**
 * Get responsive grid columns for card size
 */
export function getGridColumns(size: CardSize) {
  return GRID_COLUMNS[size];
}
