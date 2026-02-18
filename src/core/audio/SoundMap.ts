import type { SoundState, SoundId, SoundCategory, FileSoundState, SyntheticSoundState } from '../../domain/sounds/dtos/SoundState';
import { SoundEntity } from '../../domain/sounds/entities/SoundEntity';

/**
 * Raw entry type for defining sounds in the registry.
 * This is the shape of data before validation via SoundEntity.create().
 */
interface RawSoundEntry {
  readonly id: SoundId;
  readonly name: string;
  readonly category: SoundCategory;
  readonly icon: string;
  readonly type: 'file' | 'synthetic';
  readonly volume?: number;
  readonly audioUrl?: string;
  readonly syntheticConfig?: Record<string, unknown>;
}

/**
 * Sound Registry Entry - A SoundState extended with UI metadata.
 * 
 * Pattern: Discriminated Union for Data-Oriented Audio State
 * This type represents a validated SoundState plus presentation-layer metadata (name, icon).
 * 
 * We use an intersection type with the discriminant property ('type') to maintain
 * the discriminated union pattern while adding common UI fields.
 */
export type SoundRegistryEntry = 
  | (FileSoundState & { readonly name: string; readonly icon: string; })
  | (SyntheticSoundState & { readonly name: string; readonly icon: string; });

/**
 * Type guard to check if a SoundRegistryEntry is a file-based sound.
 */
function isFileEntry(entry: SoundRegistryEntry): entry is FileSoundState & { readonly name: string; readonly icon: string; } {
  return entry.type === 'file';
}

/**
 * Type guard to check if a SoundRegistryEntry is a synthetic sound.
 */
function isSyntheticEntry(entry: SoundRegistryEntry): entry is SyntheticSoundState & { readonly name: string; readonly icon: string; } {
  return entry.type === 'synthetic';
}

/**
 * SoundMap acts as a central registry for sound metadata in the domain layer.
 * It allows the domain logic to access sound information without importing UI data files.
 * 
 * All entries are strictly validated via SoundEntity.create() to ensure compliance
 * with the SoundState interface and domain business rules. This catches schema drift
 * in the static asset library at module load time.
 * 
 * Pattern: Static Registry with Runtime Validation
 * - RAW_ENTRIES defines the sound library as plain data
 * - MAP is built by validating each entry through SoundEntity.create()
 * - Any validation error throws immediately on module load, preventing runtime surprises
 */
