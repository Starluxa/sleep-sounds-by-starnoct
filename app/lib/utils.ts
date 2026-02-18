import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Timer utility functions
export function formatTimerDuration(seconds: number): string {
  if (seconds <= 0) return "0 mins";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    const hourText = hours === 1 ? "1 hour" : `${hours} hours`;
    if (minutes > 0) {
      const minText = minutes === 1 ? "1 min" : `${minutes} mins`;
      return `${hourText} ${minText}`;
    }
    return hourText;
  }

  return minutes === 1 ? "1 min" : `${minutes} mins`;
}

export function formatTimerDisplay(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
export function formatPresetLabel(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}

export function getTimerDefaults(): { [key: string]: number } {
  return {
    'light-drizzle': 30 * 60, // 30 minutes
    'gentle-rain': 45 * 60, // 45 minutes
    'rain-window': 60 * 60, // 1 hour
    'rain-tent': 90 * 60, // 1.5 hours
    'heavy-downpour': 120 * 60, // 2 hours
    'rain-tin-roof': 180 * 60, // 3 hours
    'distant-thunder': 45 * 60,
    'rolling-thunder': 60 * 60,
    'small-stream': 30 * 60,
    'babbling-brook': 45 * 60,
    'gentle-river': 60 * 60,
    'large-waterfall': 120 * 60,
    'gentle-waves': 45 * 60,
    'calm-waves-beach': 60 * 60,
    'distant-seagulls': 30 * 60,
    'deep-ocean': 120 * 60,
    'crashing-waves': 180 * 60,
    'whale-song': 240 * 60,
    'temperate-forest': 60 * 60,
    'wind-pines': 90 * 60,
    'swamp-night': 120 * 60,
    'owl-hooting': 30 * 60,
    'crickets': 60 * 60,
    'cat-purring': 45 * 60,
    'small-campfire': 90 * 60,
    'fireplace': 120 * 60,
    'white-noise': 480 * 60, // 8 hours
    'pink-noise': 480 * 60,
    'blizzard': 180 * 60,
    'coffee-shop': 60 * 60,
    'grandfather-clock': 120 * 60,
  };
}

export function getMaxTimerForSounds(soundIds: string[], soundDefaults?: { [key: string]: number }): number {
  if (soundDefaults) {
    // Use user-set preferences first, fall back to hardcoded defaults
    const maxTime = Math.max(...soundIds.map(id => soundDefaults[id] || getTimerDefaults()[id] || 60 * 60)); // default 1 hour
    return maxTime;
  }
  // Fallback for when no soundDefaults provided
  const defaults = getTimerDefaults();
  const maxTime = Math.max(...soundIds.map(id => defaults[id] || 60 * 60)); // default 1 hour
  return maxTime;
}

// Browser detection utilities
export const isSafari = (): boolean => {
  const ua = navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(ua) && !/CriOS/i.test(ua) && !/FxiOS/i.test(ua);
};

export const isFirefox = (): boolean => {
  return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
};

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

export const isAndroid = (): boolean => {
  return /Android/i.test(navigator.userAgent);
};
