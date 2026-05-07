// All flowers render into a fixed 100 × 140 viewBox.
// Flower head sits in the top half; stem + leaves fill the bottom half.
// drawFlower() returns a complete <svg> string; caller sets display size via `size`.

export type FlowerType =
  | "rose" | "tulip" | "sunflower" | "daisy"
  | "lily" | "peony" | "cosmos" | "lavender";

export type ArtStyle =
  | "doodle" | "illustrated" | "crochet" | "ink_sketch"
  | "kawaii" | "paper_cut" | "realistic";

// ─── Color utils ──────────────────────────────────────────────────────────────

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function clamp(n: number) { return Math.max(0, Math.min(255, Math.round(n))); }
function th(n: number)    { return clamp(n).toString(16).padStart(2, "0"); }

export function lighten(hex: string, amt: number): string {
  const [r,g,b] = hexRgb(hex);
  return `#${th(r+amt)}${th(g+amt)}${th(b+amt)}`;
}
export function darken(hex: string, amt: number): string { return lighten(hex, -amt); }
export function hexToRgba(hex: string, a: number): string {
  const [r,g,b] = hexRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
function mix(a: string, b: string, t: number): string {
  const [r1,g1,b1]=hexRgb(a), [r2,g2,b2]=hexRgb(b);
  return `#${th(r1+(r2-r1)*t)}${th(g1+(g2-g1)*t)}${th(b1+(b2-b1)*t)}`;
}

// ─── Math utils ───────────────────────────────────────────────────────────────

const PI = Math.PI;
const f  = (n: number) => n.toFixed(2);

// angle=0 → tip goes UP (north), increases clockwise
const _cos = (deg: number) => Math.cos((deg - 90) * PI / 180);
const _sin = (deg: number) => Math.sin((deg - 90) * PI / 180);
const pt   = (cx: number, cy: number, r: number, deg: number): [number, number] =>
  [cx + _cos(deg) * r, cy + _sin(deg) * r];

function hash(s: number) { const x = Math.sin(s * 127.1 + 311) * 43758; return x - Math.floor(x); }
function jit(base: number, amp: number, s: number) { return base + (hash(s) - 0.5) * 2 * amp; }

// ─── Petal primitives ─────────────────────────────────────────────────────────

function petal(cx: number, cy: number, len: number, w: number, angle: number): string {
  const a = (angle - 90) * PI / 180, p = a + PI / 2;
  const tx = cx + Math.cos(a)*len,  ty = cy + Math.sin(a)*len;
  const c1x = cx + Math.cos(p)*w*.5 + Math.cos(a)*len*.4;
  const c1y = cy + Math.sin(p)*w*.5 + Math.sin(a)*len*.4;
  const c2x = cx - Math.cos(p)*w*.5 + Math.cos(a)*len*.4;
  const c2y = cy - Math.sin(p)*w*.5 + Math.sin(a)*len*.4;
  return `M${f(cx)},${f(cy)} C${f(c1x)},${f(c1y)} ${f(tx)},${f(ty)} ${f(tx)},${f(ty)} C${f(tx)},${f(ty)} ${f(c2x)},${f(c2y)} ${f(cx)},${f(cy)} Z`;
}

function wpetal(cx: number, cy: number, len: number, w: number, angle: number, s: number): string {
  const ag = angle + jit(0, 4.5, s), ln = len * (1 + jit(0, .1, s+1)), ww = w * (1 + jit(0, .12, s+2));
  const a  = (ag - 90) * PI / 180, p = a + PI / 2, bt = jit(.38, .07, s+5);
  const tx = cx + Math.cos(a)*ln + jit(0, ln*.04, s+3), ty = cy + Math.sin(a)*ln + jit(0, ln*.04, s+4);
  const c1x = cx + Math.cos(p)*ww*.5 + Math.cos(a)*ln*bt + jit(0, ww*.08, s+6);
  const c1y = cy + Math.sin(p)*ww*.5 + Math.sin(a)*ln*bt + jit(0, ww*.08, s+7);
  const c2x = cx - Math.cos(p)*ww*.5 + Math.cos(a)*ln*bt + jit(0, ww*.08, s+8);
  const c2y = cy - Math.sin(p)*ww*.5 + Math.sin(a)*ln*bt + jit(0, ww*.08, s+9);
  return `M${f(cx)},${f(cy)} C${f(c1x)},${f(c1y)} ${f(tx)},${f(ty)} ${f(tx)},${f(ty)} C${f(tx)},${f(ty)} ${f(c2x)},${f(c2y)} ${f(cx)},${f(cy)} Z`;
}

function rpetal(cx: number, cy: number, len: number, w: number, angle: number): string {
  const a = (angle - 90) * PI / 180, p = a + PI / 2;
  const tx = cx + Math.cos(a)*len*.87, ty = cy + Math.sin(a)*len*.87;
  const c1x = cx + Math.cos(p)*w*.65 + Math.cos(a)*len*.42;
  const c1y = cy + Math.sin(p)*w*.65 + Math.sin(a)*len*.42;
  const c2x = cx - Math.cos(p)*w*.65 + Math.cos(a)*len*.42;
  const c2y = cy - Math.sin(p)*w*.65 + Math.sin(a)*len*.42;
  return `M${f(cx)},${f(cy)} C${f(c1x)},${f(c1y)} ${f(tx)},${f(ty)} ${f(tx)},${f(ty)} C${f(tx)},${f(ty)} ${f(c2x)},${f(c2y)} ${f(cx)},${f(cy)} Z`;
}

// ─── Leaf + stem helpers ──────────────────────────────────────────────────────

export function leafPath(cx: number, cy: number, size: number, angle: number): string {
  const a = (angle - 90) * PI / 180, p = a + PI / 2;
  const tx = cx + Math.cos(a)*size, ty = cy + Math.sin(a)*size;
  const c1x = cx + Math.cos(p)*size*.3 + Math.cos(a)*size*.5;
  const c1y = cy + Math.sin(p)*size*.3 + Math.sin(a)*size*.5;
  const c2x = cx - Math.cos(p)*size*.3 + Math.cos(a)*size*.5;
  const c2y = cy - Math.sin(p)*size*.3 + Math.sin(a)*size*.5;
  return `M${f(cx)},${f(cy)} C${f(c1x)},${f(c1y)} ${f(tx)},${f(ty)} ${f(tx)},${f(ty)} C${f(tx)},${f(ty)} ${f(c2x)},${f(c2y)} ${f(cx)},${f(cy)} Z`;
}

export function stemPath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1+x2)/2 + (x2-x1)*.15, my = (y1+y2)/2;
  return `M${f(x1)},${f(y1)} C${f(x1)},${f(my)} ${f(mx)},${f(my)} ${f(x2)},${f(y2)}`;
}