export class SoundMap {
  /**
   * Raw sound definitions used to build the validated MAP.
   * Each entry will be wrapped with SoundEntity.create() for validation.
   */
  private static readonly RAW_ENTRIES: readonly RawSoundEntry[] = [
    // Rain & Thunder
    { 
      id: 'light-drizzle', 
      name: 'Light Drizzle', 
      category: 'rain', 
      icon: '💧', 
      type: 'file', 
      audioUrl: '/sounds/light-drizzle.mp3',
    },
    { 
      id: 'gentle-rain', 
      name: 'Steady Gentle Rain', 
      category: 'rain', 
      icon: '🌧️', 
      type: 'file', 
      audioUrl: '/sounds/gentle-rain.mp3',
    },
    { 
      id: 'rain-window', 
      name: 'Rain on a Windowpane', 
      category: 'rain', 
      icon: '🪟', 
      type: 'file', 
      audioUrl: '/sounds/rain-window.mp3',
    },
    { 
      id: 'rain-tent', 
      name: 'Rain on a Tent', 
      category: 'rain', 
      icon: '⛺', 
      type: 'file', 
      audioUrl: '/sounds/rain-tent.mp3',
    },
    { 
      id: 'heavy-downpour', 
      name: 'Heavy Downpour', 
      category: 'rain', 
      icon: '⛈️', 
      type: 'file', 
      audioUrl: '/sounds/heavy-downpour.mp3',
    },
    { 
      id: 'rain-tin-roof', 
      name: 'Rain on a Tin Roof', 
      category: 'rain', 
      icon: '🏠', 
      type: 'file', 
      audioUrl: '/sounds/rain-tin-roof.mp3',
    },
    
    // Thunder
    { 
      id: 'distant-thunder', 
      name: 'Distant Thunder Rumble', 
      category: 'thunder', 
      icon: '🌩️', 
      type: 'file', 
      audioUrl: '/sounds/distant-thunder.mp3',
    },
    { 
      id: 'rolling-thunder', 
      name: 'Rolling Thunder', 
      category: 'thunder', 
      icon: '⚡', 
      type: 'file', 
      audioUrl: '/sounds/rolling-thunder.mp3',
    },
    
    // Waterways
    { 
      id: 'small-stream', 
      name: 'Small Stream', 
      category: 'waterways', 
      icon: '🌊', 
      type: 'file', 
      audioUrl: '/sounds/small-stream.mp3',
    },
    { 
      id: 'babbling-brook', 
      name: 'Babbling Brook', 
      category: 'waterways', 
      icon: '💦', 
      type: 'file', 
      audioUrl: '/sounds/babbling-brook.mp3',
    },
    { 
      id: 'gentle-river', 
      name: 'Gentle River Flow', 
      category: 'waterways', 
      icon: '🏞️', 
      type: 'file', 
      audioUrl: '/sounds/gentle-river.mp3',
    },
    { 
      id: 'large-waterfall', 
      name: 'Large, Roaring Waterfall', 
      category: 'waterways', 
      icon: '💧', 
      type: 'file', 
      audioUrl: '/sounds/large-waterfall.mp3',
    },
    
    // Ocean
    { 
      id: 'gentle-waves', 
      name: 'Gentle Lapping Waves', 
      category: 'ocean', 
      icon: '🌊', 
      type: 'file', 
      audioUrl: '/sounds/gentle-waves.mp3',
    },
    { 
      id: 'calm-waves-beach', 
      name: 'Calm Waves on Sandy Beach', 
      category: 'ocean', 
      icon: '🏖️', 
      type: 'file', 
      audioUrl: '/sounds/calm-waves-beach.mp3',
    },
    { 
      id: 'distant-seagulls', 
      name: 'Distant Seagulls Calling', 
      category: 'ocean', 
      icon: '🦅', 
      type: 'file', 
      audioUrl: '/sounds/distant-seagulls.mp3',
    },
    { 
      id: 'deep-ocean', 
      name: 'Deep Ocean Waves', 
      category: 'ocean', 
      icon: '🌊', 
      type: 'file', 
      audioUrl: '/sounds/deep-ocean.mp3',
    },
    { 
      id: 'crashing-waves', 
      name: 'Crashing Waves on Rocks', 
      category: 'ocean', 
      icon: '🪨', 
      type: 'file', 
      audioUrl: '/sounds/crashing-waves.mp3',
    },
    { 
      id: 'whale-song', 
      name: 'Whale Song', 
      category: 'ocean', 
      icon: '🐋', 
      type: 'file', 
      audioUrl: '/sounds/whale-song.mp3',
    },
    
    // Forest
    { 
      id: 'temperate-forest', 
      name: 'Temperate Forest (Night)', 
      category: 'forest', 
      icon: '🌲', 
      type: 'file', 
      audioUrl: '/sounds/temperate-forest.mp3',
    },
    { 
      id: 'wind-pines', 
      name: 'Wind Through Pine Trees', 
      category: 'forest', 
      icon: '🌬️', 
      type: 'file', 
      audioUrl: '/sounds/wind-pines.mp3',
    },
    { 
      id: 'swamp-night', 
      name: 'Swamp at Night', 
      category: 'forest', 
      icon: '🐸', 
      type: 'file', 
      audioUrl: '/sounds/swamp-night.mp3',
    },
    
    // Creatures
    { 
      id: 'owl-hooting', 
      name: 'Owl Hooting (Barn Owl)', 
      category: 'creatures', 
      icon: '🦉', 
      type: 'file', 
      audioUrl: '/sounds/owl-hooting.mp3',
    },
    { 
      id: 'crickets', 
      name: 'Crickets Chirping', 
      category: 'creatures', 
      icon: '🦗', 
      type: 'file', 
      audioUrl: '/sounds/crickets.mp3',
    },
    { 
      id: 'cat-purring', 
      name: 'Cat Purring', 
      category: 'creatures', 
      icon: '🐱', 
      type: 'file', 
      audioUrl: '/sounds/cat-purring.mp3',
    },
    
    // Fire
    { 
      id: 'small-campfire', 
      name: 'Small Campfire', 
      category: 'fire', 
      icon: '🔥', 
      type: 'file', 
      audioUrl: '/sounds/small-campfire.mp3',
    },
    { 
      id: 'fireplace', 
      name: 'Crackling Fireplace', 
      category: 'fire', 
      icon: '🪵', 
      type: 'file', 
      audioUrl: '/sounds/fireplace.mp3',
    },
    
    // Color Noise
    { 
      id: 'white-noise', 
      name: 'White Noise', 
      category: 'color-noise', 
      icon: '⚪', 
      type: 'synthetic', 
      syntheticConfig: { color: 'white' },
    },
    { 
      id: 'pink-noise', 
      name: 'Pink Noise', 
      category: 'color-noise', 
      icon: '🌸', 
      type: 'synthetic', 
      syntheticConfig: { color: 'pink' },
    },
    { 
      id: 'brown-noise', 
      name: 'Brown Noise', 
      category: 'color-noise', 
      icon: '🟤', 
      type: 'synthetic', 
      syntheticConfig: { color: 'brown' },
    },
    { 
      id: 'box-fan', 
      name: 'Box Fan', 
      category: 'color-noise', 
      icon: '💨', 
      type: 'synthetic', 
      syntheticConfig: { 
        color: 'white', 
        filter: { type: 'lowpass', freq: 1000 }, 
        modulation: { rate: 0.5, depth: 200 },
      },
    },
    { 
      id: 'airplane-cabin', 
      name: 'Airplane Cabin', 
      category: 'color-noise', 
      icon: '✈️', 
      type: 'synthetic', 
      syntheticConfig: { 
        color: 'brown', 
        filter: { type: 'lowpass', freq: 2000 },
      },
    },
    
    // Ambient
    { 
      id: 'blizzard', 
      name: 'Howling Blizzard', 
      category: 'ambient', 
      icon: '❄️', 
      type: 'file', 
      audioUrl: '/sounds/blizzard.mp3',
    },
    { 
      id: 'coffee-shop', 
      name: 'Quiet Coffee Shop Chatter', 
      category: 'ambient', 
      icon: '☕', 
      type: 'file', 
      audioUrl: '/sounds/coffee-shop.mp3',
    },
    { 
      id: 'grandfather-clock', 
      name: 'Grandfather Clock Ticking', 
      category: 'ambient', 
      icon: '🕰️', 
      type: 'file', 
      audioUrl: '/sounds/grandfather-clock.mp3',
    },
  ];

