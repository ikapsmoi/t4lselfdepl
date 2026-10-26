import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const outputDirectory = resolve('public/optimized');
const images = [
  ['ChatGPT Image Mar 18, 2026, 06_04_06 PM.png', 'hero-beach', 960],
  ['ChatGPT Image Mar 18, 2026, 05_59_31 PM.png', 'hero-mountain', 960],
  ['ChatGPT Image Mar 18, 2026, 05_31_27 PM.png', 'hero-city', 1440],
  ['ChatGPT Image Mar 18, 2026, 05_30_22 PM.png', 'hero-wildlife', 1440],
  ['tml1.jpeg', 'tml1', 1200],
  ['edc1.jpeg', 'edc1', 1200],
  ['amster1.jpeg', 'amster1', 1200],
  ['salzburg1.jpeg', 'salzburg1', 1200],
  ['winter1.jpeg', 'winter1', 1200],
  ['logo-new.png', 'logo', 128],
  // Preserve the recoverable package artwork despite legacy PNG chunk warnings.
  ['pkg1.png', 'pkg1', 960, 'none'],
  ['pkg3.png', 'pkg3', 960, 'none'],
];

await mkdir(outputDirectory, { recursive: true });

for (const [sourceName, outputName, width, failOn = 'warning'] of images) {
  await sharp(resolve('public', sourceName), { failOn })
    .rotate()
    .resize({
      width,
      height: outputName === 'hero-mountain' ? width * 1.5 : width,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: outputName === 'hero-beach' ? 45 : outputName === 'hero-mountain' ? 60 : 74, effort: 5 })
    .toFile(resolve(outputDirectory, `${outputName}.webp`));
}

console.log(`Optimized ${images.length} static images into ${outputDirectory}.`);
