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

// ─── Korean-style paper wrap ──────────────────────────────────────────────────

function KraftWrap({ cx, topY, color }: { cx: number; topY: number; color: string }) {
  const knotY = topY + 96;   // ribbon tie
  const botY  = topY + 172;  // bottom of paper tails

  const topHW  = 80;  // wide opening
  const knotHW = 20;  // narrow at tie
  const tailHW = 48;  // tails fan slightly wider

  const main   = color;
  const dark   = darken(color, 14);
  const light  = lighten(color, 20);
  const shadow = darken(color, 28);
  const rib    = "#B8643C";
  const ribLt  = "#D4896A";

  // Smooth bezier cone from opening to tie
  function cone(lW: number, rW: number) {
    return (
      `M${cx - lW},${topY} ` +
      `C${cx - lW + 8},${topY + 50} ${cx - knotHW - 8},${knotY - 22} ${cx - knotHW},${knotY} ` +
      `L${cx + knotHW},${knotY} ` +
      `C${cx + knotHW + 8},${knotY - 22} ${cx + rW - 8},${topY + 50} ${cx + rW},${topY} Z`
    );
  }

  // Paper tails below tie
  const tailsPath =
    `M${cx - knotHW},${knotY} ` +
    `C${cx - tailHW},${knotY + 36} ${cx - tailHW + 8},${botY - 14} ${cx - tailHW + 16},${botY} ` +
    `L${cx + tailHW - 16},${botY} ` +
    `C${cx + tailHW - 8},${botY - 14} ${cx + tailHW},${knotY + 36} ${cx + knotHW},${knotY} Z`;

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

      {/* Back paper layer — offset left, shows as folded edge at top edges */}
      <path d={cone(topHW + 10, topHW - 14)} fill={dark} opacity="0.85"/>

      {/* Tails — back layer */}
      <path d={tailsPath} fill={dark} opacity="0.80"/>

      {/* Right front tail panel — lighter, overlaps on top */}
      <path
        d={`M${cx},${knotY} L${cx},${botY} C${cx + tailHW - 16},${botY} ${cx + tailHW - 8},${botY - 14} ${cx + tailHW},${knotY + 36} L${cx + knotHW},${knotY} Z`}
        fill={light} opacity="0.88"
      />

      {/* Main cone — front layer */}
      <path d={mainPath} fill={main}/>

      {/* Left fold dark strip — back paper peeking at left edge */}
      <path
        d={`M${cx - topHW},${topY} C${cx - topHW + 7},${topY + 50} ${cx - knotHW - 8},${knotY - 22} ${cx - knotHW},${knotY} C${cx - knotHW - 4},${knotY - 14} ${cx - topHW + 18},${topY + 46} ${cx - topHW + 16},${topY} Z`}
        fill={dark} opacity="0.58"
      />

      {/* Right light strip — paper catching light */}
      <path
        d={`M${cx + topHW - 18},${topY} C${cx + topHW - 14},${topY + 48} ${cx + knotHW + 5},${knotY - 20} ${cx + knotHW},${knotY} L${cx + topHW},${topY} Z`}
        fill={light} opacity="0.45"
      />

      {/* Diagonal crease lines */}
      <line x1={cx - topHW}      y1={topY} x2={cx - knotHW} y2={knotY} stroke={dark} strokeWidth="0.6" opacity="0.28"/>
      <line x1={cx - topHW + 26} y1={topY} x2={cx - 6}       y2={knotY} stroke={dark} strokeWidth="0.4" opacity="0.17"/>
      <line x1={cx + topHW}      y1={topY} x2={cx + knotHW} y2={knotY} stroke={dark} strokeWidth="0.6" opacity="0.22"/>
      <line x1={cx}              y1={knotY} x2={cx + 4}       y2={botY}  stroke={dark} strokeWidth="0.5" opacity="0.18"/>

      {/* Paper rim at opening — layered paper edges */}
      <path
        d={`M${cx - topHW},${topY} C${cx - 52},${topY - 10} ${cx + 52},${topY - 10} ${cx + topHW},${topY}`}
        fill="none" stroke={dark} strokeWidth="1.1" opacity="0.36"
      />
      <path
        d={`M${cx - topHW + 14},${topY} C${cx - 38},${topY - 5} ${cx + 38},${topY - 5} ${cx + topHW - 14},${topY}`}
        fill="none" stroke={dark} strokeWidth="0.7" opacity="0.22"
      />

      {/* Subtle paper grain */}
      <rect
        x={cx - topHW - 6} y={topY - 4}
        width={(topHW + 6) * 2} height={knotY - topY + 12}
        fill={dark} filter="url(#kw-grain)"
        clipPath="url(#kw-clip)" opacity="0.15"
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

      {/* Long ribbon tails streaming down */}
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
