// Builds the web images from the full-size sources.
// Every image is written in several widths, as AVIF (small, modern browsers) and WebP (fallback),
// and src/data/images.json records which widths exist so the site can build srcsets.
// Run with: npm run images
import sharp from 'sharp';
import { readdir, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jobs = [
  // product mockups: transparent PNGs, trimmed to the garment
  { from: 'raw/products', to: 'products', widths: [360, 640, 960], trim: true },
  // campaign / lineup photos
  { from: 'influencers', to: 'lineup', widths: [480, 800, 1200] },
];
const AVIF = { quality: 52, effort: 5 };
const WEBP = { quality: 78, effort: 6, alphaQuality: 90 };

const manifest = {};
let total = 0;
for (const job of jobs) {
  const src = path.join(root, job.from);
  const out = path.join(root, 'public', job.to);
  let files = [];
  try {
    files = (await readdir(src)).filter((f) => /\.(png|jpe?g)$/i.test(f));
  } catch {
    console.warn(`skipped ${job.from} (folder not found)`);
    continue;
  }
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  for (const f of files) {
    const name = f.replace(/\.(png|jpe?g)$/i, '').replace(/[^a-z0-9_-]+/gi, '-');
    let base = sharp(path.join(src, f));
    if (job.trim) base = sharp(await base.trim({ threshold: 4 }).toBuffer());
    const meta = await base.metadata();
    const widths = [...new Set(job.widths.map((w) => Math.min(w, meta.width)))];
    const done = [];
    for (const w of widths) {
      const img = base.clone().resize({ width: w, withoutEnlargement: true });
      const a = await img.clone().avif(AVIF).toFile(path.join(out, `${name}-${w}.avif`));
      const b = await img.clone().webp(WEBP).toFile(path.join(out, `${name}-${w}.webp`));
      total += a.size + b.size;
      done.push(w);
    }
    manifest[`/${job.to}/${name}`] = { w: done, ar: +(meta.width / meta.height).toFixed(4) };
  }
  console.log(`${job.to}: ${files.length} images`);
}
await writeFile(path.join(root, 'src/data/images.json'), JSON.stringify(manifest, null, 0) + '\n');
console.log(`wrote ${Object.keys(manifest).length} entries, ${(total / 1024 / 1024).toFixed(1)} MB in total`);