// ─── Illustrated helpers ──────────────────────────────────────────────────────

// Stem with dark outline — gives the bold look matching the reference illustrations
function illuStem(startY: number): string {
  const g = "#4a7a30", outline = "#1b3010";
  return (
    `<path d="M50,${startY} C52,${startY+22} 48,${startY+46} 50,132" fill="none" stroke="${outline}" stroke-width="3.2" stroke-linecap="round"/>` +
    `<path d="M50,${startY} C52,${startY+22} 48,${startY+46} 50,132" fill="none" stroke="${g}" stroke-width="2" stroke-linecap="round"/>`
  );
}

// Leaf with dark outline and center vein
function illuLeaf(cx: number, cy: number, size: number, angle: number): string {
  const g = "#4a7a30", dg = "#2a5018", outline = "#1b3010";
  const [tx, ty] = pt(cx, cy, size * .82, angle);
  return (
    `<path d="${leafPath(cx, cy, size, angle)}" fill="${g}" stroke="${outline}" stroke-width="1.4" stroke-linejoin="round"/>` +
    `<line x1="${f(cx)}" y1="${f(cy)}" x2="${f(tx)}" y2="${f(ty)}" stroke="${dg}" stroke-width="0.7" opacity="0.7"/>`
  );
}

// ─── Illustrated flowers ──────────────────────────────────────────────────────

