package com.starnoct.sleepsounds;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * SleepTimerReceiver handles atomic wakeup events from the Android AlarmManager.
 * Its sole responsibility is to receive the "STOP" intent and stop the AudioService.
 * 
 * IMPORTANT: This receiver implements a STOP-ONLY policy to comply with Android 15
 * background service restrictions. It will NOT start a new service instance.
 * Instead, it safely stops any existing AudioService instance using stopService().
 * 
 * This ensures that the app can execute stop logic even if restricted by the system,
 * without violating Android 15's constraints on starting foreground services from
 * BroadcastReceiver contexts.
 */
public class SleepTimerReceiver extends BroadcastReceiver {
    private static final String TAG = "SleepTimerReceiver";
    public static final String ACTION_STOP_SLEEP_TIMER = "com.starnoct.sleepsounds.ACTION_STOP_SLEEP_TIMER";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !ACTION_STOP_SLEEP_TIMER.equals(intent.getAction())) {
            return;
        }

        // Check if AudioService is currently running using static instance reference
        AudioService serviceInstance = AudioService.getInstance();
        if (serviceInstance == null) {
            return;
        }

        // STOP-ONLY POLICY: Use stopService() to stop the existing service
        // This does NOT start a new service instance, complying with Android 15 restrictions
        Intent serviceIntent = new Intent(context, AudioService.class);
        serviceIntent.setAction(AudioService.ACTION_FADE_OUT_STOP);
        serviceIntent.putExtra("SOURCE", "SleepTimerReceiver");

        try {
            // Use stopService() instead of startForegroundService()
            // This safely stops the existing service without spawning a new one
            context.stopService(serviceIntent);
        } catch (Exception e) {
            // Silently ignore: service may have already been stopped or is in teardown
            // This is non-critical as the timer's purpose (stopping audio) is fulfilled
        }
    }
}
