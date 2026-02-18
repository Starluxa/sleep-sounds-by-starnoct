# Developer Notes

This document contains implementation notes and design decisions for the StarNoct Sleep Sounds codebase.

## Audio Slice Architecture

### Track Lifecycle Management

When a track's playback completes (e.g., due to native errors), we intentionally do NOT remove the track from mixEntity. The track should remain in the mix so it can be resumed after pause. Only update isPaused if all sounds are terminated.

This design decision ensures that:
- Users don't lose their mix configuration due to transient playback issues
- The mix can be resumed after interruption
- The UI state remains consistent with the user's intent

## Timer Architecture

The `decrementTimer` function was removed - TimerOrchestrator now drives timer state directly via `useSyncExternalStore` pattern for atomic, tear-free rendering.

## Type Standards

- Use `SoundId` type alias instead of `string` for sound identifiers
- Prefer domain-specific types over primitives for clarity
