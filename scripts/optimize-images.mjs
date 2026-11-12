// Converts the raw store / influencer images into web-sized WebP files.
// Run with: npm run images
import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jobs = [
  { from: 'influencers', to: 'public/lineup', width: 1100, quality: 80 },
  { from: 'raw/products', to: 'public/products', width: 900, quality: 84, trim: true },
];

for (const job of jobs) {
  const src = path.join(root, job.from);
  const out = path.join(root, job.to);
  await mkdir(out, { recursive: true });
  let files = [];
  try { files = (await readdir(src)).filter((f) => /\.(png|jpe?g)$/i.test(f)); } catch { continue; }
  for (const f of files) {
    const name = f.replace(/\.(png|jpe?g)$/i, '').replace(/[^a-z0-9_-]+/gi, '-');
    let img = sharp(path.join(src, f));
    if (job.trim) img = img.trim({ threshold: 4 });
    const info = await img
      .resize({ width: job.width, height: job.width, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: job.quality, alphaQuality: 90 })
      .toFile(path.join(out, `${name}.webp`));
    console.log(`${job.to}/${name}.webp ${info.width}x${info.height} ${(info.size / 1024) | 0}KB`);
  }
}
