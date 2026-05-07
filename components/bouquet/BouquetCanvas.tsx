"use client";

import { useMemo } from "react";
import { BouquetState } from "@/lib/bouquetState";
import { drawFlower, FlowerType, ArtStyle, lighten, darken } from "@/lib/drawingUtils";

type Props = {
  bouquet: BouquetState;
  /** Display width in px — canvas aspect is always 400 × 520 */
  width?: number;
};

const CW = 400;
const CH = 520;
const FLOWER_SIZE = 90;
const FLOWER_H    = Math.round(FLOWER_SIZE * 1.4);
const TIE_X = CW / 2;
const TIE_Y = 328;

// ─── Fan layout ───────────────────────────────────────────────────────────────

type FlowerPos = { hx: number; hy: number; angleDeg: number };

function computePositions(n: number): FlowerPos[] {
  if (n === 0) return [];
  const spread = Math.min(16 + n * 8, 55);
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
    const angleDeg = t * spread;
    const stemLen  = 155 - Math.abs(t) * 20;
    const rad = angleDeg * (Math.PI / 180);
    return {
      hx: TIE_X + Math.sin(rad) * stemLen,
      hy: TIE_Y - Math.cos(rad) * stemLen,
      angleDeg,
    };
  });
}

// ─── Kraft paper wrap ─────────────────────────────────────────────────────────

