// Renders an image as print-style halftone dots on a canvas.
// set(p): p=0 sparse dots, p=1 dots fully grown (the photo underneath can then be faded in).

export function halftone(canvas, src, { color = '#0a0a0b', cell = 8, invert = false } = {}) {
  const ctx = canvas.getContext('2d');
  const img = new Image();
  let lum = null;
  let cols = 0;
  let rows = 0;
  let step = cell;
  let p = 0;
  let dead = false;

  const sample = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h || !img.naturalWidth) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    step = cell * dpr;
    cols = Math.ceil(canvas.width / step);
    rows = Math.ceil(canvas.height / step);

    const off = document.createElement('canvas');
    off.width = cols;
    off.height = rows;
    const o = off.getContext('2d', { willReadFrequently: true });
    // object-fit: cover
    const s = Math.max(cols / img.naturalWidth, rows / img.naturalHeight);
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    o.drawImage(img, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
    const data = o.getImageData(0, 0, cols, rows).data;
    lum = new Float32Array(cols * rows);
    for (let i = 0; i < lum.length; i++) {
      const l = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114) / 255;
      lum[i] = invert ? l : 1 - l;
    }
    draw();
  };

  const draw = () => {
    if (!lum) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.beginPath();
    const grow = 0.18 + p * 1.05;
    const max = step * 0.74;
    for (let r = 0; r < rows; r++) {
      const ox = r % 2 ? step / 2 : 0; // staggered rows, like a real screen
      for (let c = 0; c < cols; c++) {
        const v = lum[r * cols + c];
        const rad = Math.min(max, (step / 2) * Math.pow(v, 0.85) * grow * 1.5);
        if (rad < 0.35) continue;
        const cx = c * step + ox + step / 2;
        const cy = r * step + step / 2;
        ctx.moveTo(cx + rad, cy);
        ctx.arc(cx, cy, rad, 0, 6.2832);
      }
    }
    ctx.fill();
  };

  img.onload = () => { if (!dead) sample(); };
  img.src = src;
  const ro = new ResizeObserver(() => sample());
  ro.observe(canvas);

  return {
    set(v) {
      const n = Math.max(0, Math.min(1, v));
      if (Math.abs(n - p) < 0.004) return;
      p = n;
      draw();
    },
    destroy() {
      dead = true;
      ro.disconnect();
    },
  };
}
