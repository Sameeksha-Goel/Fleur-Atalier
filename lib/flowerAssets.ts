// Static PNG assets for flowers that have pre-made image files.
// Add more flower types here as you add more image files to public/flowers/.

export const ROSE_IMAGES: Record<string, string> = {
  "#E8AAB8": "/flowers/rose-pink-removebg-preview.png",
  "#C03044": "/flowers/rose-red-removebg-preview.png",
  "#9B72B5": "/flowers/rose-blue-removebg-preview.png",
  "#F0C040": "/flowers/rose-yellow-removebg-preview.png",
};

// Ordered color options shown for rose in the picker (pink is default)
export const ROSE_COLORS = Object.keys(ROSE_IMAGES) as string[];

// Return the correct image path for a rose color, falling back to pink
export function getRoseImage(color: string): string {
  return ROSE_IMAGES[color] ?? ROSE_IMAGES[ROSE_COLORS[0]];
}