function KraftWrap({ cx, topY, color }: { cx: number; topY: number; color: string }) {
  const botY    = topY + 172;
  const tw      = 84;   // half-width at top opening
  const bw      = 25;   // half-width at bottom
  const foldW   = 18;   // width of visible fold strip
  const knotY   = topY + 78;  // twine knot height

  // Derive wrap shades from the chosen colour
  const main   = darken(color, 5);
  const dark   = darken(color, 22);
  const light  = lighten(color, 16);
  const shadow = darken(color, 38);
  const twine  = "#6b4820";
  const twineLt = "#8a6432";

  // Helper: format number to 1 decimal
  const n = (v: number) => v.toFixed(1);

  // Bow loop — a filled teardrop path from knot center outward at angleDeg (0=up)
  function loop(angleDeg: number, len: number, w: number, col: string) {
    const a  = (angleDeg - 90) * Math.PI / 180;
    const pr = a + Math.PI / 2;
    const tx = cx + Math.cos(a) * len;
    const ty = knotY + Math.sin(a) * len;
    const c1x = cx  + Math.cos(a)*len*0.4 + Math.cos(pr)*w;
    const c1y = knotY + Math.sin(a)*len*0.4 + Math.sin(pr)*w;
    const c2x = tx + Math.cos(pr)*w*0.38;
    const c2y = ty + Math.sin(pr)*w*0.38;
    const c3x = tx - Math.cos(pr)*w*0.38;
    const c3y = ty - Math.sin(pr)*w*0.38;
    const c4x = cx  + Math.cos(a)*len*0.4 - Math.cos(pr)*w;
    const c4y = knotY + Math.sin(a)*len*0.4 - Math.sin(pr)*w;
    return (
      <path
        key={`${angleDeg}`}
        d={`M${cx},${knotY} C${n(c1x)},${n(c1y)} ${n(c2x)},${n(c2y)} ${n(tx)},${n(ty)} C${n(c3x)},${n(c3y)} ${n(c4x)},${n(c4y)} ${cx},${knotY} Z`}
        fill={col}
      />
    );
  }

  // Interpolate half-width at any Y between topY and botY
  const hw = (y: number) => bw + (tw - bw) * (1 - (y - topY) / (botY - topY));

  return (
    <g>
      {/* ── Drop shadow ──────────────────────────────────────────────── */}
      <path
        d={`M${cx-tw-2} ${topY} L${cx+tw+2} ${topY} L${cx+bw+2} ${botY} L${cx-bw-2} ${botY} Z`}
        fill={shadow} opacity="0.18" transform="translate(4,6)"
      />

      {/* ── Back layer — slightly visible on outer edges ─────────────── */}
      <path
        d={`M${cx-tw-4} ${topY} L${cx-tw} ${topY} L${cx-bw} ${botY} L${cx-bw-4} ${botY} Z`}
        fill={dark}
      />
      <path
        d={`M${cx+tw} ${topY} L${cx+tw+4} ${topY} L${cx+bw+4} ${botY} L${cx+bw} ${botY} Z`}
        fill={dark}
      />

      {/* ── Main front panel ─────────────────────────────────────────── */}
      <path
        d={`M${cx-tw} ${topY} L${cx+tw} ${topY} L${cx+bw} ${botY} L${cx-bw} ${botY} Z`}
        fill={main}
      />

      {/* ── Left fold — paper coming from behind, folding over the front */}
      <path
        d={`M${cx-tw} ${topY}
            C${cx-tw+6} ${topY+40} ${cx-bw-2} ${topY+120} ${cx-bw} ${botY}
            L${cx-bw+foldW} ${botY}
            C${cx-bw+foldW-2} ${topY+120} ${cx-tw+foldW+4} ${topY+40} ${cx-tw+foldW} ${topY}
            Z`}
        fill={dark}
        opacity="0.72"
      />

      {/* ── Right fold — lighter (catches more light) ────────────────── */}
      <path
        d={`M${cx+tw-foldW} ${topY}
            C${cx+tw-foldW-4} ${topY+40} ${cx+bw-foldW+2} ${topY+120} ${cx+bw-foldW} ${botY}
            L${cx+bw} ${botY}
            C${cx+bw+2} ${topY+120} ${cx+tw-6} ${topY+40} ${cx+tw} ${topY}
            Z`}
        fill={light}
        opacity="0.65"
      />

      {/* ── Vertical crease lines ─────────────────────────────────────── */}
      <line
        x1={cx - tw + foldW} y1={topY}
        x2={cx - bw + foldW} y2={botY}
        stroke={dark} strokeWidth="0.6" opacity="0.4"
      />
      <line
        x1={cx + tw - foldW} y1={topY}
        x2={cx + bw - foldW} y2={botY}
        stroke={dark} strokeWidth="0.6" opacity="0.35"
      />

      {/* ── Subtle horizontal paper creases ──────────────────────────── */}
      {[0.28, 0.58, 0.82].map((t) => {
        const y = topY + (botY - topY) * t;
        const h = hw(y);
        return (
          <line
            key={t}
            x1={cx - h} y1={y} x2={cx + h} y2={y}
            stroke={dark} strokeWidth="0.4" opacity="0.2"
          />
        );
      })}

      {/* ── Twine band ───────────────────────────────────────────────── */}
      <rect
        x={cx - hw(knotY) + 2} y={knotY - 3.5}
        width={(hw(knotY) - 2) * 2} height={7}
        fill={twine} rx={3.5} opacity="0.9"
      />

      {/* ── Bow loops (left side) ─────────────────────────────────────── */}
      {loop(-55, 24, 9,  twine)}
      {loop(-30, 20, 8,  twineLt)}
      {loop(-80, 18, 7,  twineLt)}

      {/* ── Bow loops (right side) ───────────────────────────────────── */}
      {loop( 55, 24, 9,  twine)}
      {loop( 30, 20, 8,  twineLt)}
      {loop( 80, 18, 7,  twineLt)}

      {/* ── Small top loop ───────────────────────────────────────────── */}
      {loop(  0, 14, 6,  twine)}

      {/* ── Knot centre ──────────────────────────────────────────────── */}
      <ellipse cx={cx} cy={knotY} rx={7.5} ry={5.5} fill={twine} />
      <ellipse cx={cx} cy={knotY} rx={4}   ry={3}   fill={twineLt} opacity="0.6"/>

      {/* ── Dangling twine ends ───────────────────────────────────────── */}
      <path
        d={`M${cx-2},${knotY+5} C${cx-9},${knotY+22} ${cx-16},${knotY+38} ${cx-13},${knotY+54}`}
        fill="none" stroke={twine} strokeWidth="1.6" strokeLinecap="round"
      />
      <path
        d={`M${cx+2},${knotY+5} C${cx+11},${knotY+20} ${cx+17},${knotY+35} ${cx+15},${knotY+52}`}
        fill="none" stroke={twine} strokeWidth="1.6" strokeLinecap="round"
      />
      <path
        d={`M${cx-2},${knotY+5} C${cx-4},${knotY+16} ${cx-2},${knotY+28} ${cx+6},${knotY+42}`}
        fill="none" stroke={twineLt} strokeWidth="1.1" strokeLinecap="round" opacity="0.7"
      />
    </g>
  );
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

export default function BouquetCanvas({ bouquet, width = CW }: Props) {
  const height = Math.round(width * (CH / CW));

  const expanded = useMemo(
    () => bouquet.flowers.flatMap((f) => Array.from({ length: f.count }, () => f)),
    [bouquet.flowers]
  );

  const positions = useMemo(
    () => computePositions(expanded.length),
    [expanded.length]
  );

  const dataUris = useMemo(
    () =>
      expanded.map((f) =>
        `data:image/svg+xml,${encodeURIComponent(
          drawFlower(f.type as FlowerType, bouquet.artStyle as ArtStyle, f.color, FLOWER_SIZE)
        )}`
      ),
    [expanded, bouquet.artStyle]
  );

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <rect width={CW} height={CH} fill="#FDF6EF" />

      {/* Stems */}
      {positions.map((p, i) => (
        <line
          key={`stem-${i}`}
          x1={TIE_X} y1={TIE_Y} x2={p.hx} y2={p.hy}
          stroke="#3a6020" strokeWidth="1.65" strokeLinecap="round"
        />
      ))}

      {/* Flower images */}
      {dataUris.map((uri, i) => {
        const p = positions[i];
        return (
          <image
            key={`flower-${i}`}
            href={uri}
            x={p.hx - FLOWER_SIZE / 2}
            y={p.hy - FLOWER_H}
            width={FLOWER_SIZE}
            height={FLOWER_H}
            transform={`rotate(${p.angleDeg}, ${p.hx}, ${p.hy})`}
          />
        );
      })}

      {/* Kraft wrap */}
      <KraftWrap cx={TIE_X} topY={TIE_Y} color={bouquet.wrap.color} />

      {/* Empty state */}
      {bouquet.flowers.length === 0 && (
        <>
          <text x={CW/2} y={CH/2-24} textAnchor="middle" fill="#C9856A" fontFamily="Georgia, serif" fontSize="15" opacity="0.72">
            Add flowers to begin
          </text>
          <text x={CW/2} y={CH/2} textAnchor="middle" fill="#C9856A" fontFamily="Georgia, serif" fontSize="12" opacity="0.45">
            your bouquet
          </text>
        </>
      )}
    </svg>
  );
}
