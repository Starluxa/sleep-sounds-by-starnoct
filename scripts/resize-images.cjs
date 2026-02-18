/**
 * Batch-resize images in public/images/sounds into public/images/sounds/optimized
 * Usage: node scripts/resize-images.cjs
 *
 * This script uses sharp to generate medium and small WebP variants for each image.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'sounds');
const OUT_DIR = path.join(INPUT_DIR, 'optimized');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const sizes = [
  { suffix: '380w', width: 380 },
  { suffix: '760w', width: 760 }
];

async function processFile(file) {
  const inputPath = path.join(INPUT_DIR, file);
  const baseName = path.parse(file).name; // without ext
  for (const s of sizes) {
    const outName = `${baseName}-${s.suffix}.webp`;
    const outPath = path.join(OUT_DIR, outName);
    try {
      await sharp(inputPath)
        .resize({ width: s.width, withoutEnlargement: true })
        .webp({ quality: 65 })
        .toFile(outPath);
      console.log('Wrote', outPath);
    } catch (err) {
      console.error('Failed', inputPath, err);
    }
  }
}

(async () => {
  const files = fs.readdirSync(INPUT_DIR).filter(f => /\.(jpe?g|png|webp)$/i.test(f) && f !== 'optimized');
  for (const f of files) {
    await processFile(f);
  }
  console.log('Done');
})();