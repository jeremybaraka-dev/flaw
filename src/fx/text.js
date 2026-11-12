/** Wrap each word of a string in a masked span so it can slide up into view. */
export function words(str, cls = '') {
  return str
    .split(' ')
    .map((w) => `<span class="w ${cls}"><i>${w}</i></span>`)
    .join(' ');
}

const GLYPHS = '█▓▒░#/\\<>*+=0123456789';

/** Decode-style scramble on hover for small mono labels. */
export function scramble(el) {
  const final = el.dataset.text || el.textContent;
  el.dataset.text = final;
  let frame = 0;
  cancelAnimationFrame(el._raf);
  const total = final.length * 2 + 6;
  const tick = () => {
    frame++;
    const solved = Math.floor(frame / 2);
    el.textContent = final
      .split('')
      .map((ch, i) => (i < solved || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
      .join('');
    if (frame < total) el._raf = requestAnimationFrame(tick);
    else el.textContent = final;
  };
  tick();
}

export function bindScramble(root = document) {
  root.querySelectorAll('[data-scramble]').forEach((el) => {
    if (el._scr) return;
    el._scr = true;
    el.addEventListener('mouseenter', () => scramble(el.querySelector('[data-scramble-t]') || el));
  });
}

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
