/*
 * Renders the body GLB front-on with a software rasterizer, posterizes the shading into a few
 * tones and traces each tone into SVG paths. Output: an SVG that is a traced screenshot.
 * Run with `bun run icon` whenever the model changes.
 */
import { readFileSync, writeFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const OUT = process.argv[2] ?? `${ROOT}/src/app/icon.svg`;
const SIZE = 160; // raster resolution; paths are scaled to a 64-unit viewBox

const file = readFileSync(`${ROOT}/public/models/body/body-model.glb`);
const buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
const gltf = await new Promise<any>((resolve, reject) =>
  new GLTFLoader().parse(buffer, "", resolve, reject),
);
const scene: THREE.Group = gltf.scene;
scene.updateMatrixWorld(true);

// Largest mesh is the body; helpers/lines are skipped (mirrors cleanupScene in the app)
const meshes: THREE.Mesh[] = [];
scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
const maxCount = Math.max(...meshes.map((m) => m.geometry.getAttribute("position").count));
const body = meshes.filter((m) => m.geometry.getAttribute("position").count >= maxCount * 0.2);
console.error("meshes", meshes.length, "used", body.length, "verts", maxCount);

// Gather world-space triangles
type Tri = { p: THREE.Vector3[]; n: THREE.Vector3 };
const tris: Tri[] = [];
const box = new THREE.Box3();
for (const mesh of body) {
  const geo = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry;
  const pos = geo.getAttribute("position");
  for (let i = 0; i < pos.count; i += 3) {
    const p = [0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(pos, i + k).applyMatrix4(mesh.matrixWorld));
    for (const v of p) box.expandByPoint(v);
    const n = new THREE.Vector3().subVectors(p[1], p[0]).cross(new THREE.Vector3().subVectors(p[2], p[0])).normalize();
    tris.push({ p, n });
  }
}
console.error("tris", tris.length, "bbox", box.min.toArray().map((v) => v.toFixed(2)), box.max.toArray().map((v) => v.toFixed(2)));

// Orthographic front view (looking down -Z), fit height to the raster with a small margin
const size = new THREE.Vector3(); box.getSize(size);
const center = new THREE.Vector3(); box.getCenter(center);
const scale = (SIZE * 0.94) / Math.max(size.y, size.x);
const toPx = (v: THREE.Vector3) => ({ x: (v.x - center.x) * scale + SIZE / 2, y: (center.y - v.y) * scale + SIZE / 2, z: v.z });

const depth = new Float32Array(SIZE * SIZE).fill(-Infinity);
const shade = new Float32Array(SIZE * SIZE).fill(-1);
const light = new THREE.Vector3(0.35, 0.8, 1).normalize();

for (const { p, n } of tris) {
  if (n.z <= 0) continue; // back-facing
  const [a, b, c] = p.map(toPx);
  const minX = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x))), maxX = Math.min(SIZE - 1, Math.ceil(Math.max(a.x, b.x, c.x)));
  const minY = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y))), maxY = Math.min(SIZE - 1, Math.ceil(Math.max(a.y, b.y, c.y)));
  const area = (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
  if (Math.abs(area) < 1e-9) continue;
  const lambert = 0.35 + 0.65 * Math.max(0, n.dot(light));
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    const px = x + 0.5, py = y + 0.5;
    const w0 = ((b.x - px) * (c.y - py) - (c.x - px) * (b.y - py)) / area;
    const w1 = ((c.x - px) * (a.y - py) - (a.x - px) * (c.y - py)) / area;
    const w2 = 1 - w0 - w1;
    if (w0 < -1e-6 || w1 < -1e-6 || w2 < -1e-6) continue;
    const z = w0 * a.z + w1 * b.z + w2 * c.z;
    const i = y * SIZE + x;
    if (z > depth[i]) { depth[i] = z; shade[i] = lambert; }
  }
}

// Soften the shading so the tones come out as regions, not speckle
for (let pass = 0; pass < 3; pass++) {
  const next = Float32Array.from(shade);
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const i = y * SIZE + x;
    if (shade[i] < 0) continue;
    let sum = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= SIZE || yy >= SIZE) continue;
      const j = yy * SIZE + xx;
      if (shade[j] >= 0) { sum += shade[j]; n++; }
    }
    next[i] = sum / n;
  }
  shade.set(next);
}

