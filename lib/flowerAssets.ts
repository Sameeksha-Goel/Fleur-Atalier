// Static PNG assets for flowers that have pre-made image files.
// Add more flower types here as you add more image files to public/flowers/.

export const ROSE_IMAGES: Record<string, string> = {
  "#E8AAB8": "/flowers/rose-pink.png",
  "#C03044": "/flowers/rose-red.png",
  "#9B72B5": "/flowers/rose-purple.png",
  "#F0C040": "/flowers/rose-yellow.png",
};

// Ordered color options shown for rose in the picker (pink is default)
export const ROSE_COLORS = Object.keys(ROSE_IMAGES) as string[];

// Return the correct image path for a rose color, falling back to pink
export function getRoseImage(color: string): string {
  return ROSE_IMAGES[color] ?? ROSE_IMAGES[ROSE_COLORS[0]];
}
