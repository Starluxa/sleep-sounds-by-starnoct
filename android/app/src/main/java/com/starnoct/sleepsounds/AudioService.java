package com.starnoct.sleepsounds;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

import androidx.core.app.NotificationCompat;
import androidx.media.app.NotificationCompat.MediaStyle;

import java.util.HashMap;
import java.util.Map;

public class AudioService extends Service {
    private static final String TAG = "AudioService";
    public static final String ACTION_FADE_OUT_STOP = "com.starnoct.sleepsounds.ACTION_FADE_OUT_STOP";

    // Static instance reference for safe access from BroadcastReceiver
    // This allows SleepTimerReceiver to stop the service without starting a new instance
    private static AudioService instance = null;

    /**
     * Returns the current AudioService instance if running, null otherwise.
     * This provides safe access for components like SleepTimerReceiver to check
     * if the service is active without spawning a new instance.
     */
    public static AudioService getInstance() {
        return instance;
    }

    // We use a common interface so we can treat MP3s and Synth Noises the same
    interface AudioPlayer {
        void start();

        void stop();

        void setVolume(float volume);

        boolean isPlaying();
    }

    private final Map<String, AudioPlayer> players = new HashMap<>();
    private static final String CHANNEL_ID = "SleepSoundsChannel";
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private AudioManager audioManager;
    private AudioManager.OnAudioFocusChangeListener focusChangeListener;
    private MediaSessionCompat mediaSession;
    private boolean isServiceTimedOut = false;

