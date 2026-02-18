import { Category } from "@/types/sounds";

export const soundCategories: Category[] = [
  {
    id: "rain",
    name: "Rain & Thunder",
    icon: "🌧️",
    sounds: [
      { id: "light-drizzle", name: "Light Drizzle", category: "rain", icon: "💧", image: "/images/sounds/Light-Drizzle-Card.webp", audioUrl: "/sounds/light-drizzle.mp3", type: 'file' },
      { id: "gentle-rain", name: "Steady Gentle Rain", category: "rain", icon: "🌧️", image: "/images/sounds/Steady-Gentle-Rain-Card.webp", audioUrl: "/sounds/gentle-rain.mp3", type: 'file' },
      { id: "rain-window", name: "Rain on a Windowpane", category: "rain", icon: "🪟", image: "/images/sounds/Rain-on-a-Windowpane-Card.webp", audioUrl: "/sounds/rain-window.mp3", type: 'file' },
      { id: "rain-tent", name: "Rain on a Tent", category: "rain", icon: "⛺", image: "/images/sounds/Rain-on-a-Tent-Card.webp", audioUrl: "/sounds/rain-tent.mp3", type: 'file' },
      { id: "heavy-downpour", name: "Heavy Downpour", category: "rain", icon: "⛈️", image: "/images/sounds/Heavy-Downpour-Card.webp", audioUrl: "/sounds/heavy-downpour.mp3", type: 'file' },
      { id: "rain-tin-roof", name: "Rain on a Tin Roof", category: "rain", icon: "🏠", image: "/images/sounds/Rain-on-a-Tin-Roof-Card.webp", audioUrl: "/sounds/rain-tin-roof.mp3", type: 'file' },
    ],
  },
  {
    id: "thunder",
    name: "Thunder",
    icon: "⚡",
    sounds: [
      { id: "distant-thunder", name: "Distant Thunder Rumble", category: "thunder", icon: "🌩️", image: "/images/sounds/Distant-Thunder-Rumble-Card.webp", audioUrl: "/sounds/distant-thunder.mp3", type: 'file' },
      { id: "rolling-thunder", name: "Rolling Thunder", category: "thunder", icon: "⚡", image: "/images/sounds/Rolling-Thunder-Card.webp", audioUrl: "/sounds/rolling-thunder.mp3", type: 'file' },
    ],
  },
  {
    id: "waterways",
    name: "Waterways",
    icon: "🏞️",
    sounds: [
      { id: "small-stream", name: "Small Stream", category: "waterways", icon: "🌊", image: "/images/sounds/Small-Stream-Card.webp", audioUrl: "/sounds/small-stream.mp3", type: 'file' },
      { id: "babbling-brook", name: "Babbling Brook", category: "waterways", icon: "💦", image: "/images/sounds/Babbling-Brook-Card.webp", audioUrl: "/sounds/babbling-brook.mp3", type: 'file' },
      { id: "gentle-river", name: "Gentle River Flow", category: "waterways", icon: "🏞️", image: "/images/sounds/Gentle-River-Flow-Card.webp", audioUrl: "/sounds/gentle-river.mp3", type: 'file' },
      { id: "large-waterfall", name: "Large, Roaring Waterfall", category: "waterways", icon: "💧", image: "/images/sounds/Large-Roaring-Waterfall-Card.webp", audioUrl: "/sounds/large-waterfall.mp3", type: 'file' },
    ],
  },
  {
    id: "ocean",
    name: "Ocean",
    icon: "🌊",
    sounds: [
      { id: "gentle-waves", name: "Gentle Lapping Waves", category: "ocean", icon: "🌊", image: "/images/sounds/Gentle-Lapping-Waves-Card.webp", audioUrl: "/sounds/gentle-waves.mp3", type: 'file' },
      { id: "calm-waves-beach", name: "Calm Waves on Sandy Beach", category: "ocean", icon: "🏖️", image: "/images/sounds/Calm-Waves-on-Sandy-Beach-Card.webp", audioUrl: "/sounds/calm-waves-beach.mp3", type: 'file' },
      { id: "distant-seagulls", name: "Distant Seagulls Calling", category: "ocean", icon: "🦅", image: "/images/sounds/Distant-Seagulls-Calling-Card.webp", audioUrl: "/sounds/distant-seagulls.mp3", type: 'file' },
      { id: "deep-ocean", name: "Deep Ocean Waves", category: "ocean", icon: "🌊", image: "/images/sounds/Deep-Ocean-Waves-Card.webp", audioUrl: "/sounds/deep-ocean.mp3", type: 'file' },
      { id: "crashing-waves", name: "Crashing Waves on Rocks", category: "ocean", icon: "🪨", image: "/images/sounds/Crashing-Waves-on-Rocks.webp", audioUrl: "/sounds/crashing-waves.mp3", type: 'file' },
      { id: "whale-song", name: "Whale Song", category: "ocean", icon: "🐋", image: "/images/sounds/Whale-Song-Card.webp", audioUrl: "/sounds/whale-song.mp3", type: 'file' },
    ],
  },
  {
    id: "forest",
    name: "Forest",
    icon: "🌲",
    sounds: [
      { id: "temperate-forest", name: "Temperate Forest (Night)", category: "forest", icon: "🌲", image: "/images/sounds/Temperate-Forest-(Night)-Card.webp", audioUrl: "/sounds/temperate-forest.mp3", type: 'file' },
      { id: "wind-pines", name: "Wind Through Pine Trees", category: "forest", icon: "🌬️", image: "/images/sounds/Wind-Through-Pine-Trees-Card.webp", audioUrl: "/sounds/wind-pines.mp3", type: 'file' },
      { id: "swamp-night", name: "Swamp at Night", category: "forest", icon: "🐸", image: "/images/sounds/Swamp-at-Night-Card.webp", audioUrl: "/sounds/swamp-night.mp3", type: 'file' },
    ],
  },
  {
    id: "creatures",
    name: "Creatures",
    icon: "🦉",
    sounds: [
      { id: "owl-hooting", name: "Owl Hooting (Barn Owl)", category: "creatures", icon: "🦉", image: "/images/sounds/Owl-Hooting-(Barn-Owl)-Card.webp", audioUrl: "/sounds/owl-hooting.mp3", type: 'file' },
      { id: "crickets", name: "Crickets Chirping", category: "creatures", icon: "🦗", image: "/images/sounds/Crickets-Chirping-Card.webp", audioUrl: "/sounds/crickets.mp3", type: 'file' },
      { id: "cat-purring", name: "Cat Purring", category: "creatures", icon: "🐱", image: "/images/sounds/Cat-Purring-Card.webp", audioUrl: "/sounds/cat-purring.mp3", type: 'file' },
    ],
  },
  {
    id: "fire",
    name: "Fire",
    icon: "🔥",
    sounds: [
      { id: "small-campfire", name: "Small Campfire", category: "fire", icon: "🔥", image: "/images/sounds/Small-Campfire-Card.webp", audioUrl: "/sounds/small-campfire.mp3", type: 'file' },
      { id: "fireplace", name: "Crackling Fireplace", category: "fire", icon: "🪵", image: "/images/sounds/Crackling-Fireplace-Card.webp", audioUrl: "/sounds/fireplace.mp3", type: 'file' },
    ],
  },
  {
    id: "color-noise",
    name: "Color Noise",
    icon: "📻",
    sounds: [
      { id: "white-noise", name: "White Noise", category: "color-noise", icon: "⚪", image: "/images/sounds/White-Noise-Card.webp", type: 'synthetic', syntheticConfig: { color: 'white' } },
      { id: "pink-noise", name: "Pink Noise", category: "color-noise", icon: "🌸", image: "/images/sounds/Pink-Noise-Card.webp", type: 'synthetic', syntheticConfig: { color: 'pink' } },
      { id: "brown-noise", name: "Brown Noise", category: "color-noise", icon: "🟤", image: "/images/sounds/Brown-Noise-Card.webp", type: 'synthetic', syntheticConfig: { color: 'brown' } },
      { id: "box-fan", name: "Box Fan", category: "color-noise", icon: "💨", image: "/images/sounds/Box-Fan-Card.webp", type: 'synthetic', syntheticConfig: { color: 'white', filter: { type: 'lowpass', freq: 1000 }, modulation: { rate: 0.5, depth: 200 } } },
      { id: "airplane-cabin", name: "Airplane Cabin", category: "color-noise", icon: "✈️", image: "/images/sounds/Airplane-Cabin-Card.webp", type: 'synthetic', syntheticConfig: { color: 'brown', filter: { type: 'lowpass', freq: 2000 } } },
    ],
  },
  {
    id: "ambient",
    name: "Ambient",
    icon: "🎵",
    sounds: [
      { id: "blizzard", name: "Howling Blizzard", category: "ambient", icon: "❄️", image: "/images/sounds/Howling-Blizzard-Card.webp", audioUrl: "/sounds/blizzard.mp3", type: 'file' },
      { id: "coffee-shop", name: "Quiet Coffee Shop Chatter", category: "ambient", icon: "☕", image: "/images/sounds/Quiet-Coffee-Shop-Chatter-Card.webp", audioUrl: "/sounds/coffee-shop.mp3", type: 'file' },
      { id: "grandfather-clock", name: "Grandfather Clock Ticking", category: "ambient", icon: "🕰️", image: "/images/sounds/Grandfather-Clock-Ticking-Card.webp", audioUrl: "/sounds/grandfather-clock.mp3", type: 'file' },
    ],
  },
];
