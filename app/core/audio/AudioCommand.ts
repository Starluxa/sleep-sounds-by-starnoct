/**
 * Types of commands that can be sent to the audio engine.
 */
export enum AudioCommandType {
  PLAY_SOUND = 'PLAY_SOUND',
  ADJUST_VOLUME = 'ADJUST_VOLUME',
  STOP_SOUND = 'STOP_SOUND',
  STOP_ALL = 'STOP_ALL',
}

/**
 * Command to play a specific sound.
 */
export interface PlaySoundCommand {
  type: AudioCommandType.PLAY_SOUND;
  soundId: string;
  volume: number;
}

/**
 * Command to adjust the volume of a currently playing sound.
 */
export interface AdjustVolumeCommand {
  type: AudioCommandType.ADJUST_VOLUME;
  soundId: string;
  volume: number;
}

/**
 * Command to stop a specific sound.
 */
export interface StopSoundCommand {
  type: AudioCommandType.STOP_SOUND;
  soundId: string;
}

/**
 * Command to stop all currently playing sounds.
 */
export interface StopAllCommand {
  type: AudioCommandType.STOP_ALL;
}

/**
 * Discriminated union of all possible audio commands.
 */
export type AudioCommand =
  | PlaySoundCommand
  | AdjustVolumeCommand
  | StopSoundCommand
  | StopAllCommand;
