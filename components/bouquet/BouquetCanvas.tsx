"use client";

import { useMemo } from "react";
import { BouquetState, FillerItem } from "@/lib/bouquetState";
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

// Main flowers — slightly smaller so cluster fits within wrap opening
const FLOWER_SIZE = 118;
const FLOWER_H    = Math.round(FLOWER_SIZE * 1.55); // 183

// Fillers — tall and wispy
const FILLER_SIZE = 82;
const FILLER_H    = Math.round(FILLER_SIZE * 2.2);  // 180

const TIE_X = CW / 2;
const TIE_Y = 195;

// Per-flower tilt variety so no two flowers look parallel
const TILT_OFFSETS = [0, 5, -4, 7, -3, 4, -6, 3];

// ─── Layout helpers ───────────────────────────────────────────────────────────

type Pos = { hx: number; hy: number; angleDeg: number };

function computeFlowerPositions(n: number): Pos[] {
  if (n === 0) return [];
  // Small spread angle — rotation fans the BLOOMS; stems stay near center
  const spread = Math.min(7 + n * 3, 20);
  return Array.from({ length: n }, (_, i) => {
    const t        = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
    const angleDeg = t * spread + TILT_OFFSETS[i % TILT_OFFSETS.length];
    const rad      = angleDeg * (Math.PI / 180);
    // Dome: outer flowers' anchors are lower (hy larger) so their blooms appear lower
    const hy = TIE_Y + 88 + Math.round(55 * t * t);
    // Stems converge: arm is small so hx stays close to TIE_X
    const hx = TIE_X + Math.sin(rad) * 26;
    return { hx, hy, angleDeg };
  });
}

// Fixed scatter slots for baby's breath (wispy, fill gaps and edges)
const BB_SLOTS: Array<{ angle: number; hyExtra: number; arm: number }> = [
  { angle: -26, hyExtra: 60, arm: 72 }, // far left, tall
  { angle:  26, hyExtra: 60, arm: 72 }, // far right, tall
  { angle:  -9, hyExtra: 68, arm: 52 }, // left-center fill
  { angle:  15, hyExtra: 68, arm: 52 }, // right-center fill
];

// Fixed positions for lavender (taller than flowers, peek above)
const LAV_SLOTS: Array<{ angle: number; hyExtra: number; arm: number }> = [
  { angle: -15, hyExtra: 48, arm: 38 }, // left-center, very tall
  { angle:  15, hyExtra: 48, arm: 38 }, // right-center, very tall
];

function computeFillerPositions(expandedFillers: FillerItem[]): Pos[] {
  const positions: Pos[] = new Array(expandedFillers.length);
  let bbCount  = 0;
  let lavCount = 0;

  expandedFillers.forEach((f, i) => {
    if (f.type === "babysbreath") {
      const slot = BB_SLOTS[bbCount % BB_SLOTS.length];
      bbCount++;
      const rad    = slot.angle * (Math.PI / 180);
      positions[i] = {
        hx: TIE_X + Math.sin(rad) * slot.arm,
        hy: TIE_Y + slot.hyExtra,
        angleDeg: slot.angle,
      };
    } else {
      // lavender
      const slot = LAV_SLOTS[lavCount % LAV_SLOTS.length];
      lavCount++;
      const rad    = slot.angle * (Math.PI / 180);
      positions[i] = {
        hx: TIE_X + Math.sin(rad) * slot.arm,
        hy: TIE_Y + slot.hyExtra,
        angleDeg: slot.angle,
      };
    }
  });

  return positions;
}

function flowerSrc(type: string, color: string): string {
  if (type === "peony")     return getPeonyImage(color);
  if (type === "lily")      return getLilyImage(color);
  if (type === "sunflower") return SUNFLOWER_IMAGE;
  return getRoseImage(color); // rose + fallback
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
  const fillerPositions = useMemo(() => computeFillerPositions(expandedFillers),       [expandedFillers]);

  // Outer flowers render first → center flowers on top (natural dome depth)
  const flowerRenderOrder = useMemo(() => {
    const n = expandedFlowers.length;
    return Array.from({ length: n }, (_, i) => i).sort((a, b) => {
      const ta = n <= 1 ? 0 : Math.abs((a / (n - 1)) * 2 - 1);
      const tb = n <= 1 ? 0 : Math.abs((b / (n - 1)) * 2 - 1);
      return tb - ta; // largest |t| first
    });
  }, [expandedFlowers.length]);

  const wrapSrc = WRAP_IMAGES[bouquet.wrap.image];
  const isEmpty = bouquet.flowers.length === 0 && bouquet.fillers.length === 0;

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <rect width={CW} height={CH} fill="#FDF6EF" />

      {/* ── Layer 1: Baby's breath — behind everything above the wrap ── */}
      {expandedFillers.map((f, i) => {
        if (f.type !== "babysbreath") return null;
        const p = fillerPositions[i];
        return (
          <image
            key={`bb-${i}`}
            href={BABYS_BREATH_IMAGE}
            x={p.hx - FILLER_SIZE / 2}
            y={p.hy - FILLER_H}
            width={FILLER_SIZE}
            height={FILLER_H}
            transform={`rotate(${p.angleDeg}, ${p.hx}, ${p.hy})`}
            preserveAspectRatio="xMidYMax meet"
          />
        );
      })}

      {/* ── Layer 2: Lavender — taller than flowers, peeks above cluster ── */}
      {expandedFillers.map((f, i) => {
        if (f.type !== "lavender") return null;
        const p = fillerPositions[i];
        return (
          <image
            key={`lav-${i}`}
            href={LAVENDER_IMAGE}
            x={p.hx - FILLER_SIZE / 2}
            y={p.hy - FILLER_H}
            width={FILLER_SIZE}
            height={FILLER_H}
            transform={`rotate(${p.angleDeg}, ${p.hx}, ${p.hy})`}
            preserveAspectRatio="xMidYMax meet"
          />
        );
      })}

      {/* ── Layer 3: Main flowers — outer behind, center in front ── */}
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

      {/* ── Layer 4: Wrap image — covers all stems, only blooms visible above ── */}
      <image
        href={wrapSrc}
        x={(CW - 280) / 2}
        y={TIE_Y - 35}
        width={280}
        height={CH - TIE_Y + 35}
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
