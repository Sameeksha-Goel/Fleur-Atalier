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

// Smooth cubic bezier — base at (cx,cy), tip in direction `angle`.
function petal(cx: number, cy: number, len: number, w: number, angle: number): string {
  const a = (angle - 90) * PI / 180, p = a + PI / 2;
  const tx = cx + Math.cos(a)*len,  ty = cy + Math.sin(a)*len;
  const c1x = cx + Math.cos(p)*w*.5 + Math.cos(a)*len*.4;
  const c1y = cy + Math.sin(p)*w*.5 + Math.sin(a)*len*.4;
  const c2x = cx - Math.cos(p)*w*.5 + Math.cos(a)*len*.4;
  const c2y = cy - Math.sin(p)*w*.5 + Math.sin(a)*len*.4;
  return `M${f(cx)},${f(cy)} C${f(c1x)},${f(c1y)} ${f(tx)},${f(ty)} ${f(tx)},${f(ty)} C${f(tx)},${f(ty)} ${f(c2x)},${f(c2y)} ${f(cx)},${f(cy)} Z`;
}

// Wobbly petal (doodle / kawaii).
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

// Chubby round petal (kawaii / crochet).
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

// ─── Illustrated flowers ──────────────────────────────────────────────────────
// Each returns inner SVG element strings for a 100×140 viewBox.
// Stem bottom always reaches y=132.

function illuStem(startY: number): string {
  const g = "#4a7a30", lg = "#6a9a48";
  return (
    `<path d="M50,${startY} C52,${startY+22} 48,${startY+46} 50,132" fill="none" stroke="${g}" stroke-width="1.35" stroke-linecap="round"/>` +
    `<path d="M50,${startY} C51.5,${startY+22} 49,${startY+46} 50,132" fill="none" stroke="${lg}" stroke-width="0.5" opacity="0.48" stroke-linecap="round"/>`
  );
}

function illuLeaf(cx: number, cy: number, size: number, angle: number): string {
  const g = "#4a7a30", dg = "#365c20";
  const [tx, ty] = pt(cx, cy, size * .82, angle);
  return (
    `<path d="${leafPath(cx, cy, size, angle)}" fill="${g}" stroke="none"/>` +
    `<line x1="${f(cx)}" y1="${f(cy)}" x2="${f(tx)}" y2="${f(ty)}" stroke="${dg}" stroke-width="0.5" opacity="0.55"/>`
  );
}

// ROSE — flat botanical: 3-tone layered rings, no outlines
function illustratedRose(color: string): string {
  const cx = 50, cy = 42;
  const c1  = lighten(color, 25);  // outer — lightest
  const c2  = color;               // mid
  const c3  = darken(color, 20);   // back — darkest
  const cen = darken(color, 35);
  let s = illuStem(62) + illuLeaf(50, 88, 14, 232) + illuLeaf(50, 108, 12, 128);

  // Back ring — 5 petals, darkest (drawn first, sit behind)
  for (let i = 0; i < 5; i++) {
    s += `<path d="${petal(cx, cy, 22, 17, i*72+14)}" fill="${c3}" stroke="none"/>`;
  }
  // Mid ring — 5 petals, base color
  for (let i = 0; i < 5; i++) {
    s += `<path d="${petal(cx, cy, 18, 14, i*72)}" fill="${c2}" stroke="none"/>`;
  }
  // Front ring — 4 small petals, lightest (curl inward)
  for (let i = 0; i < 4; i++) {
    s += `<path d="${petal(cx, cy, 12, 10, i*90+20)}" fill="${c1}" stroke="none"/>`;
  }
  // Center bud
  s += `<circle cx="${cx}" cy="${cy}" r="6" fill="${cen}" stroke="none"/>`;
  s += `<path d="M${cx},${cy-4} a3.5,3.5 0 0,1 3.2,2.6 a2,2 0 0,1 -1.8,2" fill="none" stroke="${darken(cen,20)}" stroke-width="0.7" opacity="0.75"/>`;
  s += `<circle cx="${f(cx-1.5)}" cy="${f(cy-2)}" r="2" fill="white" opacity="0.15" stroke="none"/>`;
  return s;
}