    // Global volume for fade-out synchronization
    private float currentFadeVolume = 1.0f;
    private Runnable fadeOutRunnable;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this; // Set static instance reference
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);

        // Initialize MediaSession
        mediaSession = new MediaSessionCompat(this, TAG);
        mediaSession.setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS |
                MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS);

        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override
            public void onPlay() {
                // For now, we don't have a global "play" state that resumes everything
                // but we should handle the event.
            }

            @Override
            public void onPause() {
                fadeOutAndStop();
            }

            @Override
            public void onStop() {
                stopAllTracks();
            }
        });

        mediaSession.setActive(true);

        focusChangeListener = focusChange -> {
            switch (focusChange) {
                case AudioManager.AUDIOFOCUS_LOSS:
                case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT:
                    // Stop everything. It's safer for MVP than trying to pause/resume.
                    // This creates a "clean slate."
                    stopAllTracks();
                    break;
            }
        };
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || intent.getAction() == null) return START_NOT_STICKY;

        String action = intent.getAction();

        switch (action) {
            case "ACTION_INITIALIZE": {
                if (audioManager != null) {
                    audioManager.requestAudioFocus(focusChangeListener,
                            AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
                }
                return START_STICKY;
            }
            case "ACTION_PLAY": {
                ensureForeground();
                String id = intent.getStringExtra("SOUND_ID");
                String url = intent.getStringExtra("URL");
                float vol = intent.getFloatExtra("VOLUME", 1.0f);
                playTrack(id, url, vol);
                return START_STICKY;
            }
            case "ACTION_STOP": {
                stopTrack(intent.getStringExtra("SOUND_ID"));
                // If sounds remain, keep the service in the foreground.
                if (!players.isEmpty()) {
                    ensureForeground();
                    return START_STICKY;
                }
                return START_NOT_STICKY;
            }
            case "ACTION_SET_VOLUME": {
                setTrackVolume(intent.getStringExtra("SOUND_ID"), intent.getFloatExtra("VOLUME", 1.0f));
                if (!players.isEmpty()) {
                    ensureForeground();
                    return START_STICKY;
                }
                return START_NOT_STICKY;
            }
            case "ACTION_STOP_ALL": {
                stopAllTracks();
                return START_NOT_STICKY;
            }
            case ACTION_FADE_OUT_STOP: {
                fadeOutAndStop();
                return START_NOT_STICKY;
            }
            case "ACTION_TIMER_FIRED": {
                fadeOutAndStop();
                return START_NOT_STICKY;
            }
        }

        // Unknown action
        return START_NOT_STICKY;
    }

    private void playTrack(String id, String url, float targetVolume) {
        if (id == null) return;

        // REQUEST FOCUS NOW
        if (audioManager != null) {
            int res = audioManager.requestAudioFocus(focusChangeListener,
                    AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
            if (res != AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
                return; // Do not play
            }
        }

        if (players.containsKey(id)) {
            // Already playing? Just update volume (fade to new level)
            setTrackVolume(id, targetVolume);
            return;
        }

        AudioPlayer player;

        // 1) Detect if it's a Synthetic Sound (White/Pink/Brown Noise)
        // JS convention sends url = synthetic://<flavor>
        boolean isSynth = (url != null && url.startsWith("synthetic://"))
                || id.contains("noise")
                || id.contains("fan")
                || (url != null && url.startsWith("synthetic"));

        if (isSynth) {
            // Prefer an explicit flavor embedded in the URL when provided
            // e.g. synthetic://pink, synthetic://brown, synthetic://white
            final String synthFlavor = parseSyntheticFlavor(url, id);
            player = new SynthPlayer(id, synthFlavor, targetVolume);
        }
        // 2) Otherwise it's a File (Rain, etc)
        else {
            player = new FilePlayer(this, url, targetVolume);
        }

        try {
            // Step 5: Safe native fade-in
            // Start at volume 0 and fade to target to avoid clicks/pops
            // Use short duration (150ms) to prevent "soft first sound" issue
            player.setVolume(0f);
            player.start();
            players.put(id, player);
            
            // Apply smooth fade-in after player exists
            fadeVolume(player, 0f, targetVolume, 150);
        } catch (Exception e) {
            // Error playing
        }
    }

    private void stopTrack(String id) {
        if (id == null) return;
        AudioPlayer player = players.remove(id);
        if (player != null) {
            // Quick fade out could go here, but for now just stop
            player.stop();
            AudioControlPlugin.onPlaybackTerminated(id);
        }
        if (players.isEmpty()) {
            terminateServiceProperly();
        }
    }

    private void setTrackVolume(String id, float volume) {
        if (id == null) return;
        AudioPlayer player = players.get(id);
        if (player != null) {
            player.setVolume(volume);
        }
    }

    private void stopAllTracks() {
        // CRITICAL: Stop any pending fade-in loops immediately
        if (mainHandler != null) {
            mainHandler.removeCallbacksAndMessages(null);
        }

        for (Map.Entry<String, AudioPlayer> entry : players.entrySet()) {
            entry.getValue().stop();
            AudioControlPlugin.onPlaybackTerminated(entry.getKey());
        }
        players.clear();

        // If the JS side sent STOP_ALL (pause/clear), treat that as a terminal stop.
        // We should not keep the foreground notification alive when nothing is playing.
        terminateServiceProperly();
    }

    private void fadeOutAndStop() {
        if (players.isEmpty()) {
            stopAllTracks();
            return;
        }

        // CRITICAL: Stop any pending fade-in or previous fade-out loops immediately
        if (mainHandler != null) {
            mainHandler.removeCallbacksAndMessages(null);
        }

        // Reset global fade volume
        currentFadeVolume = 1.0f;

        final int durationMs = 5000; // 5 second fade out
        final int intervalMs = 100;  // 100ms ticks
        final float decrement = (float) intervalMs / durationMs;

        fadeOutRunnable = new Runnable() {
            @Override
            public void run() {
                currentFadeVolume -= decrement;

                if (currentFadeVolume <= 0) {
                    currentFadeVolume = 0;
                    applyGlobalVolume();
                    stopAllTracks();
                } else {
                    applyGlobalVolume();
                    mainHandler.postDelayed(this, intervalMs);
                }
            }
        };

        mainHandler.post(fadeOutRunnable);
    }

    private void applyGlobalVolume() {
        // Capture current players to avoid ConcurrentModificationException
        final Map<String, AudioPlayer> activePlayers = new HashMap<>(players);
        for (AudioPlayer player : activePlayers.values()) {
            if (player.isPlaying()) {
                player.setVolume(currentFadeVolume);
            }
        }
    }

    private String parseSyntheticFlavor(String url, String fallbackId) {
        try {
            if (url != null && url.startsWith("synthetic://")) {
                String flavor = url.substring("synthetic://".length());
                if (flavor != null) {
                    flavor = flavor.trim().toLowerCase();
                    if (!flavor.isEmpty()) return flavor;
                }
            }
        } catch (Exception ignored) {
        }
        return fallbackId == null ? "white" : fallbackId;
    }

    // --- Helper: Volume Fader ---
    private void fadeVolume(AudioPlayer player, float start, float end, int durationMs) {
        final int steps = 20;
        final long delay = durationMs / steps;
        final float stepSize = (end - start) / steps;

        for (int i = 1; i <= steps; i++) {
            final float vol = start + (stepSize * i);
            mainHandler.postDelayed(() -> {
                if (player.isPlaying()) {
                    player.setVolume(vol);
                }
            }, i * delay);
        }
    }

    private void updateMediaSessionState(int state) {
        if (mediaSession == null) return;

        PlaybackStateCompat.Builder stateBuilder = new PlaybackStateCompat.Builder()
                .setActions(PlaybackStateCompat.ACTION_PLAY |
                        PlaybackStateCompat.ACTION_PAUSE |
                        PlaybackStateCompat.ACTION_STOP |
                        PlaybackStateCompat.ACTION_PLAY_PAUSE);

        stateBuilder.setState(state, PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN, 1.0f);
        mediaSession.setPlaybackState(stateBuilder.build());
    }

    private void ensureForeground() {
        updateMediaSessionState(PlaybackStateCompat.STATE_PLAYING);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Playback", NotificationManager.IMPORTANCE_LOW);
            getSystemService(NotificationManager.class).createNotificationChannel(channel);
        }

        // 1. Open App Intent (Fixes "Clicking doesn't open app")
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent openPendingIntent = PendingIntent.getActivity(this, 0, openIntent, PendingIntent.FLAG_IMMUTABLE);

        // 2. Stop Action Intent
        Intent stopIntent = new Intent(this, AudioService.class);
        stopIntent.setAction("ACTION_STOP_ALL");
        PendingIntent stopPendingIntent = PendingIntent.getService(this, 0, stopIntent, PendingIntent.FLAG_IMMUTABLE);

        // 3. Build Notification with MediaStyle
        Notification notification = new androidx.core.app.NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Sleep Sounds")
                .setContentText("Playing...")
                .setSmallIcon(R.drawable.ic_stat_sleep)
                .setContentIntent(openPendingIntent)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                // Add the Stop Button
                .addAction(android.R.drawable.ic_media_pause, "Stop", stopPendingIntent)
                // Apply MediaStyle! This makes it look like a music player
                .setStyle(new MediaStyle()
                        .setMediaSession(mediaSession.getSessionToken())
                        .setShowActionsInCompactView(0)) // Show the first action (Stop) in compact mode
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(1, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(1, notification);
        }
    }

    private void terminateServiceProperly() {
        // 1. Update MediaSession state to STOPPED
        updateMediaSessionState(PlaybackStateCompat.STATE_STOPPED);

        // 2. Release MediaSession
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
            mediaSession = null;
        }

        // 3. Remove notification and stop foreground
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE);
        } else {
            stopForeground(true);
        }

        // 4. Stop the service
        stopSelf();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        instance = null; // Clear static instance reference
        terminateServiceProperly();
        super.onDestroy();
    }

    @Override
    public void onTimeout(int startId, int fgsType) {
        isServiceTimedOut = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_DETACH);
        } else {
            stopForeground(false);
        }
        stopSelf();
    }
}