// Flowing gradient background: big soft blobs of colour that drift on their own and bend around the
// pointer. Drawn with a small WebGL shader at reduced resolution (it is blurry by nature, so nobody
// can tell), and only while it is on screen.
import { reduced, touch } from './scroll.js';

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uPush;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
varying vec2 vUv;

// value noise + fbm
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
  float aspect = uRes.x / uRes.y;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);

  // the pointer pushes the field outwards, like a finger through smoke
  vec2 dm = p - m;
  float near = exp(-dot(dm, dm) * 3.2);
  p += dm * near * (0.35 + uPush * 0.5);

  float t = uTime * 0.05;
  vec2 q = p * 0.62;
  vec2 w1 = vec2(fbm(q + vec2(0.0, t)), fbm(q + vec2(5.2, -t * 1.2)));
  vec2 w2 = vec2(fbm(q + 1.7 * w1 + vec2(1.7, 9.2) + t * 0.9), fbm(q + 1.7 * w1 + vec2(8.3, 2.8) - t * 0.7));
  float f = fbm(q + 1.6 * w2);

  // a few broad bands that wind through the field: bright ridges, near-black hollows
  float band = 0.5 + 0.5 * sin(f * 15.0 - t * 3.0);
  float ridge = smoothstep(0.18, 1.0, band);
  ridge = pow(ridge, 1.35);
  ridge = clamp(ridge + near * 0.2, 0.0, 1.0);

  vec3 col = mix(uC0, uC1, smoothstep(0.0, 0.35, ridge));
  col = mix(col, uC2, smoothstep(0.3, 0.75, ridge));
  col = mix(col, uC3, smoothstep(0.72, 1.0, ridge));

  // soft fade to black at the top and bottom so the section edges stay calm
  float edge = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
  col *= mix(0.55, 1.0, edge);

  // a little grain so the gradient never bands
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.035;
  gl_FragColor = vec4(col, 1.0);
}`;

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

/**
 * Start the gradient on `canvas`, filling `host`.
 * colors: four hex colours from darkest to brightest.
 * Returns a function that stops it.
 */
export function flow(canvas, host, { colors = ['#060203', '#4a0408', '#c4121c', '#ff7a2a'], scale = 0.45 } = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) { host.classList.add('no-flow'); return () => {}; }

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { host.classList.add('no-flow'); return () => {}; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (n) => gl.getUniformLocation(prog, n);
  const uRes = u('uRes'), uTime = u('uTime'), uMouse = u('uMouse'), uPush = u('uPush');
  colors.forEach((c, i) => gl.uniform3fv(u(`uC${i}`), hex(c)));

  // pointer, eased; when nobody is pointing it wanders on its own
  const mouse = { x: 0.5, y: 0.55, tx: 0.5, ty: 0.55, push: 0, active: 0 };
  let lastMove = -1e9;
  const onMove = (e) => {
    const r = host.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = 1 - (e.clientY - r.top) / r.height;
    mouse.push = Math.min(1, mouse.push + Math.hypot(nx - mouse.tx, ny - mouse.ty) * 6);
    mouse.tx = nx; mouse.ty = ny;
    lastMove = performance.now();
  };
  host.addEventListener('pointermove', onMove, { passive: true });
  host.addEventListener('pointerdown', onMove, { passive: true });

  let w = 0, h = 0;
  const resize = () => {
    const r = host.getBoundingClientRect();
    const k = Math.min(scale, 900 / Math.max(1, r.width));
    w = Math.max(2, Math.round(r.width * k));
    h = Math.max(2, Math.round(r.height * k));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  };
  const ro = new ResizeObserver(() => { resize(); if (!running) draw(performance.now()); });
  ro.observe(host);
  resize();

  const t0 = performance.now() - 40000 * Math.random();
  const draw = (now) => {
    const idle = now - lastMove > (touch ? 1800 : 2600);
    if (idle) {
      // slow figure-eight when nobody is steering
      const s = (now - t0) / 1000;
      mouse.tx = 0.5 + Math.sin(s * 0.13) * 0.32;
      mouse.ty = 0.5 + Math.sin(s * 0.21 + 1.3) * 0.26;
    }
    const ease = idle ? 0.015 : 0.06;
    mouse.x += (mouse.tx - mouse.x) * ease;
    mouse.y += (mouse.ty - mouse.y) * ease;
    mouse.push *= 0.955;
    gl.uniform1f(uTime, (now - t0) / 1000);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uPush, mouse.push);
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
  const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { rootMargin: '80px' });
  io.observe(host);
  document.addEventListener('visibilitychange', sync);
  draw(performance.now()); // reduced motion: one still frame
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
