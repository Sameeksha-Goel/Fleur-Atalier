"use client";

import { useMemo } from "react";
import { BouquetState } from "@/lib/bouquetState";
import {
  getRoseImage, getPeonyImage, getLilyImage,
  SUNFLOWER_IMAGE,
  BABYS_BREATH_IMAGE, LAVENDER_IMAGE,
  WRAP_IMAGES,
} from "@/lib/flowerAssets";

type Props = {
  bouquet: BouquetState;
  width?: number;
};

const CW = 400;
const CH = 520;

const FLOWER_SIZE = 130;
const FLOWER_H    = Math.round(FLOWER_SIZE * 1.4);

const FILLER_SIZE = 95;
const FILLER_H    = Math.round(FILLER_SIZE * 1.9);

const TIE_X = CW / 2;
const TIE_Y = 195;

// ─── Layout helpers ───────────────────────────────────────────────────────────

type Pos = { hx: number; hy: number; angleDeg: number };

function computeFlowerPositions(n: number): Pos[] {
  if (n === 0) return [];
  const spread = Math.min(5 + n * 4, 25);
  return Array.from({ length: n }, (_, i) => {
    const t      = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
    const angleDeg = t * spread;
    const rad    = angleDeg * (Math.PI / 180);
    const hy     = TIE_Y + 88 + Math.round(22 * t * t);
    return { hx: TIE_X + Math.sin(rad) * 55, hy, angleDeg };
  });
}

function computeFillerPositions(n: number): Pos[] {
  if (n === 0) return [];
  const spread = Math.min(10 + n * 8, 32);
  return Array.from({ length: n }, (_, i) => {
    const t      = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
    const angleDeg = t * spread;
    const rad    = angleDeg * (Math.PI / 180);
    const hy     = TIE_Y + 78;
    return { hx: TIE_X + Math.sin(rad) * 68, hy, angleDeg };
  });
}

function fillerSrc(type: string): string {
  if (type === "babysbreath") return BABYS_BREATH_IMAGE;
  if (type === "lavender")    return LAVENDER_IMAGE;
  return BABYS_BREATH_IMAGE;
}

function flowerSrc(type: string, color: string): string {
  if (type === "rose")      return getRoseImage(color);
  if (type === "peony")     return getPeonyImage(color);
  if (type === "lily")      return getLilyImage(color);
  if (type === "sunflower") return SUNFLOWER_IMAGE;
  return getRoseImage(color);
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

export default function BouquetCanvas({ bouquet, width = CW }: Props) {
  const height = Math.round(width * (CH / CW));

  const expandedFlowers = useMemo(
    () => bouquet.flowers.flatMap((f) => Array.from({ length: f.count }, () => f)),
    [bouquet.flowers]
  );

  const expandedFillers = useMemo(
    () => bouquet.fillers.flatMap((f) => Array.from({ length: f.count }, () => f)),
    [bouquet.fillers]
  );

  const flowerPositions = useMemo(() => computeFlowerPositions(expandedFlowers.length), [expandedFlowers.length]);
  const fillerPositions = useMemo(() => computeFillerPositions(expandedFillers.length), [expandedFillers.length]);

  // Outside-first render order so center flowers appear on top
  const flowerRenderOrder = useMemo(() => {
    const n = expandedFlowers.length;
    return Array.from({ length: n }, (_, i) => i).sort((a, b) => {
      const ta = n <= 1 ? 0 : Math.abs((a / (n - 1)) * 2 - 1);
      const tb = n <= 1 ? 0 : Math.abs((b / (n - 1)) * 2 - 1);
      return tb - ta;
    });
  }, [expandedFlowers.length]);

  const wrapSrc = WRAP_IMAGES[bouquet.wrap.image];

  const isEmpty = bouquet.flowers.length === 0 && bouquet.fillers.length === 0;

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Clips flowers/fillers so stems don't bleed below the wrap opening */}
        <clipPath id="flower-clip">
          <rect x={0} y={0} width={CW} height={TIE_Y + 5} />
        </clipPath>
      </defs>

      <rect width={CW} height={CH} fill="#FDF6EF" />

      {/* Fillers — behind everything */}
      <g clipPath="url(#flower-clip)">
        {fillerPositions.map((p, i) => (
          <image
            key={`filler-${i}`}
            href={fillerSrc(expandedFillers[i].type)}
            x={p.hx - FILLER_SIZE / 2}
            y={p.hy - FILLER_H}
            width={FILLER_SIZE}
            height={FILLER_H}
            transform={`rotate(${p.angleDeg}, ${p.hx}, ${p.hy})`}
            preserveAspectRatio="xMidYMax meet"
          />
        ))}
      </g>

      {/* Main flowers — outer renders first, center on top */}
      <g clipPath="url(#flower-clip)">
        {flowerRenderOrder.map((i) => {
          const f = expandedFlowers[i];
          const p = flowerPositions[i];
          return (
            <image
              key={`flower-${i}`}
              href={flowerSrc(f.type, f.color)}
              x={p.hx - FLOWER_SIZE / 2}
              y={p.hy - FLOWER_H}
              width={FLOWER_SIZE}
              height={FLOWER_H}
              transform={`rotate(${p.angleDeg}, ${p.hx}, ${p.hy})`}
              preserveAspectRatio="xMidYMax meet"
            />
          );
        })}
      </g>

      {/* Wrap image — in front of stems, behind flower heads */}
      <image
        href={wrapSrc}
        x={(CW - 280) / 2}
        y={TIE_Y - 30}
        width={280}
        height={CH - TIE_Y + 30}
        preserveAspectRatio="xMidYMin meet"
      />

      {isEmpty && (
        <>
          <text x={CW / 2} y={CH / 2 - 24} textAnchor="middle" fill="#C9856A" fontFamily="Georgia, serif" fontSize="15" opacity="0.72">
            Add flowers to begin
          </text>
          <text x={CW / 2} y={CH / 2} textAnchor="middle" fill="#C9856A" fontFamily="Georgia, serif" fontSize="12" opacity="0.45">
            your bouquet
          </text>
        </>
      )}
    </svg>
  );
}
