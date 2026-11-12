import './fx/scroll.js';
import { initCursor } from './fx/cursor.js';
import { runLoader } from './fx/loader.js';
import { initDrawer } from './components/drawer.js';
import { initChrome } from './components/chrome.js';
import { startRouter } from './router.js';
import { watchImages } from './img.js';

watchImages();

// Wait (briefly) for the two main fonts before building the page. Laying the text out in a
// fallback font first and again when the real font lands was the single slowest thing at startup.
// The dark loader background is already on screen from index.html while this happens.
const want = ['900 1em "Archivo Variable"', '500 1em "JetBrains Mono Variable"', '400 1em "Saira Stencil One"'];
const loads = want.map((f) => document.fonts.load(f, 'FLAW 0123').catch(() => {}));

Promise.race([Promise.all(loads.slice(0, 2)), new Promise((r) => setTimeout(r, 1200))]).then(() => {
  initDrawer();
  initChrome();
  initCursor();
  const enter = startRouter();
  runLoader(enter);
});