// ROSE — layered petals with dark outline, spiral center, sepals
function illustratedRose(color: string): string {
  const cx = 50, cy = 40;
  const oc = darken(color, 55);
  const c1 = lighten(color, 20);
  const c2 = color;
  const c3 = darken(color, 20);
  const c4 = darken(color, 38);
  let s = illuStem(62) + illuLeaf(50, 88, 15, 232) + illuLeaf(50, 110, 13, 128);

  // Sepals at bloom base
  const sg = "#4a7a30";
  for (let i = 0; i < 5; i++) {
    s += `<path d="${petal(cx, 62, 11, 5, i*72+36)}" fill="${sg}" stroke="${darken(sg,35)}" stroke-width="0.9"/>`;
  }
  // Back ring — 5 large petals, darkest (rpetal = rounded petal, dome-like)
  for (let i = 0; i < 5; i++) {
    s += `<path d="${rpetal(cx, cy, 22, 20, i*72+18)}" fill="${c3}" stroke="${oc}" stroke-width="1.5"/>`;
  }
  // Mid ring — 5 petals, base color
  for (let i = 0; i < 5; i++) {
    s += `<path d="${rpetal(cx, cy, 18, 17, i*72)}" fill="${c2}" stroke="${oc}" stroke-width="1.4"/>`;
  }
  // Inner ring — 4 small petals, lightest
  for (let i = 0; i < 4; i++) {
    s += `<path d="${rpetal(cx, cy, 12, 12, i*90+22)}" fill="${c1}" stroke="${oc}" stroke-width="1.2"/>`;
  }
  // Center bud
  s += `<circle cx="${cx}" cy="${cy}" r="7" fill="${c4}" stroke="${oc}" stroke-width="1.2"/>`;
  // Spiral arcs
  s += `<path d="M${cx},${cy-5} a4.5,4.5 0 0,1 4,3.5" fill="none" stroke="${darken(c4,15)}" stroke-width="0.9"/>`;
  s += `<path d="M${cx+1},${cy-2} a2.5,2.5 0 0,1 2.2,1.8" fill="none" stroke="${darken(c4,15)}" stroke-width="0.7"/>`;
  return s;
}

// TULIP — rounded egg-cup shape with big prominent leaves, matching reference
function illustratedTulip(color: string): string {
  const oc  = darken(color, 50);
  const li  = lighten(color, 24);
  const mid = darken(color, 5);
  const dk  = darken(color, 20);
  const gl  = "#5a8a3c", gd = "#1b3010", gm = "#2a5018";
  let s = illuStem(68);

  // Large prominent strap leaves (from mid-stem, like the reference)
  s += `<path d="M50,96 C30,84 12,66 18,48 C22,38 42,54 50,80 Z" fill="${gl}" stroke="${gd}" stroke-width="1.8" stroke-linejoin="round"/>`;
  s += `<line x1="50" y1="96" x2="20" y2="50" stroke="${gm}" stroke-width="0.9" opacity="0.7"/>`;
  s += `<line x1="36" y1="76" x2="26" y2="63" stroke="${gm}" stroke-width="0.6" opacity="0.55"/>`;
  s += `<path d="M50,102 C70,90 88,72 82,54 C78,44 58,60 50,86 Z" fill="${gl}" stroke="${gd}" stroke-width="1.8" stroke-linejoin="round"/>`;
  s += `<line x1="50" y1="102" x2="80" y2="56" stroke="${gm}" stroke-width="0.9" opacity="0.7"/>`;
  s += `<line x1="64" y1="82" x2="74" y2="69" stroke="${gm}" stroke-width="0.6" opacity="0.55"/>`;

  // Full silhouette (back/dark — rounded egg-cup shape)
  s += `<path d="M50,68 C24,64 15,40 22,20 C28,6 40,4 50,8 C60,4 72,6 78,20 C85,40 76,64 50,68 Z" fill="${dk}" stroke="${oc}" stroke-width="1.9" stroke-linejoin="round"/>`;
  // Left petal
  s += `<path d="M50,68 C24,64 15,40 22,20 C28,6 40,4 50,20 Z" fill="${mid}" stroke="${oc}" stroke-width="1.6" stroke-linejoin="round"/>`;
  // Right petal
  s += `<path d="M50,68 C76,64 85,40 78,20 C72,6 60,4 50,20 Z" fill="${mid}" stroke="${oc}" stroke-width="1.6" stroke-linejoin="round"/>`;
  // Center petal — lightest, front-facing
  s += `<path d="M43,64 C40,32 44,10 50,8 C56,10 60,32 57,64 C55,70 45,70 43,64 Z" fill="${li}" stroke="${oc}" stroke-width="1.6" stroke-linejoin="round"/>`;
  // Vertical soft highlight
  s += `<path d="M48,60 C46,34 48,14 50,12 C52,14 52,34 51,60 Z" fill="white" opacity="0.18" stroke="none"/>`;
  return s;
}

