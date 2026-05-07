"use client";

import { LetterConfig } from "@/lib/bouquetState";

type Props = {
  letter: LetterConfig;
};

const fontMap: Record<LetterConfig["font"], string> = {
  playfair: "font-playfair",
  dancing: "font-dancing",
  "dm-sans": "font-sans",
};

export default function LetterPreview({ letter }: Props) {
  return (
    <div
      className={`rounded-xl p-8 shadow-md min-h-[320px] flex flex-col justify-between ${fontMap[letter.font]}`}
      style={{ backgroundColor: letter.paperColor, color: letter.inkColor }}
    >
      {letter.to && <p className="text-sm opacity-70">Dear {letter.to},</p>}
      <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed flex-1">
        {letter.message || "Your message will appear here…"}
      </p>
      {letter.from && (
        <p className="text-sm opacity-70 text-right mt-4">— {letter.from}</p>
      )}
    </div>
  );
}
