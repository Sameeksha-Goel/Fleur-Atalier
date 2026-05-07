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
  // Key y-positions
  const knotY = topY + 82;   // waist / tie point
  const botY  = topY + 175;  // bottom soft tip

  // Half-widths at each level
  const topHW  = 90;  // opening
  const waistHW = 28; // tie
  const botHW  = 6;   // tip

  // Colour palette
  const main   = darken(color, 4);
  const dark   = darken(color, 20);
  const light  = lighten(color, 15);
  const shadow = darken(color, 36);
  const twine  = "#8a6830";
  const twineLt = "#b8924a";

  const n = (v: number) => v.toFixed(1);

  // Hourglass silhouette path (reused for shadow + main body)
  const hourglassPath = (lx0: number, rx0: number, lxW: number, rxW: number, lxB: number, rxB: number) =>
    `M${lx0},${topY} ` +
    `C${cx - 74} ${topY + 38} ${cx - lxW - 2} ${knotY - 14} ${cx - lxW},${knotY} ` +
    `C${cx - 20} ${knotY + 42} ${cx - lxB - 4} ${botY - 18} ${cx - lxB},${botY} ` +
    `L${cx + rxB},${botY} ` +
    `C${cx + rxB + 4} ${botY - 18} ${cx + 20} ${knotY + 42} ${cx + rxW},${knotY} ` +
    `C${cx + rxW + 2} ${knotY - 14} ${cx + 74} ${topY + 38} ${rx0},${topY} Z`;

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
            C${cx - 74} ${topY + 38} ${cx - waistHW - 2} ${knotY - 14} ${cx - waistHW},${knotY}
            L${cx - waistHW},${knotY}
            C${cx - waistHW + 4} ${knotY - 10} ${cx - 54} ${topY + 34} ${cx - topHW + 20},${topY} Z`}
        fill={dark} opacity="0.65"
      />

      {/* Right highlight strip — lighter, catches light */}
      <path
        d={`M${cx + topHW - 20},${topY}
            C${cx + 54} ${topY + 34} ${cx + waistHW - 4} ${knotY - 10} ${cx + waistHW},${knotY}
            C${cx + waistHW + 2} ${knotY - 14} ${cx + 74} ${topY + 38} ${cx + topHW},${topY} Z`}
        fill={light} opacity="0.55"
      />

      {/* Diagonal crease lines — upper half (corners to waist) */}
      <line x1={cx - topHW}      y1={topY} x2={cx - waistHW} y2={knotY} stroke={dark} strokeWidth="0.7" opacity="0.32"/>
      <line x1={cx - topHW + 20} y1={topY} x2={cx - 10}      y2={knotY} stroke={dark} strokeWidth="0.5" opacity="0.22"/>
      <line x1={cx + topHW}      y1={topY} x2={cx + waistHW} y2={knotY} stroke={dark} strokeWidth="0.7" opacity="0.28"/>
      <line x1={cx + topHW - 20} y1={topY} x2={cx + 10}      y2={knotY} stroke={dark} strokeWidth="0.5" opacity="0.18"/>

      {/* Crease lines — lower half (waist to tip) */}
      <line x1={cx - waistHW} y1={knotY} x2={cx - botHW} y2={botY} stroke={dark} strokeWidth="0.5" opacity="0.25"/>
      <line x1={cx + waistHW} y1={knotY} x2={cx + botHW} y2={botY} stroke={dark} strokeWidth="0.5" opacity="0.22"/>

      {/* Paper rim at top opening (suggests layered paper) */}
      <path
        d={`M${cx - topHW},${topY} C${cx - 55} ${topY - 9} ${cx + 55} ${topY - 9} ${cx + topHW},${topY}`}
        fill="none" stroke={dark} strokeWidth="1.3" opacity="0.45"
      />
      <path
        d={`M${cx - topHW + 14},${topY} C${cx - 40} ${topY - 5} ${cx + 40} ${topY - 5} ${cx + topHW - 14},${topY}`}
        fill="none" stroke={dark} strokeWidth="0.8" opacity="0.28"
      />

      {/* Twine band at waist */}
      <rect
        x={cx - waistHW + 2} y={knotY - 4}
        width={(waistHW - 2) * 2} height={8}
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
