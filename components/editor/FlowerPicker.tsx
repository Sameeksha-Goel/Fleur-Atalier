"use client";

import { useMemo } from "react";
import { FlowerItem } from "@/lib/bouquetState";
import { drawFlower, FlowerType, ArtStyle } from "@/lib/drawingUtils";
import { ROSE_COLORS, getRoseImage, SUNFLOWER_IMAGE, SUNFLOWER_COLOR } from "@/lib/flowerAssets";

type Props = {
  flowers: FlowerItem[];
  artStyle: ArtStyle;
  onChange: (flowers: FlowerItem[]) => void;
};

const MAX_TOTAL = 8;

const CATALOG: { type: FlowerType; name: string; defaultColor: string }[] = [
  { type: "rose",      name: "Rose",      defaultColor: ROSE_COLORS[0] },
  { type: "tulip",     name: "Tulip",     defaultColor: "#E8B49A" },
  { type: "sunflower", name: "Sunflower", defaultColor: SUNFLOWER_COLOR },
  { type: "daisy",     name: "Daisy",     defaultColor: "#f5f0e8" },
  { type: "peony",     name: "Peony",     defaultColor: "#C9856A" },
];

// Generic swatches for non-rose flowers
const SWATCHES = ["#D4849A", "#C9856A", "#E8B49A", "#8FAF8C", "#7898D8", "#F5C518"];

export default function FlowerPicker({ flowers, artStyle, onChange }: Props) {
  const flowerMap = useMemo(() => {
    const m = new Map<string, FlowerItem>();
    flowers.forEach((f) => m.set(f.type, f));
    return m;
  }, [flowers]);

  const total = flowers.reduce((acc, f) => acc + f.count, 0);

  // Preview source per flower type
  // Rose → actual PNG file; others → generated SVG data URI
  const previews = useMemo(
    () =>
      Object.fromEntries(
        CATALOG.map(({ type, defaultColor }) => {
          const color = flowerMap.get(type)?.color ?? defaultColor;
          if (type === "rose")      return [type, getRoseImage(color)];
          if (type === "sunflower") return [type, SUNFLOWER_IMAGE];
          const svg = drawFlower(type, artStyle, color, 64);
          return [type, `data:image/svg+xml,${encodeURIComponent(svg)}`];
        })
      ) as Record<FlowerType, string>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [artStyle, flowers]
  );

  function add(type: FlowerType, defaultColor: string) {
    if (total >= MAX_TOTAL) return;
    const existing = flowerMap.get(type);
    if (existing) {
      onChange(flowers.map((f) => (f.type === type ? { ...f, count: f.count + 1 } : f)));
    } else {
      onChange([
        ...flowers,
        { id: `${type}-${Date.now()}`, type, color: defaultColor, count: 1 },
      ]);
    }
  }

  function remove(type: FlowerType) {
    const existing = flowerMap.get(type);
    if (!existing) return;
    if (existing.count <= 1) {
      onChange(flowers.filter((f) => f.type !== type));
    } else {
      onChange(flowers.map((f) => (f.type === type ? { ...f, count: f.count - 1 } : f)));
    }
  }

  function setColor(type: FlowerType, color: string) {
    onChange(flowers.map((f) => (f.type === type ? { ...f, color } : f)));
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-playfair text-lg text-foreground">Choose your flowers</h2>
        <span className="text-xs text-foreground/50 font-sans tabular-nums">
          {total} / {MAX_TOTAL}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {CATALOG.map(({ type, name, defaultColor }) => {
          const item  = flowerMap.get(type);
          const color = item?.color ?? defaultColor;
          const count = item?.count ?? 0;
          const atMax = total >= MAX_TOTAL;

          // Rose → 4 image-backed colors; sunflower → no swatches (one color only); others → generic 6
          const swatchList = type === "rose" ? ROSE_COLORS : type === "sunflower" ? [] : SWATCHES;

          return (
            <div key={type}>
              {/* Card row */}
              <div
                role="button"
                tabIndex={0}
                aria-label={`Add ${name}`}
                onClick={() => !(atMax && count === 0) && add(type, defaultColor)}
                onKeyDown={(e) => e.key === "Enter" && !(atMax && count === 0) && add(type, defaultColor)}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all select-none",
                  count > 0
                    ? "border-terracotta/40 bg-terracotta/5"
                    : atMax
                    ? "border-transparent bg-muted opacity-40 cursor-not-allowed"
                    : "border-transparent bg-muted hover:border-terracotta/20 cursor-pointer",
                ].join(" ")}
              >
                {/* Flower preview */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[type]}
                  alt={name}
                  width={40}
                  height={56}
                  className="shrink-0 object-contain"
                  draggable={false}
                />

                <span className="flex-1 font-sans text-sm text-foreground">{name}</span>

                {count > 0 ? (
                  <div
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      aria-label={`Remove one ${name}`}
                      className="w-6 h-6 rounded-full bg-terracotta/15 text-terracotta leading-none flex items-center justify-center hover:bg-terracotta/28 transition-colors"
                      onClick={() => remove(type)}
                    >
                      −
                    </button>
                    <span className="w-4 text-center font-sans text-sm font-semibold text-foreground tabular-nums">
                      {count}
                    </span>
                    <button
                      aria-label={`Add one more ${name}`}
                      disabled={atMax}
                      className={[
                        "w-6 h-6 rounded-full leading-none flex items-center justify-center transition-colors",
                        atMax
                          ? "bg-terracotta/8 text-terracotta/35 cursor-not-allowed"
                          : "bg-terracotta/15 text-terracotta hover:bg-terracotta/28",
                      ].join(" ")}
                      onClick={() => !atMax && add(type, defaultColor)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-terracotta/55 font-sans">Add</span>
                )}
              </div>

              {/* Colour swatches — rose gets its own 4-color set */}
              {count > 0 && (
                <div className="flex gap-2 pt-2 pb-0.5 pl-[52px]">
                  {swatchList.map((hex) => (
                    <button
                      key={hex}
                      aria-label={`Set ${name} color to ${hex}`}
                      onClick={() => setColor(type, hex)}
                      className="w-5 h-5 rounded-full border-2 transition-all shrink-0"
                      style={{
                        backgroundColor: hex,
                        borderColor: color === hex ? "#2C1A0E" : "transparent",
                        boxShadow:
                          color === hex
                            ? "0 0 0 1.5px #FDF6EF, 0 0 0 3px #2C1A0E"
                            : "none",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
