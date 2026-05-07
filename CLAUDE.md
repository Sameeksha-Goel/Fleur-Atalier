# Fleur Atalier — Digital Bouquet & Letter Sender

## Vision
A premium digital bouquet builder and sender. Key differentiators:
- Multiple art styles: Doodle, Illustrated, Crochet, Ink Sketch, Kawaii, Paper Cut, Realistic
- Full canvas editor: drag, resize, rotate, flip, layer control per flower
- Rich wrapping paper system: material, fold style, color, embellishment
- Magical recipient experience: 360 auto-rotate bouquet, envelope opening, potted watering bloom
- Deeply customizable letter: paper, font, ink color, wax seal

## Art styles (v1)
1. Doodle — wobbly outlines, flat fills, sketch lines
2. Illustrated — clean bezier curves, botanical elegance  
3. Ink Sketch — black and white only, crosshatching, vintage
4. Kawaii — chubby shapes, dot eyes, tiny smiles on centers
5. Minecraft — pixel grid art, SVG rectangles only, no curves

## Reference images
- Crochet style: chunky yarn texture, ribbed petals, thick stems, lacy leaf edges
- Wrapping papers: kraft cone, Korean two-layer fold, translucent cellophane origami folds
- Bouquet styles: wrapped cone, ribbon-tied artisan, loose arrangement, potted plant

## Tech stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Framer Motion for all animations
- html2canvas for image export
- canvas-confetti for celebration moments
- localStorage for MVP (no backend)

## Design language
- Fonts: Playfair Display (headings), Dancing Script (letter writing), DM Sans (UI)
- Colors: cream #FDF6EF, dusty rose #D4849A, terracotta #C9856A, sage #8FAF8C
- Mobile-first — recipient experience is primarily phone
- Slow, premium animations — nothing fast or cheap feeling

## App structure
- /              Landing page
- /create        6-step bouquet builder
- /send/[id]     Recipient experience

## Builder steps
1. Art style selection
2. Flower canvas editor
3. Filler picker
4. Display style + wrapping paper
5. Letter customization
6. Preview + send

## Data model
Each bouquet saved to localStorage as JSON:
{
  id, artStyle, flowers[], fillers[], displayStyle,
  wrap: { material, foldStyle, color, embellishment },
  letter: { paperColor, font, inkColor, sealColor, to, message, from }
}