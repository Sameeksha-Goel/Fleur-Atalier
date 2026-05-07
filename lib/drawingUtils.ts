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
  // Back ring — 5 large petals, darkest
  for (let i = 0; i < 5; i++) {
    s += `<path d="${petal(cx, cy, 24, 18, i*72+18)}" fill="${c3}" stroke="${oc}" stroke-width="1.5"/>`;
  }
  // Mid ring — 5 petals, base color
  for (let i = 0; i < 5; i++) {
    s += `<path d="${petal(cx, cy, 19, 14, i*72)}" fill="${c2}" stroke="${oc}" stroke-width="1.4"/>`;
  }
  // Inner ring — 4 small petals, lightest
  for (let i = 0; i < 4; i++) {
    s += `<path d="${petal(cx, cy, 13, 10, i*90+22)}" fill="${c1}" stroke="${oc}" stroke-width="1.2"/>`;
  }
  // Center bud
  s += `<circle cx="${cx}" cy="${cy}" r="7" fill="${c4}" stroke="${oc}" stroke-width="1.2"/>`;
  // Spiral arcs
  s += `<path d="M${cx},${cy-5} a4.5,4.5 0 0,1 4,3.5" fill="none" stroke="${darken(c4,15)}" stroke-width="0.9"/>`;
  s += `<path d="M${cx+1},${cy-2} a2.5,2.5 0 0,1 2.2,1.8" fill="none" stroke="${darken(c4,15)}" stroke-width="0.7"/>`;
  return s;
}

// TULIP — cup shape with dark outline, strap leaves
function illustratedTulip(color: string): string {
  const oc = darken(color, 50);
  const li  = lighten(color, 22);
  const mid = darken(color, 5);
  const dk  = darken(color, 18);
  let s = illuStem(66) + illuLeaf(50, 96, 19, 245) + illuLeaf(50, 116, 16, 118);

  // Shadow base
  s += `<path d="M50,66 C26,62 18,34 32,14 C37,8 50,30 50,60 C50,30 63,8 68,14 C82,34 74,62 50,66 Z" fill="${dk}" stroke="${oc}" stroke-width="1.6" stroke-linejoin="round"/>`;
  // Left petal
  s += `<path d="M50,66 C28,63 20,36 34,16 C38,10 50,32 50,62 Z" fill="${mid}" stroke="${oc}" stroke-width="1.5" stroke-linejoin="round"/>`;
  // Right petal
  s += `<path d="M50,66 C72,63 80,36 66,16 C62,10 50,32 50,62 Z" fill="${mid}" stroke="${oc}" stroke-width="1.5" stroke-linejoin="round"/>`;
  // Center petal — lightest, tallest
  s += `<path d="M44,62 C42,30 46,13 50,13 C54,13 58,30 56,62 C54,67 46,67 44,62 Z" fill="${li}" stroke="${oc}" stroke-width="1.5" stroke-linejoin="round"/>`;
  // Highlight
  s += `<ellipse cx="48" cy="35" rx="3" ry="8" fill="white" opacity="0.16" transform="rotate(-8,48,35)" stroke="none"/>`;
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

// PEONY — ruffled multi-ring petals with dark outline, yellow stamens
function illustratedPeony(color: string): string {
  const cx = 50, cy = 42;
  const oc = darken(color, 52);
  const c1 = lighten(color, 30);
  const c2 = lighten(color, 14);
  const c3 = color;
  const c4 = darken(color, 18);
  let s = illuStem(65) + illuLeaf(50, 90, 15, 232) + illuLeaf(50, 112, 13, 128);

  // Outer ring — 8 large petals, lightest
  for (let i = 0; i < 8; i++) {
    s += `<path d="${petal(cx, cy, 26, 22, i*45)}" fill="${c1}" stroke="${oc}" stroke-width="1.5"/>`;
  }
  // Second ring — 8, offset 22°
  for (let i = 0; i < 8; i++) {
    s += `<path d="${rpetal(cx, cy, 20, 16, i*45+22)}" fill="${c2}" stroke="${oc}" stroke-width="1.4"/>`;
  }
  // Third ring — 6
  for (let i = 0; i < 6; i++) {
    s += `<path d="${rpetal(cx, cy, 13, 12, i*60+8)}" fill="${c3}" stroke="${oc}" stroke-width="1.3"/>`;
  }
  // Inner ring — 5 small
  for (let i = 0; i < 5; i++) {
    s += `<path d="${rpetal(cx, cy, 8, 8, i*72+15)}" fill="${c4}" stroke="${oc}" stroke-width="1.1"/>`;
  }
  // Yellow stamens center
  s += `<circle cx="${cx}" cy="${cy}" r="7" fill="#f0b820" stroke="${oc}" stroke-width="1.1"/>`;
  for (let a = 0; a < 360; a += 36) {
    const [x1, y1] = pt(cx, cy, 3, a);
    const [x2, y2] = pt(cx, cy, 6.5, a);
    s += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#c07008" stroke-width="0.9"/>`;
    s += `<circle cx="${f(x2)}" cy="${f(y2)}" r="0.9" fill="#c07008"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="3.5" fill="#f5c030" stroke="none"/>`;
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
