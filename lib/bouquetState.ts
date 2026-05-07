export type ArtStyle = "doodle" | "illustrated" | "crochet" | "ink_sketch" | "kawaii" | "paper_cut" | "realistic";
export type DisplayStyle = "hand-tied" | "vase" | "basket" | "wrapped";

export type FlowerItem = {
  id: string;
  type: string;
  color: string;
  count: number;
  position?: { x: number; y: number };
};

export type FillerItem = {
  id: string;
  type: string;
  color: string;
  count: number;
};

export type WrapConfig = {
  material: "kraft" | "tissue" | "linen" | "velvet" | "none";
  foldStyle: "classic" | "cone" | "flat" | "bundle";
  color: string;
  embellishment: "ribbon" | "twine" | "lace" | "none";
};

export type LetterConfig = {
  paperColor: string;
  font: "playfair" | "dancing" | "dm-sans";
  inkColor: string;
  sealColor: string;
  to: string;
  message: string;
  from: string;
};

export type BouquetState = {
  id: string;
  artStyle: ArtStyle;
  flowers: FlowerItem[];
  fillers: FillerItem[];
  displayStyle: DisplayStyle;
  wrap: WrapConfig;
  letter: LetterConfig;
};

export const defaultBouquetState = (): BouquetState => ({
  id: crypto.randomUUID(),
  artStyle: "illustrated",
  flowers: [],
  fillers: [],
  displayStyle: "hand-tied",
  wrap: {
    material: "kraft",
    foldStyle: "classic",
    color: "#C9856A",
    embellishment: "ribbon",
  },
  letter: {
    paperColor: "#FDF6EF",
    font: "dancing",
    inkColor: "#2C1A0E",
    sealColor: "#C9856A",
    to: "",
    message: "",
    from: "",
  },
});

const STORAGE_KEY = "fleur-atalier-bouquet";

export function saveBouquet(state: BouquetState): void {
  if (typeof window === "undefined") return;
  const existing = loadAllBouquets();
  const idx = existing.findIndex((b) => b.id === state.id);
  if (idx >= 0) {
    existing[idx] = state;
  } else {
    existing.push(state);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function loadBouquet(id: string): BouquetState | null {
  const all = loadAllBouquets();
  return all.find((b) => b.id === id) ?? null;
}

export function loadAllBouquets(): BouquetState[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BouquetState[]) : [];
  } catch {
    return [];
  }
}

export function deleteBouquet(id: string): void {
  if (typeof window === "undefined") return;
  const filtered = loadAllBouquets().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// ─── URL encode / decode (minimal payload for short shareable links) ──────────
// Only stores what changes: flowers, wrap colour, letter text.
// Everything else is reconstructed from defaults on decode.

type UrlPayload = {
  f: Array<[string, string, number]>; // [type, color, count]
  w: string;                           // wrap color
  t: string;                           // letter.to
  m: string;                           // letter.message
  r: string;                           // letter.from
};

export function encodeBouquetUrl(bouquet: BouquetState): string {
  const payload: UrlPayload = {
    f: bouquet.flowers.map((fl) => [fl.type, fl.color, fl.count]),
    w: bouquet.wrap.color,
    t: bouquet.letter.to,
    m: bouquet.letter.message,
    r: bouquet.letter.from,
  };
  // unescape+encodeURIComponent handles any Unicode in the message safely
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  // Use URL-safe base64 (no +, /, or = padding)
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function decodeBouquetUrl(encoded: string, id: string): BouquetState | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    const p: UrlPayload = JSON.parse(json);
    return {
      id,
      artStyle: "illustrated",
      flowers: p.f.map(([type, color, count], i) => ({
        id: `f${i}`,
        type,
        color,
        count,
      })),
      fillers: [],
      displayStyle: "hand-tied",
      wrap: { material: "kraft", foldStyle: "classic", color: p.w, embellishment: "ribbon" },
      letter: {
        paperColor: "#FDF6EF",
        font: "dancing",
        inkColor: "#2C1A0E",
        sealColor: "#C9856A",
        to: p.t,
        message: p.m,
        from: p.r,
      },
    };
  } catch {
    return null;
  }
}
