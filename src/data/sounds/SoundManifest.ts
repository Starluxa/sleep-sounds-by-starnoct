/**
 * Raw sound data extracted from the core registry.
 * This file contains only pure data for the sound library.
 * 
 * Pattern: Data Isolation
 * This ensures the core logic is not bloated with static asset definitions.
 */
export const RAW_SOUND_DATA = [
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
] as const;
