// Builds the web images from the full-size sources.
// Every image is written in several widths, as AVIF (small, modern browsers) and WebP (fallback),
// and src/data/images.json records which widths exist so the site can build srcsets.
// Pictures that have not changed since the last run are skipped, so adding one photo takes seconds.
// Run with: npm run images          (only new or changed pictures)
//           npm run images -- --all (rebuild everything)
import sharp from 'sharp';
import { readdir, mkdir, rm, stat, readFile, writeFile } from 'node:fs/promises';
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

const force = process.argv.includes('--all');
const manifestPath = path.join(root, 'src/data/images.json');
let old = {};
try { old = JSON.parse(await readFile(manifestPath, 'utf8')); } catch { /* first run */ }
const mtime = async (p) => { try { return (await stat(p)).mtimeMs; } catch { return 0; } };

const manifest = {};
let total = 0;
let built = 0;
for (const job of jobs) {
  const src = path.join(root, job.from);
  const out = path.join(root, 'public', job.to);
  let files = [];
  try {
    files = (await readdir(src)).filter((f) => /\.(png|jpe?g)$/i.test(f));
  } catch {
    // Source folder missing (a fresh clone, for example): keep what is already published.
    console.warn(`skipped ${job.from} (folder not found)`);
    for (const [k, v] of Object.entries(old)) if (k.startsWith(`/${job.to}/`)) manifest[k] = v;
    continue;
  }
  await mkdir(out, { recursive: true });
  const keep = new Set();
  for (const f of files) {
    const name = f.replace(/\.(png|jpe?g)$/i, '').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '');
    const key = `/${job.to}/${name}`;
    const names = (ws) => ws.flatMap((w) => [`${name}-${w}.avif`, `${name}-${w}.webp`]);

    if (!force && old[key]) {
      const srcTime = await mtime(path.join(src, f));
      const times = await Promise.all(names(old[key].w).map((n) => mtime(path.join(out, n))));
      if (times.every((t) => t >= srcTime)) {
        manifest[key] = old[key];
        names(old[key].w).forEach((n) => keep.add(n));
        continue;
      }
    }

    let base = sharp(path.join(src, f));
    if (job.trim) base = sharp(await base.trim({ threshold: 4 }).toBuffer());
    const meta = await base.metadata();
    const widths = [...new Set(job.widths.map((w) => Math.min(w, meta.width)))];
    for (const w of widths) {
      const img = base.clone().resize({ width: w, withoutEnlargement: true });
      const a = await img.clone().avif(AVIF).toFile(path.join(out, `${name}-${w}.avif`));
      const b = await img.clone().webp(WEBP).toFile(path.join(out, `${name}-${w}.webp`));
      total += a.size + b.size;
    }
    manifest[key] = { w: widths, ar: +(meta.width / meta.height).toFixed(4) };
    names(widths).forEach((n) => keep.add(n));
    built += 1;
    console.log(`  built ${job.to}/${name}`);
  }
  // clear out sizes that no longer belong to any source picture
  for (const f of await readdir(out)) if (!keep.has(f)) await rm(path.join(out, f));
  console.log(`${job.to}: ${files.length} images`);
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 0) + '\n');
console.log(`${built} rebuilt, ${Object.keys(manifest).length - built} unchanged (${(total / 1024 / 1024).toFixed(1)} MB written)`);
