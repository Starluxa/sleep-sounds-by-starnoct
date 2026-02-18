import { SoundDefinition } from '../../domain/sounds/types/RegistryTypes';

/**
 * Lightweight packet representing a sound for the Native Android layer.
 */
export interface SoundBridgePacket {
  readonly soundId: string;
  readonly url: string;
  readonly type: 'file' | 'synthetic';
}

/**
 * Mapper responsible for converting Domain SoundDefinitions into 
 * lightweight SoundBridgePackets that the Native Android layer understands.
 */
export class SoundBridgeMapper {
  /**
   * Converts a Domain SoundDefinition into a SoundBridgePacket.
   * Strips all UI data (icons, pretty names).
   * 
   * @param sound The domain sound definition.
   * @returns A lightweight packet for native consumption.
   */
  public static toNative(sound: SoundDefinition): SoundBridgePacket {
    let url: string;

    if (sound.type === 'file') {
      // For file sounds, resolve the path. 
      // The native layer expects paths relative to the assets/public directory 
      // or absolute paths if they are external.
      // We ensure it starts with / if it's a relative path for consistency.
      url = sound.audioUrl.startsWith('http') || sound.audioUrl.startsWith('/') 
        ? sound.audioUrl 
        : `/${sound.audioUrl}`;
    } else {
      // For synthetic sounds, flatten the config into a synthetic://flavor URL scheme.
      // The AudioService.java expects synthetic://<flavor>
      // We use the oscillatorType as the flavor for the MVP.
      const flavor = sound.syntheticConfig.oscillatorType;
      url = `synthetic://${flavor}`;
    }

    return {
      soundId: sound.id,
      url: url,
      type: sound.type
    };
  }
}

/**
 * Lightweight packet representing a sound for the Native Android layer.
 */
export interface SoundBridgePacket {
  readonly soundId: string;
  readonly url: string;
  readonly type: 'file' | 'synthetic';
}

/**
 * Mapper responsible for converting Domain SoundDefinitions into 
 * lightweight SoundBridgePackets that the Native Android layer understands.
 */
export class SoundBridgeMapper {
  /**
   * Converts a Domain SoundDefinition into a SoundBridgePacket.
   * Strips all UI data (icons, pretty names).
   * 
   * @param sound The domain sound definition.
   * @returns A lightweight packet for native consumption.
   */
  public static toNative(sound: SoundDefinition): SoundBridgePacket {
    let url: string;

    if (sound.type === 'file') {
      // For file sounds, resolve the path. 
      // The native layer expects paths relative to the assets/public directory 
      // or absolute paths if they are external.
      // We ensure it starts with / if it's a relative path for consistency.
      url = sound.audioUrl.startsWith('http') || sound.audioUrl.startsWith('/') 
        ? sound.audioUrl 
        : `/${sound.audioUrl}`;
    } else {
      // For synthetic sounds, flatten the config into a synthetic://flavor URL scheme.
      // The AudioService.java expects synthetic://<flavor>
      // We use the oscillatorType as the flavor for the MVP.
      const flavor = sound.syntheticConfig.oscillatorType;
      url = `synthetic://${flavor}`;
    }

    return {
      soundId: sound.id,
      url: url,
      type: sound.type
    };
  }
}

