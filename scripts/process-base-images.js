import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const soundsDir = 'public/images/sounds';
if (!existsSync(soundsDir)) {
  mkdirSync(soundsDir, { recursive: true });
}

const images = [
  { src: 'Asset Dump/Brown Noise Card.png', dst: 'Brown-Noise-Card.webp' },
  { src: 'Asset Dump/Box Fan Card.png', dst: 'Box-Fan-Card.webp' },
  { src: 'Asset Dump/Airplane Cabin Card.png', dst: 'Airplane-Cabin-Card.webp' },
];

async function processImages() {
  for (const img of images) {
    const outputPath = join(soundsDir, img.dst);
    await sharp(img.src)
      .resize(1600, 900, { fit: 'cover', position: 'centre' })
      .webp({ quality: 85, effort: 4 })
      .toFile(outputPath);
    console.log(`Processed: ${img.dst}`);
  }
  console.log('All base images processed.');
}

processImages().catch(console.error);