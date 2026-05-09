"use client";

import { FillerItem } from "@/lib/bouquetState";
import { BABYS_BREATH_IMAGE, LAVENDER_IMAGE } from "@/lib/flowerAssets";

type Props = {
  fillers: FillerItem[];
  onChange: (fillers: FillerItem[]) => void;
};

const MAX_FILLERS = 4;

const FILLER_CATALOG = [
  { type: "babysbreath", name: "Baby's Breath", image: BABYS_BREATH_IMAGE },
  { type: "lavender",    name: "Lavender",       image: LAVENDER_IMAGE     },
];

export default function FillerPicker({ fillers, onChange }: Props) {
  const fillerMap = new Map(fillers.map((f) => [f.type, f]));
  const total = fillers.reduce((acc, f) => acc + f.count, 0);

  function add(type: string) {
    if (total >= MAX_FILLERS) return;
    const existing = fillerMap.get(type);
    if (existing) {
      onChange(fillers.map((f) => (f.type === type ? { ...f, count: f.count + 1 } : f)));
    } else {
      onChange([...fillers, { id: `${type}-${Date.now()}`, type, count: 1 }]);
    }
  }

  function remove(type: string) {
    const existing = fillerMap.get(type);
    if (!existing) return;
    if (existing.count <= 1) {
      onChange(fillers.filter((f) => f.type !== type));
    } else {
      onChange(fillers.map((f) => (f.type === type ? { ...f, count: f.count - 1 } : f)));
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-playfair text-lg text-foreground">Add fillers</h2>
        <span className="text-xs text-foreground/50 font-sans tabular-nums">
          {total} / {MAX_FILLERS}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {FILLER_CATALOG.map(({ type, name, image }) => {
          const item  = fillerMap.get(type);
          const count = item?.count ?? 0;
          const atMax = total >= MAX_FILLERS;

          return (
            <div
              key={type}
              role="button"
              tabIndex={0}
              aria-label={`Add ${name}`}
              onClick={() => !(atMax && count === 0) && add(type)}
              onKeyDown={(e) => e.key === "Enter" && !(atMax && count === 0) && add(type)}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all select-none",
                count > 0
                  ? "border-terracotta/40 bg-terracotta/5"
                  : atMax
                  ? "border-transparent bg-muted opacity-40 cursor-not-allowed"
                  : "border-transparent bg-muted hover:border-terracotta/20 cursor-pointer",
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={name}
                width={40}
                height={56}
                className="shrink-0 object-contain"
                draggable={false}
              />

              <span className="flex-1 font-sans text-sm text-foreground">{name}</span>

              {count > 0 ? (
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                    onClick={() => !atMax && add(type)}
                  >
                    +
                  </button>
                </div>
              ) : (
                <span className="text-xs text-terracotta/55 font-sans">Add</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
