/**
 * Noise generation utilities for synthetic audio buffers
 * Generates 5-second stereo AudioBuffers for white, pink, and brown noise
 * with proper gain compensation and CPU-efficient looping
 */

export type NoiseColor = 'white' | 'pink' | 'brown';

/**
 * Creates a 5-second stereo AudioBuffer filled with the specified noise color
 * @param audioContext - The AudioContext to create the buffer with
 * @param color - The noise color to generate ('white', 'pink', or 'brown')
 * @returns AudioBuffer ready for looping playback
 */
export function createNoiseBuffer(audioContext: AudioContext, color: NoiseColor): AudioBuffer {
  const duration = 5; // 5 seconds
  const sampleRate = audioContext.sampleRate;
  const length = Math.floor(duration * sampleRate);
  const buffer = audioContext.createBuffer(2, length, sampleRate); // Stereo

  // Generate noise for each channel
  for (let channel = 0; channel < 2; channel++) {
    const channelData = buffer.getChannelData(channel);

    switch (color) {
      case 'white':
        generateWhiteNoise(channelData);
        break;
      case 'pink':
        generatePinkNoise(channelData);
        break;
      case 'brown':
        generateBrownNoise(channelData);
        break;
    }
  }

  return buffer;
}

/**
 * Generates white noise: uniform random distribution
 */
function generateWhiteNoise(channelData: Float32Array): void {
  for (let i = 0; i < channelData.length; i++) {
    channelData[i] = Math.random() * 2 - 1;
  }
}

/**
 * Generates pink noise using Paul Kellett's algorithm
 * with b0-b6 state variables and gain compensation
 */
function generatePinkNoise(channelData: Float32Array): void {
  // Paul Kellett's pink noise algorithm state variables
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < channelData.length; i++) {
    const white = Math.random() * 2 - 1;

    // Pink noise filter
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;

    // Gain compensation to match white noise levels
    channelData[i] = pink * 0.11;
  }
}

/**
 * Generates brown noise: integrated random walk
 * with gain compensation
 */
function generateBrownNoise(channelData: Float32Array): void {
  let lastOut = 0;

  for (let i = 0; i < channelData.length; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;

    // Gain compensation to match white noise levels
    channelData[i] = lastOut * 3.5;
  }
}