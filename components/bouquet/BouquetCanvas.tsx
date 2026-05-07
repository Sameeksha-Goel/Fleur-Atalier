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
  const spread = Math.min(5 + n * 4, 25);
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
    const angleDeg = t * spread;
    const stemLen  = 138 - Math.abs(t) * 8;
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
  // Key y-positions
  const knotY = topY + 92;   // tie point (60% down)
  const botY  = topY + 165;  // bottom

  // Half-widths — smooth gentle cone, no dramatic pinch
  const topHW   = 62;  // opening (moderate, like reference)
  const waistHW = 34;  // at tie — gradual not dramatic
  const botHW   = 14;  // base

  // Colour palette
  const main   = darken(color, 4);
  const dark   = darken(color, 20);
  const light  = lighten(color, 15);
  const shadow = darken(color, 36);
  const twine  = "#8a6830";
  const twineLt = "#b8924a";

  const n = (v: number) => v.toFixed(1);

  // Smooth cone silhouette (no dramatic pinch — matches reference)
  const hourglassPath = (lx0: number, rx0: number, lxW: number, rxW: number, lxB: number, rxB: number) =>
    `M${lx0},${topY} ` +
    `C${lx0 + 4} ${topY + 44} ${cx - lxW - 4} ${knotY - 20} ${cx - lxW},${knotY} ` +
    `C${cx - lxW + 4} ${knotY + 32} ${cx - lxB - 2} ${botY - 14} ${cx - lxB},${botY} ` +
    `L${cx + rxB},${botY} ` +
    `C${cx + rxB + 2} ${botY - 14} ${cx + rxW - 4} ${knotY + 32} ${cx + rxW},${knotY} ` +
    `C${cx + rxW + 4} ${knotY - 20} ${rx0 - 4} ${topY + 44} ${rx0},${topY} Z`;

  // Bow loop — teardrop-shaped path from knot centre outward
  function loop(angleDeg: number, len: number, w: number, col: string, opacity = 1) {
    const a  = (angleDeg - 90) * Math.PI / 180;
    const pr = a + Math.PI / 2;
    const tx = cx + Math.cos(a) * len;
    const ty = knotY + Math.sin(a) * len;
    const c1x = cx     + Math.cos(a) * len * 0.4 + Math.cos(pr) * w;
    const c1y = knotY  + Math.sin(a) * len * 0.4 + Math.sin(pr) * w;
    const c2x = tx + Math.cos(pr) * w * 0.38;
    const c2y = ty + Math.sin(pr) * w * 0.38;
    const c3x = tx - Math.cos(pr) * w * 0.38;
    const c3y = ty - Math.sin(pr) * w * 0.38;
    const c4x = cx     + Math.cos(a) * len * 0.4 - Math.cos(pr) * w;
    const c4y = knotY  + Math.sin(a) * len * 0.4 - Math.sin(pr) * w;
    return (
      <path
        key={angleDeg}
        d={`M${cx},${knotY} C${n(c1x)},${n(c1y)} ${n(c2x)},${n(c2y)} ${n(tx)},${n(ty)} C${n(c3x)},${n(c3y)} ${n(c4x)},${n(c4y)} ${cx},${knotY} Z`}
        fill={col} opacity={opacity}
      />
    );
  }

  return (
    <g>
      {/* Shadow */}
      <path
        d={hourglassPath(cx - topHW - 2, cx + topHW + 2, waistHW + 2, waistHW + 2, botHW + 2, botHW + 2)}
        fill={shadow} opacity="0.2" transform="translate(3,5)"
      />

      {/* Main hourglass body */}
      <path
        d={hourglassPath(cx - topHW, cx + topHW, waistHW, waistHW, botHW, botHW)}
        fill={main}
      />

      {/* Left fold strip — darker, paper edge folding over from behind */}
      <path
        d={`M${cx - topHW},${topY}
            C${cx - topHW + 4} ${topY + 44} ${cx - waistHW - 4} ${knotY - 20} ${cx - waistHW},${knotY}
            C${cx - waistHW + 6} ${knotY - 12} ${cx - topHW + 18} ${topY + 40} ${cx - topHW + 16},${topY} Z`}
        fill={dark} opacity="0.6"
      />

      {/* Right highlight strip — lighter, catches light */}
      <path
        d={`M${cx + topHW - 16},${topY}
            C${cx + topHW - 18} ${topY + 40} ${cx + waistHW - 6} ${knotY - 12} ${cx + waistHW},${knotY}
            C${cx + waistHW + 4} ${knotY - 20} ${cx + topHW - 4} ${topY + 44} ${cx + topHW},${topY} Z`}
        fill={light} opacity="0.5"
      />

      {/* Diagonal crease lines — corners converging at tie */}
      <line x1={cx - topHW}      y1={topY} x2={cx - waistHW} y2={knotY} stroke={dark} strokeWidth="0.65" opacity="0.3"/>
      <line x1={cx - topHW + 16} y1={topY} x2={cx - 12}      y2={knotY} stroke={dark} strokeWidth="0.45" opacity="0.2"/>
      <line x1={cx + topHW}      y1={topY} x2={cx + waistHW} y2={knotY} stroke={dark} strokeWidth="0.65" opacity="0.26"/>
      <line x1={cx + topHW - 16} y1={topY} x2={cx + 12}      y2={knotY} stroke={dark} strokeWidth="0.45" opacity="0.16"/>

      {/* Crease lines lower half */}
      <line x1={cx - waistHW} y1={knotY} x2={cx - botHW} y2={botY} stroke={dark} strokeWidth="0.45" opacity="0.22"/>
      <line x1={cx + waistHW} y1={knotY} x2={cx + botHW} y2={botY} stroke={dark} strokeWidth="0.45" opacity="0.2"/>

      {/* Paper rim at opening — suggests layered paper */}
      <path
        d={`M${cx - topHW},${topY} C${cx - 44} ${topY - 8} ${cx + 44} ${topY - 8} ${cx + topHW},${topY}`}
        fill="none" stroke={dark} strokeWidth="1.2" opacity="0.4"
      />
      <path
        d={`M${cx - topHW + 12},${topY} C${cx - 30} ${topY - 4} ${cx + 30} ${topY - 4} ${cx + topHW - 12},${topY}`}
        fill="none" stroke={dark} strokeWidth="0.7" opacity="0.24"
      />

      {/* Twine band at tie */}
      <rect
        x={cx - waistHW + 3} y={knotY - 4}
        width={(waistHW - 3) * 2} height={8}
        rx={4} fill={twine} opacity="0.88"
      />

      {/* Bow loops — 10 loops, alternating colours, varying sizes */}
      {loop(-55, 30, 11, twine)}
      {loop(-25, 26, 10, twineLt)}
      {loop(-80, 22,  9, twineLt, 0.9)}
      {loop(-105, 18, 7, twine,   0.85)}
      {loop( 55, 30, 11, twine)}
      {loop( 25, 26, 10, twineLt)}
      {loop( 80, 22,  9, twineLt, 0.9)}
      {loop(105, 18,  7, twine,   0.85)}
      {loop(  0, 18,  7, twineLt, 0.88)}
      {loop(180, 14,  6, twine,   0.7)}

      {/* Knot centre */}
      <ellipse cx={cx} cy={knotY} rx={9}   ry={6.5} fill={twine}/>
      <ellipse cx={cx} cy={knotY} rx={5}   ry={3.5} fill={twineLt} opacity="0.65"/>

      {/* Dangling twine ends */}
      <path d={`M${cx-3},${knotY+6} C${cx-10},${knotY+26} ${cx-18},${knotY+46} ${cx-16},${knotY+62}`} fill="none" stroke={twine}   strokeWidth="1.8" strokeLinecap="round"/>
      <path d={`M${cx+3},${knotY+6} C${cx+12},${knotY+24} ${cx+19},${knotY+42} ${cx+18},${knotY+58}`} fill="none" stroke={twine}   strokeWidth="1.8" strokeLinecap="round"/>
      <path d={`M${cx+1},${knotY+6} C${cx+4}, ${knotY+20} ${cx+8}, ${knotY+36} ${cx+10},${knotY+52}`} fill="none" stroke={twineLt} strokeWidth="1.2" strokeLinecap="round" opacity="0.75"/>
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
