// Onboarding TypeScript types

export interface OnboardingData {
  completed: boolean;
  completedAt: string | null;
  skipped: boolean;
  stepsCompleted: number[];
  version: string;
}

export interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  activeDemoSounds: string[];
  isComplete: boolean;
  hasSkipped: boolean;
  currentInstruction: string | null;
  instructionStep: number;
}

export type OnboardingStep = 'welcome' | 'interactive' | 'limits' | 'final';

export interface OnboardingSound {
  id: string;
  name: string;
  icon: string;
  audioUrl: string;
  image: string;
}

export const ONBOARDING_VERSION = '1.0.0';
export const ONBOARDING_STORAGE_KEY = 'starnoct-onboarding-v1';

export const ONBOARDING_SOUNDS: OnboardingSound[] = [
  {
    id: 'light-drizzle',
    name: 'Light Drizzle',
    icon: '🌧️',
    audioUrl: '/sounds/light-drizzle.mp3',
    image: '/images/sounds/Light-Drizzle-Card.webp'
  },
  {
    id: 'gentle-river',
    name: 'Gentle River Flow',
    icon: '🏞️',
    audioUrl: '/sounds/gentle-river.mp3',
    image: '/images/sounds/Gentle-River-Flow-Card.webp'
  },
  {
    id: 'cat-purring',
    name: 'Cat Purring',
    icon: '🐱',
    audioUrl: '/sounds/cat-purring.mp3',
    image: '/images/sounds/Cat-Purring-Card.webp'
  },
  {
    id: 'white-noise',
    name: 'White Noise',
    icon: '📻',
    audioUrl: '/sounds/white-noise.wav',
    image: '/images/sounds/White-Noise-Card.webp'
  }
];

export const ONBOARDING_INSTRUCTIONS = [
  {
    step: 0,
    text: "Your turn to be the DJ of dreams. Tap a sound to start your mix."
  },
  {
    step: 1,
    text: "Cozy, right? Now add another layer."
  },
  {
    step: 2,
    text: "Perfect. Use the sliders to get the balance just right."
  }
];