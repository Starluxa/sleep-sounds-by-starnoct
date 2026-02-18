# Sleep Sounds by StarNoct - Performance Optimized

A high-performance, cross-platform sleep aid application built with Next.js, Capacitor, and a custom military-grade Android Native Audio Engine.

## 🚀 The "Gold Standard" Architecture

The defining feature of this application is its **"Native Driver, Web Passenger"** architecture. Unlike standard hybrid apps, StarNoct delegates all time-critical and life-cycle-critical logic to the Android OS to ensure 100% reliability during deep sleep (Doze Mode).

### 🛠 The Sleep Timer "Nuclear Option" (Fixed Jan 2026)
We solved the chronic issue of timers failing when the screen is off by implementing the **Decoupled Broadcast Pattern**.

1.  **The Trigger:** We use `AlarmManager.setAlarmClock()`. This is the most aggressive wakeup method in Android. It tells the OS to "Thaw" the app at a precise millisecond, even if the device is in a battery-saving deep sleep.
2.  **The Receiver:** A standalone Java class `SleepTimerReceiver.java` (a static BroadcastReceiver). This acts as a reliable entry point that doesn't depend on the WebView being awake.
3.  **The Execution:** The Receiver sends a high-priority `ACTION_FADE_OUT_STOP` intent to the `AudioService`.
4.  **The Fade:** The volume ramp-down is handled natively in Java via a `Handler` on the `MainLooper`. This prevents audio "pops" and ensures a smooth transition to silence without requiring a single line of JavaScript.
5.  **Clean Termination:** To avoid "Ghost Services," the service explicitly releases the `MediaSession` and removes the foreground notification before calling `stopSelf()`.

**⚠️ WARNING TO DEVELOPERS:**
Do NOT move the timer logic back into the React/Zustand layer. The JavaScript thread is unreliable when the screen is off. React is a **Passenger**; it should only display the `timeLeft` provided by the Native Service status.

## 🏗 Project Structure

- `/app`: Next.js frontend (The "Passenger").
- `/app/lib/stores`: Zustand slices (UI State management).
- `/app/hooks/useAndroidAudio.ts`: The granular command bridge.
- `/android`: Custom Java implementation (The "Driver").
- `/android/.../AudioService.java`: Manages MediaPlayers and SynthPlayers.

## 🧪 Testing Background Reliability
To verify the timer works in deep sleep, use the following ADB command to force Doze Mode:
`adb shell dumpsys deviceidle force-idle`
Set a 1-minute timer, run the command, and turn off the screen.