// TULIP — flat botanical: custom 3-path egg-cup silhouette, no outlines
function illustratedTulip(color: string): string {
  const li  = lighten(color, 22);  // center petal — lightest
  const mid = darken(color, 5);    // side petals
  const dk  = darken(color, 18);   // shadow base behind petals
  let s = illuStem(66) + illuLeaf(50, 94, 16, 242) + illuLeaf(50, 114, 14, 118);

  // Shadow base (widest, darkest — drawn first)
  s += `<path d="M50,66 C26,62 18,34 32,14 C37,8 50,30 50,60 C50,30 63,8 68,14 C82,34 74,62 50,66 Z" fill="${dk}" stroke="none"/>`;
  // Left side petal
  s += `<path d="M50,66 C28,63 20,36 34,16 C38,10 50,32 50,62 Z" fill="${mid}" stroke="none"/>`;
  // Right side petal (mirror)
  s += `<path d="M50,66 C72,63 80,36 66,16 C62,10 50,32 50,62 Z" fill="${mid}" stroke="none"/>`;
  // Center petal — tallest, lightest, sits in front
  s += `<path d="M44,62 C42,30 46,13 50,13 C54,13 58,30 56,62 C54,67 46,67 44,62 Z" fill="${li}" stroke="none"/>`;
  // Soft highlight on center petal
  s += `<ellipse cx="48" cy="35" rx="3" ry="8" fill="white" opacity="0.14" transform="rotate(-8,48,35)" stroke="none"/>`;
  return s;
}

// SUNFLOWER — flat botanical: round rpetal rays, layered dark center, no outlines
function illustratedSunflower(color: string): string {
  const cx = 50, cy = 42;
  const rayFront = color, rayBack = darken(color, 25);
  let s = illuStem(58);

  // Large leaves — stroke="none", vein line only
  s += `<path d="M50,90 C36,82 24,72 26,58 C28,46 44,58 50,78 Z" fill="#4a7a30" stroke="none"/>`;
  s += `<line x1="50" y1="90" x2="28" y2="60" stroke="#365c20" stroke-width="0.5" opacity="0.55"/>`;
  s += `<path d="M50,110 C64,102 76,92 74,78 C72,66 56,78 50,98 Z" fill="#4a7a30" stroke="none"/>`;
  s += `<line x1="50" y1="110" x2="72" y2="80" stroke="#365c20" stroke-width="0.5" opacity="0.55"/>`;

  // Back ring — 14 rounder petals, darker
  for (let i = 0; i < 14; i++) {
    s += `<path d="${rpetal(cx, cy, 21, 9, i*(360/14)+13)}" fill="${rayBack}" stroke="none"/>`;
  }
  // Front ring — 14 petals, bright
  for (let i = 0; i < 14; i++) {
    s += `<path d="${rpetal(cx, cy, 22, 9, i*(360/14))}" fill="${rayFront}" stroke="none"/>`;
  }
  // Center: 3 concentric filled circles for depth
  s += `<circle cx="${cx}" cy="${cy}" r="14" fill="#3a1e06" stroke="none"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="10" fill="#2a1204" stroke="none"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="5.5" fill="#1a0a02" stroke="none"/>`;
  return s;
}

