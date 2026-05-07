"use client";

import { LetterConfig } from "@/lib/bouquetState";

const MAX_MESSAGE = 200;

type Props = {
  letter: LetterConfig;
  onChange: (letter: LetterConfig) => void;
};

const inputCls =
  "w-full bg-cream border border-terracotta/30 rounded-lg px-3 py-2.5 font-sans text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-terracotta/60 transition-colors";

export default function LetterComposer({ letter, onChange }: Props) {
  const set = (patch: Partial<LetterConfig>) => onChange({ ...letter, ...patch });
  const msgLen = letter.message.length;
  const nearLimit = msgLen > MAX_MESSAGE - 30;

  return (
    <section>
      <h2 className="font-playfair text-lg text-foreground mb-3">Your message</h2>

      <div className="flex flex-col gap-3">
        <input
          className={inputCls}
          placeholder="To…"
          value={letter.to}
          onChange={(e) => set({ to: e.target.value })}
        />

        <div className="relative">
          <textarea
            className={`${inputCls} min-h-[108px] resize-none pb-7 leading-relaxed`}
            placeholder="Write your message…"
            value={letter.message}
            maxLength={MAX_MESSAGE}
            onChange={(e) => set({ message: e.target.value })}
          />
          <span
            className={[
              "absolute bottom-2.5 right-3 text-xs font-sans tabular-nums transition-colors",
              nearLimit ? "text-terracotta" : "text-foreground/30",
            ].join(" ")}
          >
            {msgLen} / {MAX_MESSAGE}
          </span>
        </div>

        <input
          className={inputCls}
          placeholder="From…"
          value={letter.from}
          onChange={(e) => set({ from: e.target.value })}
        />
      </div>
    </section>
  );
}
