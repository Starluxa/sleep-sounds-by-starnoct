package com.starnoct.sleepsounds;

import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.MediaPlayer;

/**
 * Wrapper around MediaPlayer for playing local or asset-based audio files.
 */
public class FilePlayer implements AudioService.AudioPlayer {
    private final Context context;
    private final String url;
    private MediaPlayer mp;
    private float volume;
    private boolean isPrepared = false;

    FilePlayer(Context context, String url, float initialVol) {
        this.context = context;
        this.url = url;
        this.volume = initialVol;
        try {
            mp = createMediaPlayer();
            if (mp != null) {
                mp.prepare();
                isPrepared = true;
            }
        } catch (Exception e) {
            // Intentionally ignored: player initialization failure is handled by isPrepared check
        }
    }

    private MediaPlayer createMediaPlayer() throws Exception {
        MediaPlayer player = new MediaPlayer();
        player.setAudioAttributes(new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build());
        player.setLooping(true);
        player.setVolume(volume, volume);

        if (url.startsWith("http")) {
            player.setDataSource(url);
        } else if (url.startsWith("/")) {
            // Absolute path or asset-like path
            if (url.startsWith("/sounds/") || url.startsWith("/_next/") || url.startsWith("/public/")) {
                // Treat as asset
                String assetPath = "public" + url;
                AssetFileDescriptor afd = context.getAssets().openFd(assetPath);
                player.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                afd.close();
            } else {
                // Filesystem path
                player.setDataSource(url);
            }
        } else {
            // Relative asset path
            AssetFileDescriptor afd = context.getAssets().openFd("public/" + url);
            player.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
            afd.close();
        }

        return player;
    }

    @Override
    public void start() {
        if (mp != null && isPrepared) {
            mp.start();
        }
    }

    @Override
    public void stop() {
        if (mp != null) {
            try {
                if (mp.isPlaying()) mp.stop();
            } catch (Exception ignored) {
                // Intentionally ignored: resource cleanup must continue even if stop fails
            }
            mp.release();
            mp = null;
        }
    }

    @Override
    public void setVolume(float volume) {
        this.volume = volume;
        if (mp != null) {
            mp.setVolume(volume, volume);
        }
    }

    @Override
    public boolean isPlaying() {
        try {
            return mp != null && mp.isPlaying();
        } catch (Exception e) {
            return false;
        }
    }
}