// DAISY — flat botanical: thin petals, large bold center, no outlines
function illustratedDaisy(color: string): string {
  const cx = 50, cy = 40;
  const petalFill = color || "#f8f8f2";
  const petalBack = darken(petalFill, 10);
  const centerFill = "#f0c030", centerDk = "#c89010";
  let s = illuStem(58) + illuLeaf(50, 90, 12, 230) + illuLeaf(50, 112, 10, 130);

  // Back 8 petals — slightly darker
  for (let i = 0; i < 8; i++) {
    s += `<path d="${petal(cx, cy, 23, 5.5, i*45+22.5)}" fill="${petalBack}" stroke="none"/>`;
  }
  // Front 8 petals — full color
  for (let i = 0; i < 8; i++) {
    s += `<path d="${petal(cx, cy, 23, 5.5, i*45)}" fill="${petalFill}" stroke="none"/>`;
  }
  // Bold golden center disc
  s += `<circle cx="${cx}" cy="${cy}" r="10" fill="${centerFill}" stroke="none"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="7.5" fill="${darken(centerFill, 15)}" stroke="none"/>`;
  // Dot texture
  for (let a = 0; a < 360; a += 30) {
    const [dx, dy] = pt(cx, cy, 5.2, a);
    s += `<circle cx="${f(dx)}" cy="${f(dy)}" r="0.9" fill="${centerDk}" opacity="0.7" stroke="none"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="2" fill="${centerDk}" stroke="none"/>`;
  // Center highlight
  s += `<circle cx="${f(cx-2)}" cy="${f(cy-2)}" r="3.5" fill="white" opacity="0.18" stroke="none"/>`;
  return s;
}

// PEONY — flat botanical: 4-ring density, 4 color tones, no outlines
function illustratedPeony(color: string): string {
  const cx = 50, cy = 44;
  const c1 = lighten(color, 28);  // outer — lightest
  const c2 = lighten(color, 12);  // mid
  const c3 = color;               // inner
  const c4 = darken(color, 15);   // tuft — darkest
  let s = illuStem(66) + illuLeaf(50, 90, 14, 232) + illuLeaf(50, 112, 12, 128);

  // Outer ring — 8 large petals, lightest
  for (let i = 0; i < 8; i++) {
    s += `<path d="${petal(cx, cy, 24, 20, i*45)}" fill="${c1}" stroke="none"/>`;
  }
  // Second ring — 8 petals offset 22°, rounder
  for (let i = 0; i < 8; i++) {
    s += `<path d="${rpetal(cx, cy, 17, 14, i*45+22)}" fill="${c2}" stroke="none"/>`;
  }
  // Third ring — 6 petals
  for (let i = 0; i < 6; i++) {
    s += `<path d="${rpetal(cx, cy, 11, 10, i*60+8)}" fill="${c3}" stroke="none"/>`;
  }
  // Inner tuft — 4 tiny petals, deepest
  for (let i = 0; i < 4; i++) {
    s += `<path d="${rpetal(cx, cy, 6, 7, i*90+15)}" fill="${c4}" stroke="none"/>`;
  }
  // Center dot
  s += `<circle cx="${cx}" cy="${cy}" r="3" fill="${darken(color, 25)}" stroke="none"/>`;
  return s;
}

// ─── Placeholder flower (non-illustrated styles) ──────────────────────────────
// Returns a simple, recognisable flower shape for all other art styles.
// Will be replaced with full implementations per style in a future pass.

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

  // Stem
  s += `<path d="M50,60 C52,85 48,110 50,132" fill="none" stroke="${style === "ink_sketch" ? "#111" : g}" stroke-width="${style === "crochet" ? "2.2" : "1.3"}" stroke-linecap="round"/>`;
  s += `<path d="${leafPath(50, 88, 12, 232)}" fill="${style === "ink_sketch" ? "white" : g}" stroke="${style === "ink_sketch" ? "#111" : dg}" stroke-width="${sw}"/>`;
  s += `<path d="${leafPath(50, 110, 10, 128)}" fill="${style === "ink_sketch" ? "white" : g}" stroke="${style === "ink_sketch" ? "#111" : dg}" stroke-width="${sw}"/>`;

  // Choose petal count and shape based on flower type
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

  // Center
  const cr   = type === "sunflower" ? 10 : 7;
  const cfill = type === "sunflower"        ? "#3a1e06"
              : style === "ink_sketch"      ? "#f5f5f5"
              : style === "paper_cut"       ? lighten(color, 30)
              : darken(color, 18);
  s += `<circle cx="${cx}" cy="${cy}" r="${cr}" fill="${cfill}" stroke="${style === "paper_cut" ? "none" : stroke}" stroke-width="${sw}"/>`;

  // Kawaii face on center
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

/**
 * Returns a complete <svg> string for one flower.
 * viewBox is always 0 0 100 140. `size` sets the rendered pixel width
 * (height = size × 1.4 automatically).
 */
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
      // Lily + cosmos → daisy-family silhouette until fully implemented
      case "lily":      body = illustratedDaisy(safeColor);                   break;
      case "cosmos":    body = illustratedDaisy(safeColor);                   break;
      // Lavender → rose silhouette until fully implemented
      case "lavender":  body = illustratedRose(safeColor || "#8b69b8");       break;
    }
  } else {
    body = placeholderFlower(type, artStyle, safeColor);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" width="${w}" height="${h}">${body}</svg>`;
}
