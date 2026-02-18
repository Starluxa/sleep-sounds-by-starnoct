package com.starnoct.sleepsounds;

import android.os.Bundle;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Register custom AudioControl plugin BEFORE super.onCreate()
        // This ensures the plugin is registered when the Capacitor bridge initializes
        registerPlugin(AudioControlPlugin.class);
        
        super.onCreate(savedInstanceState);
        
        // Force WebView cache to be disabled
        // This ensures fresh assets are always loaded, preventing stale cache issues
        if (bridge != null && bridge.getWebView() != null) {
            WebSettings settings = bridge.getWebView().getSettings();
            // Disable all caching
            settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
            
            // Clear WebView cache on app start (nuclear option)
            bridge.getWebView().clearCache(true);
        }
    }
}
