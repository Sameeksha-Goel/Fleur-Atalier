// Static PNG assets for flowers that have pre-made image files.

export const ROSE_IMAGES: Record<string, string> = {
  "#E8AAB8": "/flowers/rose-pink-removebg-preview.png",
  "#C03044": "/flowers/rose-red-removebg-preview.png",
  "#9B72B5": "/flowers/rose-blue-removebg-preview.png",
  "#F0C040": "/flowers/rose-yellow-removebg-preview.png",
};

export const ROSE_COLORS = Object.keys(ROSE_IMAGES) as string[];

export function getRoseImage(color: string): string {
  return ROSE_IMAGES[color] ?? ROSE_IMAGES[ROSE_COLORS[0]];
}

// Sunflower has one color only — always use this image
export const SUNFLOWER_IMAGE = "/flowers/sunflower.png";
export const SUNFLOWER_COLOR = "#F5C518";
