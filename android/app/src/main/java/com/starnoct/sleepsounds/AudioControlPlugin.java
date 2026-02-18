package com.starnoct.sleepsounds;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;
import android.content.Intent;
import android.content.Context;
import android.content.SharedPreferences;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.os.Build;
import android.provider.Settings;
import android.net.Uri;
import androidx.core.content.ContextCompat;

@CapacitorPlugin(name = "AudioControl")
public class AudioControlPlugin extends Plugin {
    private static AudioControlPlugin instance;

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    /**
     * Static helper to notify the JS side when a sound is terminated.
     * This is called by the AudioService when focus is lost or a track finishes.
     */
    public static void onPlaybackTerminated(String soundId) {
        if (instance != null) {
            JSObject ret = new JSObject();
            ret.put("soundId", soundId);
            instance.notifyListeners("playback_terminated", ret);
        }
    }

    @PluginMethod
    public void play(PluginCall call) {
        String soundId = call.getString("soundId");
        String url = call.getString("url");
        Float volume = call.getFloat("volume", 1.0f);

        Intent intent = new Intent(getContext(), AudioService.class);
        intent.setAction("ACTION_PLAY");
        intent.putExtra("SOUND_ID", soundId);
        intent.putExtra("URL", url);
        intent.putExtra("VOLUME", volume);
        
        ContextCompat.startForegroundService(getContext(), intent);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        String soundId = call.getString("soundId");
        Intent intent = new Intent(getContext(), AudioService.class);
        intent.setAction("ACTION_STOP");
        intent.putExtra("SOUND_ID", soundId);
        getContext().startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void stopAll(PluginCall call) {
        Intent intent = new Intent(getContext(), AudioService.class);
        intent.setAction("ACTION_STOP_ALL");
        getContext().startService(intent);
        
        // If we stop all sounds manually, we should also cancel any pending sleep timer
        cancelSleepTimer();
        
        call.resolve();
    }

    @PluginMethod
    public void setVolume(PluginCall call) {
        String soundId = call.getString("soundId");
        Float volume = call.getFloat("volume", 1.0f);
        
        Intent intent = new Intent(getContext(), AudioService.class);
        intent.setAction("ACTION_SET_VOLUME");
        intent.putExtra("SOUND_ID", soundId);
        intent.putExtra("VOLUME", volume);
        getContext().startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void setSleepTimer(PluginCall call) {
        Long targetTimestamp = call.getLong("targetTimestamp", 0L);
        
        if (targetTimestamp <= 0) {
            cancelSleepTimer();
            call.resolve();
            return;
        }

        SharedPreferences prefs = getContext().getSharedPreferences("AudioPrefs", Context.MODE_PRIVATE);
        prefs.edit().putLong("TIMER_TARGET_MS", targetTimestamp).commit();

        AlarmManager am = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
        
        // Intent to trigger the SleepTimerReceiver
        Intent intent = new Intent(getContext(), SleepTimerReceiver.class);
        intent.setAction(SleepTimerReceiver.ACTION_STOP_SLEEP_TIMER);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            getContext(), 
            0, 
            intent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                // Intent to open the app when the alarm is clicked in the system UI
                Intent showIntent = new Intent(getContext(), MainActivity.class);
                showIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
                PendingIntent showPendingIntent = PendingIntent.getActivity(
                    getContext(), 
                    0, 
                    showIntent, 
                    PendingIntent.FLAG_IMMUTABLE
                );

                AlarmManager.AlarmClockInfo info = new AlarmManager.AlarmClockInfo(targetTimestamp, showPendingIntent);
                if (am != null) {
                    am.setAlarmClock(info, pendingIntent);
                }
            } else {
                if (am != null) {
                    am.setExact(AlarmManager.RTC_WAKEUP, targetTimestamp, pendingIntent);
                }
            }
            call.resolve();
        } catch (SecurityException e) {
            call.reject("Permission to schedule exact alarms is missing.");
        } catch (Exception e) {
            call.reject("Failed to schedule SleepTimer: " + e.getMessage());
        }
    }

    @PluginMethod
    public void setAlarmClock(PluginCall call) {
        Long targetTimestamp = call.getLong("targetTimestamp", 0L);
        SharedPreferences prefs = getContext().getSharedPreferences("AudioPrefs", Context.MODE_PRIVATE);

        if (targetTimestamp <= 0) {
            prefs.edit().putLong("ATOMIC_TIMER_TARGET", 0).commit();
            call.resolve();
            return;
        }

        prefs.edit().putLong("ATOMIC_TIMER_TARGET", targetTimestamp).commit();
        call.resolve();
    }

    @PluginMethod
    public void getPersistedTimestamp(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences("AudioPrefs", Context.MODE_PRIVATE);
        long targetMs = prefs.getLong("ATOMIC_TIMER_TARGET", 0);
        JSObject ret = new JSObject();
        ret.put("value", targetMs);
        call.resolve(ret);
    }
     
    private void cancelSleepTimer() {
        SharedPreferences prefs = getContext().getSharedPreferences("AudioPrefs", Context.MODE_PRIVATE);
        prefs.edit().putLong("TIMER_TARGET_MS", 0).commit();

        AlarmManager am = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(getContext(), SleepTimerReceiver.class);
        intent.setAction(SleepTimerReceiver.ACTION_STOP_SLEEP_TIMER);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            getContext(), 
            0, 
            intent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        if (am != null) {
            am.cancel(pendingIntent);
        }
    }
    
