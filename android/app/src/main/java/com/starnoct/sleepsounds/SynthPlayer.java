package com.starnoct.sleepsounds;

import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioTrack;
import android.os.Build;

import java.util.Random;

/**
 * Minimal synthetic (noise) player using AudioTrack.
 * Supports flavors: white, pink, brown, box-fan, airplane-cabin.
 */
public class SynthPlayer implements AudioService.AudioPlayer {

    // Synth flavor constants for consistent detection
    private static final String FLAVOR_WHITE = "white";
    private static final String FLAVOR_PINK = "pink";
    private static final String FLAVOR_BROWN = "brown";
    private static final String FLAVOR_FAN = "fan";
    private static final String FLAVOR_AIRPLANE = "airplane";
    private static final String FLAVOR_CABIN = "cabin";

    private final String id;
    private final String flavor;
    private volatile boolean shouldRun = false;
    private Thread thread;
    private AudioTrack track;
    private float volume;

    SynthPlayer(String id, String flavor, float volume) {
        this.id = id;
        this.flavor = flavor;
        this.volume = volume;
    }

    @Override
    public boolean isPlaying() {
        try {
            return shouldRun && track != null && track.getPlayState() == AudioTrack.PLAYSTATE_PLAYING;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public void start() {
        stop();

        final int sampleRate = 44100;
        final int channelConfig = AudioFormat.CHANNEL_OUT_STEREO;
        final int encoding = AudioFormat.ENCODING_PCM_16BIT;

        int minBuf = AudioTrack.getMinBufferSize(sampleRate, channelConfig, encoding);
        int bufferBytes = Math.max(minBuf, sampleRate * 2 * 4 / 10); // ~100ms

        AudioAttributes attrs = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build();
        AudioFormat fmt = new AudioFormat.Builder()
                .setSampleRate(sampleRate)
                .setEncoding(encoding)
                .setChannelMask(channelConfig)
                .build();

        track = new AudioTrack(attrs, fmt, bufferBytes, AudioTrack.MODE_STREAM, AudioManager.AUDIO_SESSION_ID_GENERATE);
        setVolume(volume);
        track.play();

        shouldRun = true;
        thread = new Thread(() -> runLoop(sampleRate), "SynthPlayer-" + id);
        thread.setDaemon(true);
        thread.start();
    }

    @Override
    public void setVolume(float v) {
        this.volume = v;
        try {
            if (track == null) return;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                track.setVolume(v);
            } else {
                //noinspection deprecation
                track.setStereoVolume(v, v);
            }
        } catch (Exception ignored) {
            // Intentionally ignored: volume operation is non-critical and may fail during teardown
        }
    }

    @Override
    public void stop() {
        shouldRun = false;
        try {
            if (thread != null) {
                try {
                    thread.join(200);
                } catch (Exception ignored) {
                    // Intentionally ignored: thread join timeout is acceptable during stop
                }
            }
        } finally {
            thread = null;
        }

        try {
            if (track != null) {
                try {
                    track.pause();
                } catch (Exception ignored) {
                    // Intentionally ignored: resource cleanup must continue even if pause fails
                }
                try {
                    track.flush();
                } catch (Exception ignored) {
                    // Intentionally ignored: resource cleanup must continue even if flush fails
                }
                try {
                    track.stop();
                } catch (Exception ignored) {
                    // Intentionally ignored: resource cleanup must continue even if stop fails
                }
                try {
                    track.release();
                } catch (Exception ignored) {
                    // Intentionally ignored: resource cleanup must continue even if release fails
                }
            }
        } finally {
            track = null;
        }
    }

    private void runLoop(int sampleRate) {
        final Random rnd = new Random();
        final int frames = 1024;
        final short[] pcm = new short[frames * 2];

        // Pink noise state (Paul Kellet)
        float b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        // Brown noise state
        float brown = 0;
        // Lowpass state
        float lpL = 0, lpR = 0;
        // Modulation time
        double t = 0;
        final double dt = 1.0 / sampleRate;

        while (shouldRun && track != null) {
            final boolean isWhite = flavor.contains(FLAVOR_WHITE);
            final boolean isPink = flavor.contains(FLAVOR_PINK);
            final boolean isBrown = flavor.contains(FLAVOR_BROWN);
            final boolean isBoxFan = flavor.contains(FLAVOR_FAN);
            final boolean isAirplane = flavor.contains(FLAVOR_AIRPLANE) || flavor.contains(FLAVOR_CABIN);

            for (int i = 0; i < frames; i++) {
                float x = (rnd.nextFloat() * 2f) - 1f; // white
                float s;

                if (isPink) {
                    b0 = 0.99886f * b0 + x * 0.0555179f;
                    b1 = 0.99332f * b1 + x * 0.0750759f;
                    b2 = 0.96900f * b2 + x * 0.1538520f;
                    b3 = 0.86650f * b3 + x * 0.3104856f;
                    b4 = 0.55000f * b4 + x * 0.5329522f;
                    b5 = -0.7616f * b5 - x * 0.0168980f;
                    s = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + x * 0.5362f);
                    b6 = x * 0.115926f;
                    s *= 0.11f;
                } else if (isBrown || isAirplane) {
                    brown = (brown + 0.02f * x) / 1.02f;
                    s = brown * 3.5f;
                } else {
                    s = x;
                }

                if (isBoxFan || isAirplane) {
                    double baseCutoff = isBoxFan ? 1000.0 : 2000.0;
                    double depth = isBoxFan ? 200.0 : 0.0;
                    double rate = isBoxFan ? 0.5 : 0.0;
                    double cutoff = baseCutoff + (depth * Math.sin(2.0 * Math.PI * rate * t));
                    if (cutoff < 50.0) cutoff = 50.0;

                    double rc = 1.0 / (2.0 * Math.PI * cutoff);
                    double alpha = dt / (rc + dt);
                    lpL = (float) (lpL + alpha * (s - lpL));
                    lpR = (float) (lpR + alpha * (s - lpR));
                    s = lpL;
                }

                float trim;
                if (isPink) trim = 0.9f;
                else if (isBrown || isAirplane) trim = 0.35f;
                else trim = 0.25f;

                short v = (short) Math.max(Short.MIN_VALUE,
                        Math.min(Short.MAX_VALUE, (int) (s * trim * 32767.0f)));
                pcm[i * 2] = v;
                pcm[i * 2 + 1] = v;

                t += dt;
            }

            try {
                int wrote = track.write(pcm, 0, pcm.length);
                if (wrote <= 0) break;
            } catch (Exception e) {
                break;
            }
        }
    }
}
