import './fx/scroll.js';
import { initCursor } from './fx/cursor.js';
import { runLoader } from './fx/loader.js';
import { initDrawer } from './components/drawer.js';
import { initChrome } from './components/chrome.js';
import { startRouter } from './router.js';

initDrawer();
initChrome();
initCursor();
const enter = startRouter();
runLoader(enter);