  /**
   * Validated MAP where every entry has been verified via SoundEntity.create().
   * This ensures all static assets comply with the domain SoundState interface.
   * 
   * TypeScript Discriminated Unions Pattern:
   * - Each entry is a SoundState (FileSoundState | SyntheticSoundState)
   * - Extended with UI metadata (name, icon) for the registry
   * - Validation happens at module load time, catching schema drift immediately
   */
  private static readonly MAP: Record<SoundId, SoundRegistryEntry> = (() => {
    const map: Record<SoundId, SoundRegistryEntry> = {};
    
    for (const entry of SoundMap.RAW_ENTRIES) {
      // Use SoundEntity.create() to validate and ensure compliance with SoundState
      // Default volume is 75 if not specified (will be overridden by user preferences at runtime)
      const validatedState = SoundEntity.create({
        id: entry.id,
        volume: entry.volume ?? 75,
        category: entry.category,
        type: entry.type,
        audioUrl: entry.audioUrl,
        syntheticConfig: entry.syntheticConfig,
      });

      // Combine validated state with UI metadata to create the registry entry
      // The discriminant 'type' ensures proper type narrowing
      const registryEntry: SoundRegistryEntry = {
        ...validatedState,
        name: entry.name,
        icon: entry.icon,
      };

      map[entry.id] = registryEntry;
    }

    return map;
  })();

  /**
   * Retrieves metadata for a specific sound ID.
   * Returns a SoundRegistryEntry which extends SoundState with UI metadata.
   */
  static getById(id: SoundId): SoundRegistryEntry | undefined {
    return this.MAP[id];
  }

  /**
   * Retrieves all sounds belonging to a specific category.
   */
  static getByCategory(category: SoundCategory): SoundRegistryEntry[] {
    return Object.values(this.MAP).filter(s => s.category === category);
  }

  /**
   * Retrieves all registered sound IDs.
   */
  static getAllIds(): SoundId[] {
    return Object.keys(this.MAP);
  }

  /**
   * Retrieves all registered sound metadata.
   */
  static getAll(): SoundRegistryEntry[] {
    return Object.values(this.MAP);
  }

  /**
   * Converts a SoundRegistryEntry to a pure SoundState.
   * Use this when you need to strip UI metadata and work with domain-only data.
   */
  static toSoundState(entry: SoundRegistryEntry): SoundState {
    if (isFileEntry(entry)) {
      const { name, icon, ...soundState } = entry;
      return soundState as SoundState;
    } else {
      const { name, icon, ...soundState } = entry;
      return soundState as SoundState;
    }
  }

  /**
   * Retrieves a pure SoundState by ID.
   * Convenience method that combines getById with toSoundState.
   */
  static getSoundStateById(id: SoundId): SoundState | undefined {
    const entry = this.getById(id);
    return entry ? this.toSoundState(entry) : undefined;
  }
}
