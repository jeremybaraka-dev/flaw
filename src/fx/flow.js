// Halftone glow: soft red light that drifts in slow rings over black, drawn as a grid of dots whose
// size follows the brightness (like a print or an LED wall), with a faint glow underneath.
// The light bends around the pointer (or finger) and a soft spot follows it.
//
// Two WebGL passes keep it cheap: pass 1 works out the light once per dot (a few thousand
// values), pass 2 draws the dots at full sharpness. It only runs while it is on screen.
import { reduced, touch } from './scroll.js';

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const HEAD = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
`;

// pass 1: the light field, one value per dot
const FIELD = `${HEAD}
uniform vec2 uCells;     // dot grid size
uniform vec2 uSize;      // area size in CSS pixels
uniform float uTime;
uniform vec2 uMouse;     // 0..1
uniform float uPush;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 1.9 + vec2(1.7, 9.2); a *= 0.42; }
  return v / 0.88;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uCells;
  // same blob size on every screen: measured in CSS pixels, not as a share of the section
  vec2 p = (uv - 0.5) * uSize / 760.0;
  vec2 m = (uMouse - 0.5) * uSize / 760.0;

  vec2 dm = p - m;
  float near = exp(-dot(dm, dm) * 5.0);
  p += dm * near * (0.3 + uPush * 0.45);

  float t = uTime * 0.045;
  vec2 q = p * 0.85;
  vec2 w1 = vec2(fbm(q + vec2(0.0, t)), fbm(q + vec2(5.2, -t * 1.2)));
  vec2 w2 = vec2(fbm(q + 1.5 * w1 + vec2(1.7, 9.2) + t * 0.8), fbm(q + 1.5 * w1 + vec2(8.3, 2.8) - t * 0.6));
  float f = fbm(q + 1.4 * w2);

  // slow rings of light with dark hollows, as soft as smoke
  float band = 0.5 + 0.5 * sin(f * 12.0 - t * 2.6);
  float v = smoothstep(0.2, 1.0, band);
  v = v * v * (3.0 - 2.0 * v);
  // large dark regions so the light comes and goes
  float mask = smoothstep(0.28, 0.72, fbm(p * 0.45 + vec2(t * 0.4, 3.1)));
  v *= mix(0.35, 1.0, mask);
  // a soft light follows the pointer
  v += near * (0.28 + uPush * 0.35);

  // calmer at the very top and bottom of the section
  float edge = smoothstep(0.0, 0.14, uv.y) * smoothstep(1.0, 0.86, uv.y);
  v *= mix(0.45, 1.0, edge);

  gl_FragColor = vec4(clamp(v, 0.0, 1.0), 0.0, 0.0, 1.0);
}`;

// pass 2: dots, sized by the light, over a faint glow
const DOTS = `${HEAD}
uniform sampler2D uField;
uniform vec2 uCells;
uniform float uCell;     // dot spacing in device pixels
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uC4;

vec3 ramp(float v) {
  vec3 c = mix(uC0, uC1, smoothstep(0.0, 0.35, v));
  c = mix(c, uC2, smoothstep(0.3, 0.75, v));
  return mix(c, uC3, smoothstep(0.7, 1.0, v));
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 cell = floor(fc / uCell);
  float v = texture2D(uField, (cell + 0.5) / uCells).r;
  float glow = texture2D(uField, fc / uCell / uCells).r;

  float d = length(fc - (cell + 0.5) * uCell);
  // dots grow with the light but never touch, so it always reads as dots on black
  float r = uCell * 0.5 * (0.1 + 0.78 * sqrt(v));
  float a = clamp(r - d + 0.6, 0.0, 1.0);

  vec3 bg = ramp(glow) * glow * 0.14;
  vec3 dotCol = ramp(v) * mix(0.3, 1.0, smoothstep(0.0, 0.3, v));
  // the brightest dots run hot, like the core of a light
  dotCol = mix(dotCol, uC4, smoothstep(0.86, 1.0, v) * 0.55);
  gl_FragColor = vec4(mix(bg, dotCol, a), 1.0);
}`;

// pass 2, glow mode: the light itself, smooth, with fine film grain (no dots)
const GLOW = `${HEAD}
uniform sampler2D uField;
uniform vec2 uCells;
uniform float uCell;
uniform float uTime;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uC4;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

