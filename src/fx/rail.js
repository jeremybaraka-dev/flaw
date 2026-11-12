// The clothing rail: garments hang from a steel bar, drift slowly, can be dragged,
// and swing on their hangers with spring physics when the rail (or the cursor) moves them.
import { gsap, lenis, reduced } from './scroll.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function initRail(rail) {
  const track = rail.querySelector('.rail__track');
  const hangs = [...track.querySelectorAll('.hang')];
  const half = hangs.length / 2; // the set is rendered twice for a seamless loop
  const bodies = hangs.map((el, i) => ({
    el,
    a: 0, // angle (deg)
    w: 0, // angular velocity
    k: 0.03 + ((i * 7) % 5) * 0.006, // stiffness
    d: 0.925 + ((i * 3) % 4) * 0.012, // damping
    phase: i * 1.7,
  }));

  let W = 1;
  const measure = () => { W = hangs[half].offsetLeft - hangs[0].offsetLeft || 1; };
  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(track);

  const IDLE = reduced ? 0 : -0.5; // px per frame
  let x = 0;
  let vx = reduced ? 0 : -46; // entry: the rail slides in fast and the garments swing to rest
  let prevVx = vx;
  let dragging = false;
  let hover = false;
  let lastX = 0;
  let moved = 0;
  let visible = true;

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(rail);

  const onDown = (e) => {
    if (e.button) return;
    dragging = true;
    moved = 0;
    lastX = e.clientX;
    rail.classList.add('is-dragging');
  };
  const onMove = (e) => {
    if (dragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      x += dx;
      vx = vx * 0.6 + dx * 0.4;
      return;
    }
    // brushing a garment with the cursor nudges it
    const h = e.target.closest?.('.hang');
    if (h && e.pointerType === 'mouse') {
      const b = bodies[hangs.indexOf(h)];
      if (b) b.w += clamp(e.movementX * -0.035, -1.6, 1.6);
    }
  };
  const onUp = () => {
    dragging = false;
    rail.classList.remove('is-dragging');
  };
  const onClick = (e) => {
    if (moved > 8) { e.preventDefault(); e.stopPropagation(); }
  };
  const onEnter = () => { hover = true; };
  const onLeave = () => { hover = false; };
  const onScroll = ({ velocity }) => {
    if (!visible) return;
    const kick = clamp(velocity * 0.012, -0.9, 0.9);
    bodies.forEach((b, i) => { b.w += kick * (i % 2 ? 1 : 0.6); });
  };

  rail.addEventListener('pointerdown', onDown);
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerup', onUp);
  addEventListener('pointercancel', onUp);
  rail.addEventListener('click', onClick, true);
  rail.addEventListener('mouseenter', onEnter);
  rail.addEventListener('mouseleave', onLeave);
  rail.addEventListener('dragstart', (e) => e.preventDefault());
  lenis.on('scroll', onScroll);

  const tick = (time) => {
    if (!visible) return;
    if (!dragging) {
      vx += ((hover ? 0 : IDLE) - vx) * 0.035;
      x += vx;
    }
    if (x <= -W) x += W;
    if (x > 0) x -= W;
    track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;

    const accel = vx - prevVx;
    prevVx = vx;
    const lean = clamp(vx * 0.55, -24, 24);
    for (const b of bodies) {
      b.w += (lean - b.a) * b.k + accel * 0.22;
      b.w *= b.d;
      b.a = clamp(b.a + b.w, -38, 38);
      const idle = reduced ? 0 : Math.sin(time * 1.1 + b.phase) * 0.7;
      b.el.style.transform = `rotate(${(b.a + idle).toFixed(3)}deg)`;
    }
    if (dragging) vx *= 0.9;
  };
  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    ro.disconnect();
    io.disconnect();
    lenis.off('scroll', onScroll);
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerup', onUp);
    removeEventListener('pointercancel', onUp);
  };
}
