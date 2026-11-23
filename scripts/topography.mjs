// Generates src/styles/themes/topography.svg, the contour-line pattern on
// title slides: a height map with a main peak right of centre and a second
// peak in the top-right corner, traced into evenly spaced contour lines.
// The left of the slide is left clear for the title.
//
//   npm install --no-save d3-contour
//   node scripts/topography.mjs > src/styles/themes/topography.svg
import { contours } from 'd3-contour';

const W = 1000, H = 600; // viewBox
const PAD = 80; // sample past the edges so lines run off the slide instead of closing along it
const STEP = 5; // grid spacing in viewBox units
const MIN_GAP = 12; // spacing of points kept along each line
const nx = Math.ceil((W + 2 * PAD) / STEP) + 1;
const ny = Math.ceil((H + 2 * PAD) / STEP) + 1;

// Peaks: centre, radii, height, and rotation of the long axis (radians).
const PEAKS = [
  { x: 740, y: 360, rx: 270, ry: 230, h: 1.0, rot: -0.6 },
  { x: 965, y: 60, rx: 140, ry: 110, h: 0.55, rot: 0.3 },
  { x: 1050, y: 330, rx: 90, ry: 160, h: 0.4, rot: 0 },
];

// Seeded value noise to make the rings irregular.
function rng(seed) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}
const rand = rng(7);
const G = 8;
const grid = Array.from({ length: (G + 1) ** 2 }, rand);
const smooth = (t) => t * t * (3 - 2 * t);
function noise(x, y) {
  const fx = (x / (W + 2 * PAD)) * G, fy = (y / (H + 2 * PAD)) * G;
  const i = Math.min(G - 1, Math.floor(fx)), j = Math.min(G - 1, Math.floor(fy));
  const u = smooth(fx - i), v = smooth(fy - j);
  const g = (a, b) => grid[(j + b) * (G + 1) + i + a];
  return (g(0, 0) * (1 - u) + g(1, 0) * u) * (1 - v) + (g(0, 1) * (1 - u) + g(1, 1) * u) * v - 0.5;
}

function height(x, y) {
  let z = 0;
  for (const p of PEAKS) {
    const dx = x - p.x, dy = y - p.y;
    const a = (dx * Math.cos(p.rot) + dy * Math.sin(p.rot)) / p.rx;
    const b = (-dx * Math.sin(p.rot) + dy * Math.cos(p.rot)) / p.ry;
    z += p.h * Math.exp(-(a * a + b * b));
  }
  return z + 0.12 * noise(x + PAD, y + PAD);
}

const values = new Float64Array(nx * ny);
for (let j = 0; j < ny; j++) {
  for (let i = 0; i < nx; i++) values[j * nx + i] = height(i * STEP - PAD, j * STEP - PAD);
}

const LEVELS = Array.from({ length: 14 }, (_, k) => 0.12 + k * 0.065);
const rings = contours().size([nx, ny]).thresholds(LEVELS)(values);

// Closed Catmull-Rom spline through a ring, as cubic Béziers.
const f = (n) => (Math.round(n * 10) / 10).toString();
function smoothPath(pts) {
  const n = pts.length;
  const p = (k) => pts[(k + n) % n];
  let d = `M${f(p(0)[0])},${f(p(0)[1])}`;
  for (let k = 0; k < n; k++) {
    const [p0, p1, p2, p3] = [p(k - 1), p(k), p(k + 1), p(k + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + 'Z';
}

const paths = [];
for (const level of rings) {
  for (const polygon of level.coordinates) {
    for (const ring of polygon) {
      // Grid coordinates to viewBox, keeping points about MIN_GAP apart (plenty
      // once smoothed); rings too small to read as contours are dropped.
      const pts = [];
      for (const [gx, gy] of ring.slice(0, -1)) {
        const q = [gx * STEP - PAD, gy * STEP - PAD];
        const last = pts[pts.length - 1];
        if (!last || Math.hypot(q[0] - last[0], q[1] - last[1]) >= MIN_GAP) pts.push(q);
      }
      const first = pts[0], end = pts[pts.length - 1];
      if (pts.length > 1 && Math.hypot(first[0] - end[0], first[1] - end[1]) < MIN_GAP / 2) pts.pop();
      if (pts.length >= 8) paths.push(smoothPath(pts));
    }
  }
}

process.stdout.write(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMaxYMax slice">` +
    `<g fill="none" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.5"><path d="${paths.join('')}"/></g></svg>\n`,
);
