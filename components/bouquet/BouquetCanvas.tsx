"use client";

import { useMemo } from "react";
import { BouquetState } from "@/lib/bouquetState";
import { drawFlower, FlowerType, ArtStyle } from "@/lib/drawingUtils";

type Props = {
  bouquet: BouquetState;
  /** Display width in px — canvas aspect is always 400 × 520 */
  width?: number;
};

// Canvas coordinate system
const CW = 400;
const CH = 520;
// Each flower SVG is rendered at this pixel width (height = size * 1.4 = 126)
const FLOWER_SIZE = 90;
const FLOWER_H    = Math.round(FLOWER_SIZE * 1.4); // 126
// The point where all stems converge (top of wrap)
const TIE_X = CW / 2;
const TIE_Y = 328;

// ─── Fan layout ───────────────────────────────────────────────────────────────
// Stems radiate from TIE at different angles so flower heads form an arc.

type FlowerPos = { hx: number; hy: number; angleDeg: number };

function computePositions(n: number): FlowerPos[] {
  if (n === 0) return [];
  // Spread angle widens slightly with more flowers, capped at ±55°
  const spread = Math.min(16 + n * 8, 55);
  return Array.from({ length: n }, (_, i) => {
    // t goes from -1 (left) to +1 (right)
    const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
    const angleDeg = t * spread;
    // Centre stems are slightly longer so heads form a dome
    const stemLen = 155 - Math.abs(t) * 20;
    const rad = angleDeg * (Math.PI / 180);
    return {
      hx: TIE_X + Math.sin(rad) * stemLen,
      hy: TIE_Y - Math.cos(rad) * stemLen,
      angleDeg,
    };
  });
}

// ─── Kraft paper wrap ─────────────────────────────────────────────────────────

function KraftWrap({ cx, topY }: { cx: number; topY: number }) {
  const halfW  = 92;
  const botY   = topY + 168;
  const botHW  = 28;

  return (
    <g>
      {/* Drop shadow */}
      <path
        d={`M${cx-halfW} ${topY} C${cx-halfW/2} ${topY+22} ${cx} ${topY+30} ${cx} ${topY+30} C${cx} ${topY+30} ${cx+halfW/2} ${topY+22} ${cx+halfW} ${topY} L${cx+botHW} ${botY} L${cx} ${botY+12} L${cx-botHW} ${botY} Z`}
        fill="#8a6030"
        opacity="0.18"
        transform="translate(4,6)"
      />

      {/* Right panel — slightly darker kraft */}
      <path
        d={`M${cx} ${topY+30} C${cx+halfW/2} ${topY+22} ${cx+halfW} ${topY} L${cx+botHW} ${botY} L${cx} ${botY+12} Z`}
        fill="#b88c52"
      />
      {/* Left panel — lighter kraft */}
      <path
        d={`M${cx-halfW} ${topY} C${cx-halfW/2} ${topY+22} ${cx} ${topY+30} L${cx} ${botY+12} L${cx-botHW} ${botY} Z`}
        fill="#caa468"
      />

      {/* Centre fold highlight */}
      <line
        x1={cx} y1={topY+30} x2={cx} y2={botY+12}
        stroke="#e0c898" strokeWidth="1.1" opacity="0.55"
      />
      {/* Edge fold lines */}
      <line x1={cx-halfW} y1={topY} x2={cx-botHW} y2={botY} stroke="#9a7040" strokeWidth="0.5" opacity="0.3"/>
      <line x1={cx+halfW} y1={topY} x2={cx+botHW} y2={botY} stroke="#9a7040" strokeWidth="0.5" opacity="0.3"/>

      {/* Tissue paper ruffle at wrap opening */}
      <path
        d={`M${cx-halfW} ${topY}
            C${cx-68} ${topY-10} ${cx-48} ${topY-7} ${cx-28} ${topY-13}
            C${cx-10} ${topY-19} ${cx+2} ${topY-14} ${cx+22} ${topY-20}
            C${cx+42} ${topY-16} ${cx+60} ${topY-9} ${cx+halfW} ${topY}`}
        fill="#f2e8d8"
        stroke="#ddd0b8"
        strokeWidth="0.65"
        opacity="0.9"
      />

      {/* Ribbon band */}
      <ellipse cx={cx} cy={topY+6} rx={24} ry={5} fill="#D4849A" opacity="0.92"/>
      {/* Left bow loop */}
      <path
        d={`M${cx-24} ${topY+6} C${cx-42} ${topY-13} ${cx-54} ${topY+3} ${cx-24} ${topY+6}`}
        fill="#D4849A" opacity="0.82"
      />
      {/* Right bow loop */}
      <path
        d={`M${cx+24} ${topY+6} C${cx+42} ${topY-13} ${cx+54} ${topY+3} ${cx+24} ${topY+6}`}
        fill="#D4849A" opacity="0.82"
      />
      {/* Knot */}
      <ellipse cx={cx} cy={topY+6} rx={7} ry={5.5} fill="#e8a4b8"/>
    </g>
  );
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

export default function BouquetCanvas({ bouquet, width = CW }: Props) {
  const height = Math.round(width * (CH / CW));

  // Expand each FlowerItem by its count so every stem appears individually
  const expanded = useMemo(
    () => bouquet.flowers.flatMap((f) => Array.from({ length: f.count }, () => f)),
    [bouquet.flowers]
  );

  const positions = useMemo(
    () => computePositions(expanded.length),
    [expanded.length]
  );

  // Build data URIs once; re-run when flower list or art style changes
  const dataUris = useMemo(
    () =>
      expanded.map((f) =>
        `data:image/svg+xml,${encodeURIComponent(
          drawFlower(
            f.type as FlowerType,
            bouquet.artStyle as ArtStyle,
            f.color,
            FLOWER_SIZE
          )
        )}`
      ),
    [expanded, bouquet.artStyle]
  );

  return (
    <svg
      viewBox={`0 0 ${CW} ${CH}`}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width={CW} height={CH} fill="#FDF6EF" />

      {/* Stems — drawn behind wrap but in front of background */}
      {positions.map((p, i) => (
        <line
          key={`stem-${i}`}
          x1={TIE_X} y1={TIE_Y}
          x2={p.hx}  y2={p.hy}
          stroke="#3a6020"
          strokeWidth="1.65"
          strokeLinecap="round"
        />
      ))}

      {/* Flower images — each rotated around its stem base (hx, hy) */}
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

      {/* Kraft wrap on top of stem bases */}
      <KraftWrap cx={TIE_X} topY={TIE_Y} />

      {/* Empty state hint */}
      {bouquet.flowers.length === 0 && (
        <>
          <text
            x={CW / 2} y={CH / 2 - 24}
            textAnchor="middle"
            fill="#C9856A"
            fontFamily="Georgia, serif"
            fontSize="15"
            opacity="0.72"
          >
            Add flowers to begin
          </text>
          <text
            x={CW / 2} y={CH / 2}
            textAnchor="middle"
            fill="#C9856A"
            fontFamily="Georgia, serif"
            fontSize="12"
            opacity="0.45"
          >
            your bouquet
          </text>
        </>
      )}
    </svg>
  );
}
