// Speed test: runs Google's Lighthouse against the site twice, once as a mid-range phone on
// slow 4G and once as a desktop, and prints the numbers that matter.
// Needs Google Chrome installed. The first run downloads Lighthouse, so give it a minute.
//
//   npm run speed                                   (tests the live site)
//   npm run speed -- http://localhost:4173          (tests a local `npm run preview`)
//   npm run speed -- https://flaw-sigma.vercel.app/shop
import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const url = process.argv[2] || 'https://flaw-sigma.vercel.app/';
const dir = mkdtempSync(path.join(tmpdir(), 'fe-speed-'));

const RUNS = [
  ['Phone (mid-range, slow 4G)', ''],
  ['Desktop', '--preset=desktop'],
];
// what Google counts as "good" for each measure
const GOOD = { 'first-contentful-paint': 1800, 'largest-contentful-paint': 2500, 'total-blocking-time': 200, 'cumulative-layout-shift': 0.1, 'speed-index': 3400 };
const LABEL = {
  'first-contentful-paint': 'First paint',
  'largest-contentful-paint': 'Main content shown',
  'speed-index': 'Speed index',
  'total-blocking-time': 'Time the page is frozen',
  'cumulative-layout-shift': 'Layout shift',
};

console.log(`\nSpeed test for ${url}\n`);
let failed = false;
for (const [name, preset] of RUNS) {
  const out = path.join(dir, `${name.split(' ')[0].toLowerCase()}.json`);
  try {
    execSync(
      `npx --yes lighthouse@12 "${url}" ${preset} --only-categories=performance --output=json --output-path="${out}" --quiet --chrome-flags="--headless=new --no-first-run"`,
      { stdio: ['ignore', 'ignore', 'pipe'], timeout: 240000 },
    );
    const r = JSON.parse(readFileSync(out, 'utf8'));
    const score = Math.round(r.categories.performance.score * 100);
    console.log(`${name}: ${score} / 100  ${score >= 90 ? '(fast)' : score >= 50 ? '(needs work)' : '(slow)'}`);
    for (const id of Object.keys(LABEL)) {
      const a = r.audits[id];
      const ok = a.numericValue <= GOOD[id];
      console.log(`  ${LABEL[id].padEnd(26)} ${String(a.displayValue).padEnd(10)} ${ok ? 'good' : 'over the target'}`);
    }
    const weight = r.audits['total-byte-weight']?.numericValue;
    if (weight) console.log(`  ${'Download on first load'.padEnd(26)} ${(weight / 1024 / 1024).toFixed(2)} MB`);
    console.log('');
  } catch (e) {
    failed = true;
    console.error(`${name}: the test could not run.\n${String(e.stderr || e.message).trim().split('\n').slice(-3).join('\n')}\n`);
  }
}
rmSync(dir, { recursive: true, force: true });
console.log('Scores move a few points between runs. For real phones on real networks, also try https://pagespeed.web.dev');
process.exit(failed ? 1 : 0);