void main() {
  vec2 fc = gl_FragCoord.xy;
  float v = texture2D(uField, fc / uCell / uCells).r;
  v = smoothstep(0.0, 1.0, v);
  vec3 c = mix(uC0, uC1, smoothstep(0.0, 0.35, v));
  c = mix(c, uC2, smoothstep(0.3, 0.72, v));
  c = mix(c, uC3, smoothstep(0.68, 0.95, v));
  c = mix(c, uC4, smoothstep(0.9, 1.0, v) * 0.5);
  c += (hash(fc + fract(uTime * 7.0) * 91.0) - 0.5) * 0.07;
  gl_FragColor = vec4(c, 1.0);
}`;

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

/**
 * Start the halftone glow on `canvas`, filling `host`.
 * colors: five hex colours, black to the hot core of the light.
 * mode: 'dots' (halftone) or 'glow' (smooth light with film grain). dot: spacing in CSS pixels.
 * Returns a function that stops it.
 */
export function flow(canvas, host, { colors = ['#0a0a0b', '#5c060c', '#d8121d', '#ff3d47', '#ffc9cc'], dot = touch ? 7 : 9, mode = 'dots' } = {}) {
  if (mode === 'glow') dot = 10; // the light is blurry, so the field can be coarse
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power' });
  if (!gl) { host.classList.add('no-flow'); return () => {}; }

  const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const program = (frag) => {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, frag));
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  };
  const pField = program(FIELD);
  const pDots = program(mode === 'glow' ? GLOW : DOTS);
  if (!pField || !pDots) { host.classList.add('no-flow'); return () => {}; }

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const U = (p, names) => Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)]));
  const uf = U(pField, ['uCells', 'uSize', 'uTime', 'uMouse', 'uPush']);
  const ud = U(pDots, ['uField', 'uCells', 'uCell', 'uTime', 'uC0', 'uC1', 'uC2', 'uC3', 'uC4']);
  gl.useProgram(pDots);
  colors.forEach((c, i) => gl.uniform3fv(ud[`uC${i}`], hex(c)));
  gl.uniform1i(ud.uField, 0);

  // the light field lives in a small texture, one texel per dot
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fbo = gl.createFramebuffer();

  // pointer, eased; when nobody is pointing the light wanders on its own
  const mouse = { x: 0.5, y: 0.6, tx: 0.5, ty: 0.6, push: 0 };
  let lastMove = -1e9;
  const onMove = (e) => {
    const r = host.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = 1 - (e.clientY - r.top) / r.height;
    mouse.push = Math.min(1, mouse.push + Math.hypot((nx - mouse.tx) * r.width, (ny - mouse.ty) * r.height) / 260);
    mouse.tx = nx; mouse.ty = ny;
    lastMove = performance.now();
  };
  host.addEventListener('pointermove', onMove, { passive: true });
  host.addEventListener('pointerdown', onMove, { passive: true });

  let W = 0, H = 0, cw = 0, ch = 0, cell = 7, cssW = 1, cssH = 1;
  const resize = () => {
    const r = host.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cssW = Math.max(1, r.width); cssH = Math.max(1, r.height);
    cell = Math.max(3, Math.round(dot * dpr));
    W = Math.round(cssW * dpr); H = Math.round(cssH * dpr);
    cw = Math.ceil(W / cell); ch = Math.ceil(H / cell);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cw, ch, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  const t0 = performance.now() - 60000 * Math.random();
  let placed = false;
  const draw = (now) => {
    const idle = now - lastMove > (touch ? 1800 : 2600);
    if (idle) {
      const s = (now - t0) / 1000;
      mouse.tx = 0.5 + Math.sin(s * 0.11) * 0.34;
      mouse.ty = 0.5 + Math.sin(s * 0.17 + 1.3) * 0.3;
      if (touch) {
        // phones: the section is much taller than the screen, so keep the light on the part in view
        const r = host.getBoundingClientRect();
        const mid = (innerHeight * (0.5 + Math.sin(s * 0.23) * 0.25) - r.top) / r.height;
        mouse.ty = 1 - Math.max(0, Math.min(1, mid));
      }
    }
    // phones: when the section first comes into view the light starts on screen instead of drifting in
    if (touch && idle && !placed && running) { placed = true; mouse.x = mouse.tx; mouse.y = mouse.ty; }
    const ease = idle ? (touch ? 0.03 : 0.012) : 0.07;
    mouse.x += (mouse.tx - mouse.x) * ease;
    mouse.y += (mouse.ty - mouse.y) * ease;
    mouse.push *= 0.95;

    // pass 1: light field into the texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, cw, ch);
    gl.useProgram(pField);
    gl.uniform2f(uf.uCells, cw, ch);
    gl.uniform2f(uf.uSize, cssW, cssH);
    gl.uniform1f(uf.uTime, (now - t0) / 1000);
    gl.uniform2f(uf.uMouse, mouse.x, mouse.y);
    gl.uniform1f(uf.uPush, mouse.push);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // pass 2: dots on screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    gl.useProgram(pDots);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform2f(ud.uCells, cw, ch);
    gl.uniform1f(ud.uCell, cell);
    if (ud.uTime) gl.uniform1f(ud.uTime, (now - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  let raf = 0;
  let running = false;
  let inView = false;
  const loop = (now) => { draw(now); raf = requestAnimationFrame(loop); };
  const sync = () => {
    const want = inView && !document.hidden && !reduced;
    if (want && !running) { running = true; raf = requestAnimationFrame(loop); }
    if (!want && running) { running = false; cancelAnimationFrame(raf); }
  };
  const ro = new ResizeObserver(() => { resize(); if (!running) draw(performance.now()); });
  ro.observe(host);
  resize();
  const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { rootMargin: '80px' });
  io.observe(host);
  document.addEventListener('visibilitychange', sync);
  draw(performance.now()); // reduced motion keeps this one still frame
  host.classList.add('has-flow');

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener('visibilitychange', sync);
    host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerdown', onMove);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