    @PluginMethod
    public void getServiceStatus(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences("AudioPrefs", Context.MODE_PRIVATE);
        long targetMs = prefs.getLong("TIMER_TARGET_MS", 0);
        long now = System.currentTimeMillis();

        long secondsRemaining = 0;
        boolean isTimerRunning = false;

        if (targetMs > 0) {
            if (now >= targetMs) {
                secondsRemaining = 0;
                isTimerRunning = false;
            } else {
                secondsRemaining = (targetMs - now) / 1000;
                isTimerRunning = true;
            }
        }

        JSObject ret = new JSObject();
        ret.put("timeLeft", secondsRemaining);
        ret.put("isRunning", isTimerRunning);
        call.resolve(ret);
    }

    @PluginMethod
    public void isIgnoringBatteryOptimizations(PluginCall call) {
        android.os.PowerManager pm = (android.os.PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
        boolean isIgnoring = false;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            isIgnoring = pm.isIgnoringBatteryOptimizations(getContext().getPackageName());
        } else {
            isIgnoring = true; // Older Androids don't have Doze in the same way
        }

        com.getcapacitor.JSObject ret = new com.getcapacitor.JSObject();
        ret.put("value", isIgnoring);
        call.resolve(ret);
    }

    @PluginMethod
    public void checkAlarmPermission(PluginCall call) {
        boolean canSchedule = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager alarmManager = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
            canSchedule = alarmManager.canScheduleExactAlarms();
        }
        JSObject ret = new JSObject();
        ret.put("value", canSchedule);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestAlarmPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void requestIgnoreBatteryOptimization(PluginCall call) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            Intent intent = new Intent(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }

    /**
     * Opens the email client with pre-filled content using Intent Selector.
     * This ensures only email apps are shown in the chooser on Android 15+.
     * 
     * @param call Capacitor plugin call with parameters:
     *             - recipient: Email address to send to
     *             - subject: Email subject
     *             - body: Email body text
     */
    @PluginMethod
    public void openEmail(PluginCall call) {
        String recipient = call.getString("recipient");
        String subject = call.getString("subject");
        String body = call.getString("body");

        if (recipient == null || recipient.isEmpty()) {
            call.reject("Recipient is required");
            return;
        }

        try {
            // Create the selector intent with ACTION_SENDTO and mailto: scheme
            // This restricts the chooser to only show email clients
            Intent selectorIntent = new Intent(Intent.ACTION_SENDTO);
            selectorIntent.setData(Uri.parse("mailto:" + recipient));
            
            // Create the main intent with ACTION_SEND
            // This allows us to add extras like subject and body
            Intent mainIntent = new Intent(Intent.ACTION_SEND);
            mainIntent.setType("text/plain");
            mainIntent.putExtra(Intent.EXTRA_EMAIL, new String[]{recipient});
            
            if (subject != null && !subject.isEmpty()) {
                mainIntent.putExtra(Intent.EXTRA_SUBJECT, subject);
            }
            
            if (body != null && !body.isEmpty()) {
                mainIntent.putExtra(Intent.EXTRA_TEXT, body);
            }

            // Set the selector on the main intent
            // This combines the email restriction (selector) with the ability to send content (main)
            mainIntent.setSelector(selectorIntent);

            // Add flags to prevent the app from being killed while in email client
            mainIntent.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);
            mainIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            // Start the activity
            getContext().startActivity(mainIntent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to open email client: " + e.getMessage());
        }
    }

    /**
     * Opens the Google Play Store or other app store for a specific app.
     * 
     * @param call Capacitor plugin call with parameters:
     *             - appId: The package name of the app to open in the store
     */
    @PluginMethod
    public void openStore(PluginCall call) {
        String appId = call.getString("appId");

        if (appId == null || appId.isEmpty()) {
            call.reject("App ID is required");
            return;
        }

        try {
            // Create intent to open the app in the Google Play Store
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + appId));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            // Try to start the activity
            getContext().startActivity(intent);
            call.resolve();
        } catch (android.content.ActivityNotFoundException e) {
            // If Play Store is not installed, fall back to web browser
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=" + appId));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
                call.resolve();
            } catch (Exception ex) {
                call.reject("Failed to open app store: " + ex.getMessage());
            }
        } catch (Exception e) {
            call.reject("Failed to open app store: " + e.getMessage());
        }
    }

    @PluginMethod
    public void clearAllData(PluginCall call) {
        // Clear SharedPreferences
        SharedPreferences prefs = getContext().getSharedPreferences("AudioPrefs", Context.MODE_PRIVATE);
        prefs.edit().clear().commit();

        // Cancel any pending sleep timer
        cancelSleepTimer();

        // Stop all sounds
        Intent intent = new Intent(getContext(), AudioService.class);
        intent.setAction("ACTION_STOP_ALL");

        getContext().startService(intent);

        if (call != null) {
            call.resolve();
        }
    }

    @PluginMethod
    public void initializeSession(PluginCall call) {
        Intent intent = new Intent(getContext(), AudioService.class);
        intent.setAction("ACTION_INITIALIZE");
        
        // We don't use startForegroundService here because we don't want to show a notification
        // until playback actually starts. ACTION_INITIALIZE just ensures the service is created
        // and MediaSession is ready.
        getContext().startService(intent);
        call.resolve();
    }
}