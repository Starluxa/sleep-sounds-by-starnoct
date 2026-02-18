import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

async function analyze() {
  const dir = 'public/images/sounds';
  const files = readdirSync(dir).filter(f => f.endsWith('.webp') && !f.startsWith('optimized-'));
  // sample 5
  const samples = files.slice(0,5);
  console.log('Analyzing base images:');
  const results = [];
  for (const file of samples) {
    const fullpath = join(dir, file);
    const stats = statSync(fullpath);
    const metadata = await sharp(fullpath).metadata();
    const ratio = metadata.width / metadata.height;
    results.push({
      file,
      width: metadata.width,
      height: metadata.height,
      ratio: ratio.toFixed(4),
      sizeKB: (stats.size / 1024).toFixed(1)
    });
    console.log(`${file}: ${metadata.width}x${metadata.height}, ratio ${ratio.toFixed(4)}, ${(stats.size / 1024).toFixed(1)}KB`);
  }
  // average
  const avgW = results.reduce((a,b) => a + b.width, 0) / results.length;
  const avgH = results.reduce((a,b) => a + b.height, 0) / results.length;
  const avgR = results.reduce((a,b) => a + parseFloat(b.ratio), 0) / results.length;
  const avgS = results.reduce((a,b) => a + parseFloat(b.sizeKB), 0) / results.length;
  console.log(`\nAverages: ${avgW.toFixed(0)}x${avgH.toFixed(0)}, ratio ${avgR.toFixed(4)}, ${avgS.toFixed(1)}KB`);
  // optimized sample
  const optDir = join(dir, 'optimized');
  const optFiles = readdirSync(optDir).filter(f => f.endsWith('-380w.webp') || f.endsWith('-760w.webp'));
  console.log('\nOptimized samples:');
  for (const file of optFiles.slice(0,2)) {
    const fullpath = join(optDir, file);
    const stats = statSync(fullpath);
    const metadata = await sharp(fullpath).metadata();
    console.log(`${file}: ${metadata.width}x${metadata.height}, ${(stats.size / 1024).toFixed(1)}KB`);
  }
}

analyze().catch(console.error);