import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const soundsDir = 'public/images/sounds';
const optDir = join(soundsDir, 'optimized');
if (!existsSync(optDir)) {
  mkdirSync(optDir, { recursive: true });
}

const bases = [
  'Brown-Noise-Card.webp',
  'Box-Fan-Card.webp',
  'Airplane-Cabin-Card.webp',
];

const sizes = [
  {width:380, height:214, suffix:'380w'},
  {width:760, height:428, suffix:'760w'},
];

async function processOptimized() {
  for (const base of bases) {
    const inputPath = join(soundsDir, base);
    const name = base.replace('.webp', '');
    for (const size of sizes) {
      const outputPath = join(optDir, `${name}-${size.suffix}.webp`);
      await sharp(inputPath)
        .resize(size.width, size.height, { fit: 'cover', position: 'centre' })
        .webp({ quality: 85, effort: 4 })
        .toFile(outputPath);
      console.log(`Processed: ${name}-${size.suffix}.webp`);
    }
  }
  console.log('All optimized images processed.');
}

processOptimized().catch(console.error);