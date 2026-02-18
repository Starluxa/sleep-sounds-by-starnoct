import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.starnoct.sleepsounds',
  appName: 'Sleep Sounds by StarNoct',
  webDir: 'out',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    // Allow mixed content to prevent audio loading errors
    CapacitorHttp: {
      enabled: true,
    }
  },
  server: {
    androidScheme: 'https',
    cleartext: true,
    // Allow navigation to prevent WebView pausing
    allowNavigation: ["*"]
  },
  android: {
    // Append user agent to prevent some "mobile" webview throttles
    appendUserAgent: "StarNoctApp/1.0"
  }
};

export default config;
