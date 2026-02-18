export const APP_VERSION = '1.0.0';

/**
 * The public URL where the app is hosted.
 * Used for generating share links and deep linking.
 */
export const APP_URL = 'https://starnoct.com';

export type OptimizationGuide = {
  title: string;
  steps: string[];
};

/**
 * Device-specific battery optimization guidance.
 * Key can be a full model string or a stable prefix.
 */
export const DEVICE_GUIDES: Record<string, OptimizationGuide> = {
  'SM-G99': {
    title: 'Samsung Galaxy (S series) - Extra Battery Steps',
    steps: [
      'Settings → Apps → (this app) → Battery → Allow background activity',
      'Settings → Battery and device care → Battery → Background usage limits → Put unused apps to sleep (disable for this app)',
      'Settings → Battery → More battery settings → Adaptive battery (consider disabling for uninterrupted playback)',
    ],
  },
  Pixel: {
    title: 'Google Pixel - Adaptive Battery / Restricted mode',
    steps: [
      'Settings → Apps → (this app) → Battery → set to Unrestricted',
      'Settings → Battery → Battery Saver (ensure it is OFF while using background playback)',
    ],
  },
};