// Posterize: tone 0 = lightest … TONES-1 = darkest. Each darker tone is drawn on top.
const TONES = 4;
const covered = Array.from(shade).filter((s) => s >= 0);
const lo = Math.min(...covered), hi = Math.max(...covered);
const tone = new Int8Array(SIZE * SIZE).fill(-1);
for (let i = 0; i < tone.length; i++) if (shade[i] >= 0) {
  const t = (hi - shade[i]) / (hi - lo + 1e-9);
  tone[i] = Math.min(TONES - 1, Math.floor(t * TONES));
}
console.error("coverage", covered.length, "of", SIZE * SIZE);

// Marching-squares style boundary tracing: collect unit edges of a mask, chain into loops
function traceMask(inside: (x: number, y: number) => boolean): number[][][] {
  const edges = new Map<string, [number, number][]>(); // start -> ends (directed, inside on left)
  const add = (x0: number, y0: number, x1: number, y1: number) => {
    const k = `${x0},${y0}`;
    (edges.get(k) ?? edges.set(k, []).get(k)!).push([x1, y1]);
  };
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    if (!inside(x, y)) continue;
    if (!inside(x, y - 1)) add(x, y, x + 1, y);         // top edge, left→right
    if (!inside(x + 1, y)) add(x + 1, y, x + 1, y + 1); // right edge, down
    if (!inside(x, y + 1)) add(x + 1, y + 1, x, y + 1); // bottom, right→left
    if (!inside(x - 1, y)) add(x, y + 1, x, y);         // left, up
  }
  const loops: number[][][] = [];
  while (edges.size) {
    const [startKey, ends] = edges.entries().next().value as [string, [number, number][]];
    const start = startKey.split(",").map(Number) as [number, number];
    const loop: number[][] = [start];
    let cur = start;
    for (;;) {
      const list = edges.get(`${cur[0]},${cur[1]}`);
      if (!list || list.length === 0) { edges.delete(`${cur[0]},${cur[1]}`); break; }
      const next = list.shift()!;
      if (list.length === 0) edges.delete(`${cur[0]},${cur[1]}`);
      if (next[0] === start[0] && next[1] === start[1]) break;
      loop.push(next); cur = next;
    }
    if (loop.length > 40) loops.push(loop);
  }
  return loops;
}

// Simplify: drop collinear points, then smooth with Chaikin twice; scale to the 64 viewBox
function simplify(loop: number[][]): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < loop.length; i++) {
    const a = loop[(i - 1 + loop.length) % loop.length], b = loop[i], c = loop[(i + 1) % loop.length];
    if ((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) !== 0) out.push(b);
  }
  return out;
}
function rdp(pts: number[][], eps: number): number[][] {
  if (pts.length < 4) return pts;
  const d = (p: number[], a: number[], b: number[]) => {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
  };
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop()!;
    let maxD = 0, idx = -1;
    for (let i = s + 1; i < e; i++) { const dd = d(pts[i], pts[s], pts[e]); if (dd > maxD) { maxD = dd; idx = i; } }
    if (maxD > eps && idx > 0) { keep[idx] = 1; stack.push([s, idx], [idx, e]); }
  }
  return pts.filter((_, i) => keep[i]);
}
function chaikin(loop: number[][], passes: number): number[][] {
  let pts = loop;
  for (let p = 0; p < passes; p++) {
    const next: number[][] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      next.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
    }
    pts = next;
  }
  return pts;
}
const f = (v: number) => ((v * 64) / SIZE).toFixed(1);
function toPath(loops: number[][][]): string {
  return loops.map((l) => {
    const pts = chaikin(rdp(simplify(l), 0.9), 1);
    return `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L")}Z`;
  }).join("");
}

// Tones: light base to dark; each tone's mask = "tone >= t" so darker regions stack on lighter
const COLORS = ["#d4d4ce", "#b1b1ab", "#86867f", "#55554f"];
let paths = "";
for (let t = 0; t < TONES; t++) {
  const loops = traceMask((x, y) => x >= 0 && y >= 0 && x < SIZE && y < SIZE && tone[y * SIZE + x] >= t);
  paths += `  <path fill="${COLORS[t]}" fill-rule="evenodd" d="${toPath(loops)}"/>\n`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">\n  <title>evom</title>\n${paths}</svg>\n`;
writeFileSync(OUT, svg);
console.error("wrote", OUT, (svg.length / 1024).toFixed(1), "KB");
