"use client";

import { useMemo } from "react";
import { BouquetState } from "@/lib/bouquetState";
import { drawFlower, FlowerType, ArtStyle, lighten, darken } from "@/lib/drawingUtils";
import { getRoseImage } from "@/lib/flowerAssets";

type Props = {
  bouquet: BouquetState;
  width?: number;
};

const CW = 400;
const CH = 520;
const FLOWER_SIZE = 90;
const FLOWER_H    = Math.round(FLOWER_SIZE * 1.4);
const TIE_X  = CW / 2;
const TIE_Y  = 195;
const STEM_Y = TIE_Y + 110; // = 305, knot level

// ─── Fan layout ───────────────────────────────────────────────────────────────

type FlowerPos = { hx: number; hy: number; angleDeg: number };

function computePositions(n: number): FlowerPos[] {
  if (n === 0) return [];
  const spread = Math.min(5 + n * 4, 28);
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
    const angleDeg = t * spread;
    const rad = angleDeg * (Math.PI / 180);
    const stemLen = (STEM_Y - TIE_Y) / Math.cos(rad) + 40;
    return {
      hx: TIE_X + Math.sin(rad) * stemLen,
      hy: STEM_Y - Math.cos(rad) * stemLen,
      angleDeg,
    };
  });
}

// ─── Back wrap — rendered BEFORE flowers (appears behind them) ────────────────
// Only draws the fold-panel "ears" that extend ABOVE TIE_Y.
// These are the paper flaps visible on the sides in the reference image.

function WrapBack({ cx, topY, color }: { cx: number; topY: number; color: string }) {
  const light  = lighten(color, 22);
  const dark   = darken(color, 14);
  const oc     = darken(color, 48);

  return (
    <g>
      {/* Left fold panel — higher triangular flap on upper-left */}
      <path
        d={`M${cx - 82},${topY - 32} L${cx - 90},${topY} L${cx + 20},${topY} Z`}
        fill={light} stroke={oc} strokeWidth="1.4" strokeLinejoin="round"
      />
      {/* Right fold panel — slightly lower flap on upper-right */}
      <path
        d={`M${cx + 70},${topY - 14} L${cx + 90},${topY} L${cx + 20},${topY} Z`}
        fill={dark} opacity="0.82" stroke={oc} strokeWidth="1.2" strokeLinejoin="round"
      />
    </g>
  );
}

// ─── Front wrap — rendered AFTER flowers (covers lower stems) ─────────────────
// Geometric paper cone (straight sides, fold panels) + large decorative bow.
// Nothing here extends above topY, so stems are never cut.

