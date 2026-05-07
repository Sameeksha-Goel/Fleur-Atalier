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
const TIE_X  = CW / 2;
const TIE_Y  = 328;           // wrap opening (topY in KraftWrap)
const STEM_Y = TIE_Y + 96;   // stem origin — inside wrap at knot level

// ─── Fan layout ───────────────────────────────────────────────────────────────

type FlowerPos = { hx: number; hy: number; angleDeg: number };

function computePositions(n: number): FlowerPos[] {
  if (n === 0) return [];
  const spread = Math.min(5 + n * 4, 28);
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
    const angleDeg = t * spread;
    const rad = angleDeg * (Math.PI / 180);
    // stemLen is chosen so hy sits exactly 20px above the wrap opening (TIE_Y)
    const stemLen = (STEM_Y - TIE_Y) / Math.cos(rad) + 20;
    return {
      hx: TIE_X + Math.sin(rad) * stemLen,
      hy: STEM_Y - Math.cos(rad) * stemLen,
      angleDeg,
    };
  });
}

// ─── Korean-style paper wrap ──────────────────────────────────────────────────

function KraftWrap({ cx, topY, color }: { cx: number; topY: number; color: string }) {
  const knotY = topY + 96;
  const botY  = topY + 148;

  const topHW  = 76;
  const knotHW = 18;
  const tailHW = 24;

  const main   = color;
  const dark   = darken(color, 14);
  const light  = lighten(color, 20);
  const shadow = darken(color, 28);
  const rib    = "#B8643C";
  const ribLt  = "#D4896A";

  // Perfectly straight-sided cone — control points sit exactly on the straight line
  function cone(lW: number, rW: number) {
    const dy = knotY - topY;
    const dl = lW - knotHW;
    const dr = rW - knotHW;
    const y1 = topY + dy / 3;
    const y2 = topY + dy * 2 / 3;
    return (
      `M${cx - lW},${topY} ` +
      `C${cx - lW + dl / 3},${y1} ${cx - lW + dl * 2 / 3},${y2} ${cx - knotHW},${knotY} ` +
      `L${cx + knotHW},${knotY} ` +
      `C${cx + knotHW + dr / 3},${y2} ${cx + knotHW + dr * 2 / 3},${y1} ${cx + rW},${topY} Z`
    );
  }

  // Narrow paper tails below tie
  const tailsPath =
    `M${cx - knotHW},${knotY} ` +
    `C${cx - tailHW - 4},${knotY + 22} ${cx - tailHW},${botY - 10} ${cx - tailHW + 6},${botY} ` +
    `L${cx + tailHW - 6},${botY} ` +
    `C${cx + tailHW},${botY - 10} ${cx + tailHW + 4},${knotY + 22} ${cx + knotHW},${knotY} Z`;

  const mainPath = cone(topHW, topHW);

  return (
    <g>
      <defs>
        <filter id="kw-grain" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.55 0.65" numOctaves="4" seed="3" stitchTiles="stitch" result="noise"/>
          <feColorMatrix type="saturate" values="0" in="noise" result="mono"/>
          <feComponentTransfer in="mono" result="dim">
            <feFuncA type="linear" slope="0.08"/>
          </feComponentTransfer>
          <feComposite in="dim" in2="SourceGraphic" operator="in"/>
        </filter>
        <clipPath id="kw-clip"><path d={mainPath}/></clipPath>
      </defs>

      {/* Drop shadow */}
      <path d={mainPath}  fill={shadow} opacity="0.13" transform="translate(5,7)"/>
      <path d={tailsPath} fill={shadow} opacity="0.11" transform="translate(5,7)"/>

      {/* Back paper layer — slightly wider, shows as folded edge on both sides */}
      <path d={cone(topHW + 8, topHW + 8)} fill={dark} opacity="0.75"/>

      {/* Tails — back layer */}
      <path d={tailsPath} fill={dark} opacity="0.78"/>

      {/* Right front tail panel — lighter */}
      <path
        d={`M${cx},${knotY} L${cx},${botY} L${cx + tailHW - 6},${botY} C${cx + tailHW + 4},${botY - 10} ${cx + tailHW},${knotY + 22} L${cx + knotHW},${knotY} Z`}
        fill={light} opacity="0.85"
      />

      {/* Main cone — front layer */}
      <path d={mainPath} fill={main}/>

      {/* Left fold strip — narrow dark band along left edge */}
      <path
        d={`M${cx - topHW},${topY} L${cx - topHW + 16},${topY} L${cx - knotHW + 3},${knotY} L${cx - knotHW},${knotY} Z`}
        fill={dark} opacity="0.55"
      />

      {/* Right light strip — narrow light band along right edge */}
      <path
        d={`M${cx + topHW - 16},${topY} L${cx + topHW},${topY} L${cx + knotHW},${knotY} L${cx + knotHW - 3},${knotY} Z`}
        fill={light} opacity="0.42"
      />

      {/* Crease lines */}
      <line x1={cx - topHW}      y1={topY} x2={cx - knotHW} y2={knotY} stroke={dark} strokeWidth="0.6" opacity="0.25"/>
      <line x1={cx - topHW + 26} y1={topY} x2={cx - 6}       y2={knotY} stroke={dark} strokeWidth="0.35" opacity="0.15"/>
      <line x1={cx + topHW}      y1={topY} x2={cx + knotHW} y2={knotY} stroke={dark} strokeWidth="0.6" opacity="0.20"/>
      <line x1={cx}              y1={knotY} x2={cx + 4}       y2={botY}  stroke={dark} strokeWidth="0.45" opacity="0.16"/>

      {/* Subtle paper grain */}
      <rect
        x={cx - topHW - 6} y={topY - 4}
        width={(topHW + 6) * 2} height={knotY - topY + 12}
        fill={dark} filter="url(#kw-grain)"
        clipPath="url(#kw-clip)" opacity="0.14"
      />

      {/* Ribbon bow — left loop */}
      <path
        d={`M${cx},${knotY} C${cx - 28},${knotY - 16} ${cx - 36},${knotY - 2} ${cx - 20},${knotY + 10} C${cx - 10},${knotY + 14} ${cx - 2},${knotY + 4} ${cx},${knotY} Z`}
        fill={rib}
      />
      {/* Right loop */}
      <path
        d={`M${cx},${knotY} C${cx + 28},${knotY - 16} ${cx + 36},${knotY - 2} ${cx + 20},${knotY + 10} C${cx + 10},${knotY + 14} ${cx + 2},${knotY + 4} ${cx},${knotY} Z`}
        fill={ribLt}
      />
      {/* Knot centre */}
      <ellipse cx={cx} cy={knotY} rx={8}   ry={5}   fill={rib}/>
      <ellipse cx={cx} cy={knotY} rx={4.5} ry={2.8} fill={ribLt} opacity="0.55"/>

      {/* Ribbon tails */}
      <path d={`M${cx - 4},${knotY + 5} C${cx - 14},${knotY + 34} ${cx - 18},${knotY + 66} ${cx - 10},${knotY + 82}`} fill="none" stroke={rib}   strokeWidth="5.5" strokeLinecap="round"/>
      <path d={`M${cx + 4},${knotY + 5} C${cx + 16},${knotY + 32} ${cx + 20},${knotY + 62} ${cx + 12},${knotY + 78}`} fill="none" stroke={ribLt} strokeWidth="4.5" strokeLinecap="round"/>
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

      {/* Stems — origin is inside the wrap; wrap covers the lower segment */}
      {positions.map((p, i) => (
        <line
          key={`stem-${i}`}
          x1={TIE_X} y1={STEM_Y} x2={p.hx} y2={p.hy}
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

      {/* Wrap drawn last — covers stem bases inside the cone */}
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
