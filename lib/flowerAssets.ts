// ─── Rose ─────────────────────────────────────────────────────────────────────
export const ROSE_IMAGES: Record<string, string> = {
  "#E8AAB8": "/flowers/rose-pink-removebg-preview (1).png",
  "#C03044": "/flowers/rose-red-removebg-preview (1).png",
  "#9B72B5": "/flowers/rose-blue-removebg-preview (1).png",
  "#F0C040": "/flowers/rose-yellow-removebg-preview (1).png",
};
export const ROSE_COLORS = Object.keys(ROSE_IMAGES) as string[];
export function getRoseImage(color: string): string {
  return ROSE_IMAGES[color] ?? ROSE_IMAGES[ROSE_COLORS[0]];
}

// ─── Peony ────────────────────────────────────────────────────────────────────
export const PEONY_IMAGES: Record<string, string> = {
  "#E8AAB8": "/flowers/peony-pink-removebg-preview.png",
  "#C03044": "/flowers/peony-red-removebg-preview.png",
  "#9B72B5": "/flowers/peony-blue-removebg-preview.png",
  "#F0C040": "/flowers/peony-yellow-removebg-preview (1).png",
};
export const PEONY_COLORS = Object.keys(PEONY_IMAGES) as string[];
export function getPeonyImage(color: string): string {
  return PEONY_IMAGES[color] ?? PEONY_IMAGES[PEONY_COLORS[0]];
}

// ─── Lily ─────────────────────────────────────────────────────────────────────
export const LILY_IMAGES: Record<string, string> = {
  "#E8AAB8": "/flowers/lily-pink-removebg-preview.png",
  "#C03044": "/flowers/lily-red-removebg-preview.png",
  "#9B72B5": "/flowers/lily-blue-removebg-preview.png",
  "#F0C040": "/flowers/lily-yellow-removebg-preview (1).png",
};
export const LILY_COLORS = Object.keys(LILY_IMAGES) as string[];
export function getLilyImage(color: string): string {
  return LILY_IMAGES[color] ?? LILY_IMAGES[LILY_COLORS[0]];
}

// ─── Sunflower ────────────────────────────────────────────────────────────────
export const SUNFLOWER_IMAGE = "/flowers/sunflower-removebg-preview.png";
export const SUNFLOWER_COLOR = "#F5C518";

// ─── Fillers ──────────────────────────────────────────────────────────────────
export const BABYS_BREATH_IMAGE = "/flowers/baby_s-breath-removebg-preview.png";
export const LAVENDER_IMAGE     = "/flowers/lavender-removebg-preview.png";

// ─── Wraps ────────────────────────────────────────────────────────────────────
export type WrapKey = "black" | "white";

export const WRAP_IMAGES: Record<WrapKey, string> = {
  black: "/flowers/bouquet-black-removebg-preview.png",
  white: "/flowers/bouwuet-white-removebg-preview.png",
};