function WrapFront({ cx, topY, color }: { cx: number; topY: number; color: string }) {
  const knotY  = topY + 110;  // = 305
  const botY   = topY + 218;  // = 413  paper tails end
  const topW   = 88;           // half-width at opening
  const botW   = 20;           // half-width at tie
  const tailHW = 26;

  const main   = color;
  const light  = lighten(color, 22);
  const dark   = darken(color, 14);
  const shadow = darken(color, 28);
  const oc     = darken(color, 48);

  // Bow — always dusty rose to match the reference image aesthetic
  const bow    = "#D4849A";
  const bowLt  = lighten("#D4849A", 22);
  const bowDk  = darken("#D4849A", 20);
  const bowOc  = darken("#D4849A", 42);

  // Straight-sided trapezoid (geometric, like the reference)
  const cone = `M${cx - topW},${topY} L${cx + topW},${topY} L${cx + botW},${knotY} L${cx - botW},${knotY} Z`;

  // Paper tails below the bow tie
  const tails =
    `M${cx - botW},${knotY} ` +
    `C${cx - tailHW - 4},${knotY + 26} ${cx - tailHW},${botY - 12} ${cx - tailHW + 5},${botY} ` +
    `L${cx + tailHW - 5},${botY} ` +
    `C${cx + tailHW},${botY - 12} ${cx + tailHW + 4},${knotY + 26} ${cx + botW},${knotY} Z`;

  return (
    <g>
      {/* Drop shadow */}
      <path d={cone}  fill={shadow} opacity="0.11" transform="translate(6,7)"/>
      <path d={tails} fill={shadow} opacity="0.09" transform="translate(6,7)"/>

      {/* Paper tails — back layer */}
      <path d={tails} fill={dark} opacity="0.74"/>
      {/* Right tail lighter (front panel) */}
      <path
        d={`M${cx},${knotY} L${cx},${botY} L${cx + tailHW - 5},${botY} C${cx + tailHW + 4},${botY - 12} ${cx + tailHW},${knotY + 26} L${cx + botW},${knotY} Z`}
        fill={light} opacity="0.80"
      />

      {/* Main cone body */}
      <path d={cone} fill={main} stroke={oc} strokeWidth="1.8" strokeLinejoin="round"/>

      {/* Right panel — slightly darker, shows the fold-over from the right */}
      <path
        d={`M${cx + 20},${topY} L${cx + topW},${topY} L${cx + botW},${knotY} L${cx + botW - 5},${knotY} L${cx + 32},${topY} Z`}
        fill={dark} opacity="0.40"
      />

      {/* Left light strip — catches light on the left face */}
      <path
        d={`M${cx - topW},${topY} L${cx - topW + 18},${topY} L${cx - botW + 4},${knotY} L${cx - botW},${knotY} Z`}
        fill={light} opacity="0.32"
      />

      {/* Fold crease lines */}
      <line x1={cx - topW} y1={topY} x2={cx - botW}     y2={knotY} stroke={oc} strokeWidth="1.0" opacity="0.28"/>
      <line x1={cx + 20}   y1={topY} x2={cx + botW - 2} y2={knotY} stroke={oc} strokeWidth="0.9" opacity="0.25"/>
      <line x1={cx + topW} y1={topY} x2={cx + botW}     y2={knotY} stroke={oc} strokeWidth="1.0" opacity="0.22"/>

      {/* ── Large decorative bow ── */}

      {/* Left bow loop */}
      <path
        d={`M${cx - 4},${knotY} C${cx - 6},${knotY - 30} ${cx - 72},${knotY - 46} ${cx - 72},${knotY} C${cx - 72},${knotY + 46} ${cx - 6},${knotY + 30} ${cx - 4},${knotY} Z`}
        fill={bow} stroke={bowOc} strokeWidth="1.3"
      />
      {/* Left loop highlight */}
      <path
        d={`M${cx - 8},${knotY} C${cx - 10},${knotY - 20} ${cx - 54},${knotY - 32} ${cx - 54},${knotY} C${cx - 54},${knotY + 32} ${cx - 10},${knotY + 20} ${cx - 8},${knotY} Z`}
        fill={bowLt} opacity="0.38"
      />
      {/* Left loop inner crease */}
      <path
        d={`M${cx - 4},${knotY - 4} C${cx - 24},${knotY - 14} ${cx - 55},${knotY - 12} ${cx - 60},${knotY}`}
        fill="none" stroke={bowDk} strokeWidth="0.9" opacity="0.45"
      />

      {/* Right bow loop */}
      <path
        d={`M${cx + 4},${knotY} C${cx + 6},${knotY - 30} ${cx + 72},${knotY - 46} ${cx + 72},${knotY} C${cx + 72},${knotY + 46} ${cx + 6},${knotY + 30} ${cx + 4},${knotY} Z`}
        fill={bowLt} stroke={bowOc} strokeWidth="1.3"
      />
      {/* Right loop shadow */}
      <path
        d={`M${cx + 8},${knotY} C${cx + 10},${knotY - 20} ${cx + 54},${knotY - 32} ${cx + 54},${knotY} C${cx + 54},${knotY + 32} ${cx + 10},${knotY + 20} ${cx + 8},${knotY} Z`}
        fill={bowDk} opacity="0.22"
      />
      {/* Right loop inner crease */}
      <path
        d={`M${cx + 4},${knotY - 4} C${cx + 24},${knotY - 14} ${cx + 55},${knotY - 12} ${cx + 60},${knotY}`}
        fill="none" stroke={bowDk} strokeWidth="0.9" opacity="0.38"
      />

      {/* Ribbon tails streaming down */}
      <path d={`M${cx - 6},${knotY + 8} C${cx - 24},${knotY + 36} ${cx - 32},${knotY + 68} ${cx - 24},${knotY + 92}`} fill="none" stroke={bow}   strokeWidth="9"   strokeLinecap="round"/>
      <path d={`M${cx - 6},${knotY + 8} C${cx - 22},${knotY + 34} ${cx - 28},${knotY + 64} ${cx - 20},${knotY + 88}`} fill="none" stroke={bowLt} strokeWidth="4.5" strokeLinecap="round"/>
      <path d={`M${cx + 6},${knotY + 8} C${cx + 26},${knotY + 34} ${cx + 34},${knotY + 66} ${cx + 26},${knotY + 90}`} fill="none" stroke={bow}   strokeWidth="9"   strokeLinecap="round"/>
      <path d={`M${cx + 6},${knotY + 8} C${cx + 24},${knotY + 32} ${cx + 30},${knotY + 62} ${cx + 22},${knotY + 86}`} fill="none" stroke={bowLt} strokeWidth="4.5" strokeLinecap="round"/>

      {/* Center bow knot */}
      <ellipse cx={cx} cy={knotY} rx={14} ry={10} fill={bow}   stroke={bowOc} strokeWidth="1.3"/>
      <ellipse cx={cx} cy={knotY} rx={8}  ry={5.5} fill={bowLt} opacity="0.55"/>
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

  // Rose → actual PNG file; all other flowers → generated SVG data URI
  const flowerSrcs = useMemo(
    () =>
      expanded.map((f) => {
        if (f.type === "rose") return getRoseImage(f.color);
        return `data:image/svg+xml,${encodeURIComponent(
          drawFlower(f.type as FlowerType, bouquet.artStyle as ArtStyle, f.color, FLOWER_SIZE)
        )}`;
      }),
    [expanded, bouquet.artStyle]
  );

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <rect width={CW} height={CH} fill="#FDF6EF"/>

      {/* Back fold panels — behind flowers */}
      <WrapBack cx={TIE_X} topY={TIE_Y} color={bouquet.wrap.color}/>

      {/* Stems */}
      {positions.map((p, i) => (
        <line
          key={`stem-${i}`}
          x1={TIE_X} y1={STEM_Y} x2={p.hx} y2={p.hy}
          stroke="#3a6020" strokeWidth="1.65" strokeLinecap="round"
        />
      ))}

      {/* Flowers — in front of back panels */}
      {flowerSrcs.map((src, i) => {
        const p = positions[i];
        // Static image files (JPEG/PNG) have a white background — multiply blend
        // makes white pixels transparent against any light background.
        const isStaticFile = src.startsWith("/");
        return (
          <image
            key={`flower-${i}`}
            href={src}
            x={p.hx - FLOWER_SIZE / 2}
            y={p.hy - FLOWER_H}
            width={FLOWER_SIZE}
            height={FLOWER_H}
            transform={`rotate(${p.angleDeg}, ${p.hx}, ${p.hy})`}
            preserveAspectRatio="xMidYMax meet"
            style={isStaticFile ? { mixBlendMode: "multiply" } : undefined}
          />
        );
      })}

      {/* Front cone + bow — in front of everything */}
      <WrapFront cx={TIE_X} topY={TIE_Y} color={bouquet.wrap.color}/>

      {bouquet.flowers.length === 0 && (
        <>
          <text x={CW/2} y={CH/2-24} textAnchor="middle" fill="#C9856A" fontFamily="Georgia, serif" fontSize="15" opacity="0.72">Add flowers to begin</text>
          <text x={CW/2} y={CH/2}    textAnchor="middle" fill="#C9856A" fontFamily="Georgia, serif" fontSize="12" opacity="0.45">your bouquet</text>
        </>
      )}
    </svg>
  );
}