// SUNFLOWER — flat illustrated style (no black petal outline), detailed center
function illustratedSunflower(color: string): string {
  const cx = 50, cy = 42;
  const rayFront = color, rayBack = darken(color, 25);
  let s = illuStem(58);

  // Large leaves with outlines
  s += `<path d="M50,90 C36,82 24,72 26,58 C28,46 44,58 50,78 Z" fill="#4a7a30" stroke="#1b3010" stroke-width="1.3" stroke-linejoin="round"/>`;
  s += `<line x1="50" y1="90" x2="28" y2="60" stroke="#2a5018" stroke-width="0.7" opacity="0.65"/>`;
  s += `<path d="M50,110 C64,102 76,92 74,78 C72,66 56,78 50,98 Z" fill="#4a7a30" stroke="#1b3010" stroke-width="1.3" stroke-linejoin="round"/>`;
  s += `<line x1="50" y1="110" x2="72" y2="80" stroke="#2a5018" stroke-width="0.7" opacity="0.65"/>`;

  // Back petal ring (14)
  for (let i = 0; i < 14; i++) {
    s += `<path d="${rpetal(cx, cy, 22, 9, i*(360/14)+13)}" fill="${rayBack}" stroke="none"/>`;
  }
  // Front petal ring (14)
  for (let i = 0; i < 14; i++) {
    s += `<path d="${rpetal(cx, cy, 23, 9, i*(360/14))}" fill="${rayFront}" stroke="none"/>`;
  }
  // Center disc
  s += `<circle cx="${cx}" cy="${cy}" r="14" fill="#3a1e06" stroke="none"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="10" fill="#2a1204" stroke="none"/>`;
  // Dot texture
  for (let a = 0; a < 360; a += 24) {
    const [dx, dy] = pt(cx, cy, 7.5, a);
    s += `<circle cx="${f(dx)}" cy="${f(dy)}" r="0.9" fill="#4a2a0a" opacity="0.8"/>`;
  }
  for (let a = 0; a < 360; a += 45) {
    const [dx, dy] = pt(cx, cy, 4, a);
    s += `<circle cx="${f(dx)}" cy="${f(dy)}" r="0.7" fill="#5a3010" opacity="0.7"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="5" fill="#1a0a02" stroke="none"/>`;
  return s;
}

// DAISY — 16 thin petals with dark outline, golden center
function illustratedDaisy(color: string): string {
  const cx = 50, cy = 40;
  const petalFill = color || "#f8f8f2";
  const petalBack = darken(petalFill, 10);
  const oc = darken(petalFill, 48);
  const centerFill = "#f0a820", centerDk = "#b87008";
  let s = illuStem(57) + illuLeaf(50, 90, 13, 230) + illuLeaf(50, 112, 11, 130);

  // Back 8 petals
  for (let i = 0; i < 8; i++) {
    s += `<path d="${petal(cx, cy, 27, 4.5, i*45+22.5)}" fill="${petalBack}" stroke="${oc}" stroke-width="1.1"/>`;
  }
  // Front 8 petals
  for (let i = 0; i < 8; i++) {
    s += `<path d="${petal(cx, cy, 28, 4.5, i*45)}" fill="${petalFill}" stroke="${oc}" stroke-width="1.1"/>`;
  }
  // Center
  s += `<circle cx="${cx}" cy="${cy}" r="11" fill="${centerFill}" stroke="${centerDk}" stroke-width="1.3"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="7.5" fill="${darken(centerFill, 14)}" stroke="none"/>`;
  for (let a = 0; a < 360; a += 30) {
    const [dx, dy] = pt(cx, cy, 5.2, a);
    s += `<circle cx="${f(dx)}" cy="${f(dy)}" r="0.9" fill="${centerDk}" opacity="0.8"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${centerDk}" stroke="none"/>`;
  return s;
}

// PEONY — scalloped outer ring + ruffled inner layers + yellow stamen cup, matching reference
function illustratedPeony(color: string): string {
  const cx = 50, cy = 40;
  const oc = darken(color, 52);
  const c1 = lighten(color, 32);  // outermost — lightest
  const c2 = lighten(color, 16);
  const c3 = color;
  const c4 = darken(color, 18);   // innermost petal ring
  const gl  = "#5a8a3c", gd = "#1b3010", gm = "#2a5018";
  let s = illuStem(66);

  // Large oval leaves with branching veins
  s += `<path d="M50,90 C28,78 10,62 16,44 C20,32 42,50 50,74 Z" fill="${gl}" stroke="${gd}" stroke-width="1.8" stroke-linejoin="round"/>`;
  s += `<line x1="50" y1="90" x2="18" y2="46" stroke="${gm}" stroke-width="0.9" opacity="0.7"/>`;
  s += `<line x1="36" y1="72" x2="24" y2="58" stroke="${gm}" stroke-width="0.6" opacity="0.55"/>`;
  s += `<path d="M50,96 C72,84 90,68 84,50 C80,38 58,56 50,80 Z" fill="${gl}" stroke="${gd}" stroke-width="1.8" stroke-linejoin="round"/>`;
  s += `<line x1="50" y1="96" x2="82" y2="52" stroke="${gm}" stroke-width="0.9" opacity="0.7"/>`;
  s += `<line x1="64" y1="78" x2="76" y2="65" stroke="${gm}" stroke-width="0.6" opacity="0.55"/>`;

  // Outer scalloped ring — 22 small rpetals create the bumpy edge of the reference
  for (let i = 0; i < 22; i++) {
    s += `<path d="${rpetal(cx, cy, 28, 11, i*(360/22))}" fill="${c1}" stroke="${oc}" stroke-width="1.4"/>`;
  }
  // Second ring — 8 large rpetals (big ruffled inner petals)
  for (let i = 0; i < 8; i++) {
    s += `<path d="${rpetal(cx, cy, 23, 20, i*45+10)}" fill="${c2}" stroke="${oc}" stroke-width="1.4"/>`;
  }
  // Third ring — 6 petals
  for (let i = 0; i < 6; i++) {
    s += `<path d="${rpetal(cx, cy, 17, 15, i*60+5)}" fill="${c3}" stroke="${oc}" stroke-width="1.3"/>`;
  }
  // Inner ring — 5 small petals
  for (let i = 0; i < 5; i++) {
    s += `<path d="${rpetal(cx, cy, 11, 10, i*72+18)}" fill="${c4}" stroke="${oc}" stroke-width="1.2"/>`;
  }

  // Yellow stamen cup (small ruffled flower-within-flower, like the reference)
  for (let i = 0; i < 10; i++) {
    s += `<path d="${rpetal(cx, cy-2, 8, 5, i*36)}" fill="#f0b820" stroke="#7a4008" stroke-width="1.0"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy-2}" r="5" fill="#f5c828" stroke="#7a4008" stroke-width="1.0"/>`;
  // Stamen lines inside cup
  for (let a = 0; a < 360; a += 36) {
    const [x1, y1] = pt(cx, cy-2, 2, a);
    const [x2, y2] = pt(cx, cy-2, 5.5, a);
    s += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#a05008" stroke-width="0.8"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy-2}" r="2.5" fill="#fdd030" stroke="none"/>`;
  return s;
}

// ─── Placeholder flower (non-illustrated styles) ──────────────────────────────

function placeholderFlower(type: FlowerType, style: ArtStyle, color: string): string {
  const cx = 50, cy = 40;
  const g   = "#4a7a30", dg = "#365c20";
  const dk  = darken(color, 28);
  const sw  = style === "doodle" || style === "kawaii" ? "2.1" : "0.9";
  const stroke = style === "ink_sketch" ? "#111" : dk;
  const fill   = style === "ink_sketch" ? "white"
               : style === "kawaii"     ? mix(color, "#fff", 0.42)
               : style === "paper_cut"  ? color
               : color;

  let s = "";

  s += `<path d="M50,60 C52,85 48,110 50,132" fill="none" stroke="${style === "ink_sketch" ? "#111" : g}" stroke-width="${style === "crochet" ? "2.2" : "1.3"}" stroke-linecap="round"/>`;
  s += `<path d="${leafPath(50, 88, 12, 232)}" fill="${style === "ink_sketch" ? "white" : g}" stroke="${style === "ink_sketch" ? "#111" : dg}" stroke-width="${sw}"/>`;
  s += `<path d="${leafPath(50, 110, 10, 128)}" fill="${style === "ink_sketch" ? "white" : g}" stroke="${style === "ink_sketch" ? "#111" : dg}" stroke-width="${sw}"/>`;

  const n   = type === "sunflower" || type === "daisy" ? 12 : type === "cosmos" ? 8 : 6;
  const len = type === "tulip" ? 18 : type === "peony" ? 20 : 16;
  const w   = type === "tulip" ? 13 : type === "peony" ? 15 : 11;

  for (let i = 0; i < n; i++) {
    const angle = i * (360 / n);
    const pd =
      style === "doodle" || style === "kawaii" ? wpetal(cx, cy, len, w, angle, i*7)
      : style === "crochet"                    ? rpetal(cx, cy, len, w, angle)
      : petal(cx, cy, len, w, angle);
    const petalFill = style === "paper_cut" ? mix(color, "#fff", i * 0.035) : fill;
    s += `<path d="${pd}" fill="${petalFill}" stroke="${style === "paper_cut" ? "none" : stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  }

  const cr   = type === "sunflower" ? 10 : 7;
  const cfill = type === "sunflower"        ? "#3a1e06"
              : style === "ink_sketch"      ? "#f5f5f5"
              : style === "paper_cut"       ? lighten(color, 30)
              : darken(color, 18);
  s += `<circle cx="${cx}" cy="${cy}" r="${cr}" fill="${cfill}" stroke="${style === "paper_cut" ? "none" : stroke}" stroke-width="${sw}"/>`;

  if (style === "kawaii") {
    s += `<circle cx="${f(cx-2.8)}" cy="${f(cy-1)}" r="1.4" fill="#2d1a0e"/>`;
    s += `<circle cx="${f(cx+2.8)}" cy="${f(cy-1)}" r="1.4" fill="#2d1a0e"/>`;
    s += `<path d="M${f(cx-2)},${f(cy+2)} Q${cx},${f(cy+4.5)} ${f(cx+2)},${f(cy+2)}" fill="none" stroke="#2d1a0e" stroke-width="0.9" stroke-linecap="round"/>`;
    s += `<circle cx="${f(cx-4)}" cy="${f(cy+1.5)}" r="1.8" fill="#ffb3ba" opacity="0.5"/>`;
    s += `<circle cx="${f(cx+4)}" cy="${f(cy+1.5)}" r="1.8" fill="#ffb3ba" opacity="0.5"/>`;
  }

  return s;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function drawFlower(
  type: FlowerType,
  artStyle: ArtStyle,
  color: string,
  size: number
): string {
  const w = size, h = Math.round(size * 1.4);
  const safeColor = color || "#D4849A";

  let body = "";

  if (artStyle === "illustrated") {
    switch (type) {
      case "rose":      body = illustratedRose(safeColor);                    break;
      case "tulip":     body = illustratedTulip(safeColor);                   break;
      case "sunflower": body = illustratedSunflower(safeColor || "#f5c518");  break;
      case "daisy":     body = illustratedDaisy(safeColor || "#f8f8f0");      break;
      case "peony":     body = illustratedPeony(safeColor);                   break;
      case "lily":      body = illustratedDaisy(safeColor);                   break;
      case "cosmos":    body = illustratedDaisy(safeColor);                   break;
      case "lavender":  body = illustratedRose(safeColor || "#8b69b8");       break;
    }
  } else {
    body = placeholderFlower(type, artStyle, safeColor);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" width="${w}" height="${h}">${body}</svg>`;
}
