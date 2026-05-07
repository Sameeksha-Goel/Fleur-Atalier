"use client";

import { useMemo } from "react";
import { BouquetState } from "@/lib/bouquetState";
import { drawFlower, FlowerType, ArtStyle, lighten, darken } from "@/lib/drawingUtils";

type Props = {
  bouquet: BouquetState;
  width?: number;
};

const CW = 400;
const CH = 520;
const FLOWER_SIZE = 90;
const FLOWER_H    = Math.round(FLOWER_SIZE * 1.4);
const TIE_X  = CW / 2;
const TIE_Y  = 195;          // wrap opening level
const STEM_Y = TIE_Y + 110;  // = 305  knot level — stem origin

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

// ─── Back paper layer — rendered BEFORE flowers so flowers appear in front ────
// This creates the wide organic "wings" visible around the sides in the reference.

function KraftWrapBack({ cx, topY, color }: { cx: number; topY: number; color: string }) {
  const knotY = topY + 110;
  const dark   = darken(color, 12);
  const shadow = darken(color, 24);

  // Organic silhouette: left wing extends higher, right wing slightly lower.
  // The path traces: left wing → down left side → left tail → bottom → right tail
  //   → up right side → right wing → across top → back to left wing.
  const path =
    `M${cx - 110},${topY - 18}` +                                                            // left wing peak
    ` C${cx - 87},${topY + 25} ${cx - 57},${topY + 67} ${cx - 18},${knotY}` +               // left side ↓ straight taper
    ` C${cx - 26},${knotY + 28} ${cx - 32},${knotY + 66} ${cx - 28},${knotY + 98}` +        // left tail ↓
    ` L${cx + 28},${knotY + 98}` +                                                           // tail bottom
    ` C${cx + 32},${knotY + 66} ${cx + 26},${knotY + 28} ${cx + 18},${knotY}` +             // right tail ↑
    ` C${cx + 51},${knotY - 39} ${cx + 77},${knotY - 79} ${cx + 94},${topY - 8}` +          // right side ↑ straight taper
    ` C${cx + 104},${topY - 20} ${cx + 100},${topY - 30} ${cx + 86},${topY - 24}` +         // right wing outer
    ` C${cx + 60},${topY - 26} ${cx + 28},${topY - 20} ${cx},${topY - 12}` +                // top right half
    ` C${cx - 40},${topY - 20} ${cx - 80},${topY - 26} ${cx - 110},${topY - 18} Z`;         // top left half

  return (
    <g>
      <path d={path} fill={shadow} opacity="0.10" transform="translate(4,5)"/>
      <path d={path} fill={dark}   opacity="0.80"/>
    </g>
  );
}

// ─── Front paper layer — rendered AFTER flowers; covers lower stem segments ───
// Narrower cone, ribbon bow, and paper tails all sit here.
// NOTHING in this component extends above topY (stems are never cut).

