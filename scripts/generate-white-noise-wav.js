import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const sampleRate = 44100;
const duration = 30;
const numChannels = 1;
const bitsPerSample = 16;
const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
const blockAlign = numChannels * (bitsPerSample / 8);
const numSamples = sampleRate * duration;
const dataSize = numSamples * numChannels * 2;
const totalSize = 44 + dataSize;

const buffer = Buffer.alloc(totalSize);

buffer.write('RIFF', 0, 4);
buffer.writeUInt32LE(totalSize - 8, 4);
buffer.write('WAVE', 8, 4);
buffer.write('fmt ', 12, 4);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(bitsPerSample, 34);
buffer.write('data', 36, 4);
buffer.writeUInt32LE(dataSize, 40);

// Generate white noise
for (let i = 0; i < numSamples; i++) {
  const sample = (Math.random() * 2 - 1) * 32767;
  buffer.writeInt16LE(sample, 44 + i * 2);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(__dirname, '../public/sounds/white-noise.wav');
fs.writeFileSync(outputPath, buffer);
console.log(`Generated white-noise.wav at ${outputPath}`);