function KraftWrapFront({ cx, topY, color }: { cx: number; topY: number; color: string }) {
  const knotY  = topY + 110;
  const botY   = topY + 215;

  const frontHW = 82;
  const knotHW  = 16;
  const tailHW  = 26;

  const main   = color;
  const dark   = darken(color, 13);
  const light  = lighten(color, 20);
  const shadow = darken(color, 26);
  const rib    = "#B8643C";
  const ribLt  = "#D4896A";

  // Cone with gentle bow — control points shifted outward from straight line
  function cone(lW: number, rW: number) {
    const dy = knotY - topY;
    const dl = lW - knotHW;
    const dr = rW - knotHW;
    const y1 = topY + dy / 3;
    const y2 = topY + dy * 2 / 3;
    const bow = 12;
    return (
      `M${cx - lW},${topY} ` +
      `C${cx - lW + dl / 3 - bow},${y1} ${cx - lW + dl * 2 / 3 - bow},${y2} ${cx - knotHW},${knotY} ` +
      `L${cx + knotHW},${knotY} ` +
      `C${cx + knotHW + dr / 3 + bow},${y2} ${cx + knotHW + dr * 2 / 3 + bow},${y1} ${cx + rW},${topY} Z`
    );
  }

  const tailsPath =
    `M${cx - knotHW},${knotY} ` +
    `C${cx - tailHW - 4},${knotY + 26} ${cx - tailHW},${botY - 10} ${cx - tailHW + 6},${botY} ` +
    `L${cx + tailHW - 6},${botY} ` +
    `C${cx + tailHW},${botY - 10} ${cx + tailHW + 4},${knotY + 26} ${cx + knotHW},${knotY} Z`;

  const mainPath = cone(frontHW, frontHW);

  return (
    <g>
      <defs>
        <filter id="kw-grain" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.55 0.65" numOctaves="4" seed="3" stitchTiles="stitch" result="noise"/>
          <feColorMatrix type="saturate" values="0" in="noise" result="mono"/>
          <feComponentTransfer in="mono" result="dim">
            <feFuncA type="linear" slope="0.07"/>
          </feComponentTransfer>
          <feComposite in="dim" in2="SourceGraphic" operator="in"/>
        </filter>
        <clipPath id="kw-clip"><path d={mainPath}/></clipPath>
      </defs>

      {/* Shadows */}
      <path d={mainPath}  fill={shadow} opacity="0.11" transform="translate(5,6)"/>
      <path d={tailsPath} fill={shadow} opacity="0.09" transform="translate(5,6)"/>

      {/* Back sub-layer of front paper — 8px wider, shows as darker border */}
      <path d={cone(frontHW + 8, frontHW + 8)} fill={dark} opacity="0.68"/>

      {/* Tails — back layer */}
      <path d={tailsPath} fill={dark} opacity="0.72"/>

      {/* Right front tail panel — lighter */}
      <path
        d={`M${cx},${knotY} L${cx},${botY} L${cx + tailHW - 6},${botY} C${cx + tailHW + 4},${botY - 10} ${cx + tailHW},${knotY + 26} L${cx + knotHW},${knotY} Z`}
        fill={light} opacity="0.80"
      />

      {/* Main front cone */}
      <path d={mainPath} fill={main}/>

      {/* Side fold strips */}
      <path d={cone(frontHW, frontHW - 18)} fill={dark}  opacity="0.36"/>
      <path d={cone(frontHW - 18, frontHW)} fill={light} opacity="0.30"/>

      {/* Crease lines */}
      <line x1={cx - frontHW}      y1={topY} x2={cx - knotHW} y2={knotY} stroke={dark} strokeWidth="0.7" opacity="0.18"/>
      <line x1={cx - frontHW + 28} y1={topY} x2={cx - 6}       y2={knotY} stroke={dark} strokeWidth="0.35" opacity="0.12"/>
      <line x1={cx + frontHW}      y1={topY} x2={cx + knotHW} y2={knotY} stroke={dark} strokeWidth="0.7" opacity="0.15"/>

      {/* Paper grain */}
      <rect
        x={cx - frontHW - 5} y={topY}
        width={(frontHW + 5) * 2} height={knotY - topY + 6}
        fill={dark} filter="url(#kw-grain)" clipPath="url(#kw-clip)" opacity="0.11"
      />

      {/* Ribbon bow */}
      <path d={`M${cx},${knotY} C${cx-28},${knotY-16} ${cx-36},${knotY-2} ${cx-20},${knotY+10} C${cx-10},${knotY+14} ${cx-2},${knotY+4} ${cx},${knotY} Z`} fill={rib}/>
      <path d={`M${cx},${knotY} C${cx+28},${knotY-16} ${cx+36},${knotY-2} ${cx+20},${knotY+10} C${cx+10},${knotY+14} ${cx+2},${knotY+4} ${cx},${knotY} Z`} fill={ribLt}/>
      <ellipse cx={cx} cy={knotY} rx={8}   ry={5}   fill={rib}/>
      <ellipse cx={cx} cy={knotY} rx={4.5} ry={2.8} fill={ribLt} opacity="0.55"/>
      <path d={`M${cx-4},${knotY+5} C${cx-14},${knotY+32} ${cx-18},${knotY+62} ${cx-10},${knotY+76}`} fill="none" stroke={rib}   strokeWidth="5.5" strokeLinecap="round"/>
      <path d={`M${cx+4},${knotY+5} C${cx+16},${knotY+30} ${cx+20},${knotY+58} ${cx+12},${knotY+72}`} fill="none" stroke={ribLt} strokeWidth="4.5" strokeLinecap="round"/>
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
      <rect width={CW} height={CH} fill="#FDF6EF"/>

      {/* Back paper — wide wings behind flowers */}
      <KraftWrapBack cx={TIE_X} topY={TIE_Y} color={bouquet.wrap.color}/>

      {/* Stems — in front of back paper, hidden by front paper below TIE_Y */}
      {positions.map((p, i) => (
        <line
          key={`stem-${i}`}
          x1={TIE_X} y1={STEM_Y} x2={p.hx} y2={p.hy}
          stroke="#3a6020" strokeWidth="1.65" strokeLinecap="round"
        />
      ))}

      {/* Flowers — in front of back paper wings */}
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

      {/* Front paper — narrower cone in front of everything; covers lower stems */}
      <KraftWrapFront cx={TIE_X} topY={TIE_Y} color={bouquet.wrap.color}/>

      {bouquet.flowers.length === 0 && (
        <>
          <text x={CW/2} y={CH/2-24} textAnchor="middle" fill="#C9856A" fontFamily="Georgia, serif" fontSize="15" opacity="0.72">Add flowers to begin</text>
          <text x={CW/2} y={CH/2}    textAnchor="middle" fill="#C9856A" fontFamily="Georgia, serif" fontSize="12" opacity="0.45">your bouquet</text>
        </>
      )}
    </svg>
  );
}
