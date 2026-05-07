"use client";

import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import html2canvas from "html2canvas";
import { BouquetState, defaultBouquetState, saveBouquet, encodeBouquetUrl } from "@/lib/bouquetState";
import { ArtStyle } from "@/lib/drawingUtils";
import FlowerPicker from "@/components/editor/FlowerPicker";
import BouquetCanvas from "@/components/bouquet/BouquetCanvas";
import LetterComposer from "@/components/letter/LetterComposer";
import LetterPreview from "@/components/letter/LetterPreview";

// ─── Wrap colour palette ──────────────────────────────────────────────────────

const WRAP_COLORS = [
  { hex: "#C4955A", label: "kraft"      },
  { hex: "#D4849A", label: "blush"      },
  { hex: "#C9856A", label: "terracotta" },
  { hex: "#8FAF8C", label: "sage"       },
  { hex: "#7898D8", label: "dusty blue" },
  { hex: "#2C1810", label: "dark"       },
];

// ─── Share modal ──────────────────────────────────────────────────────────────

type ModalProps = {
  bouquet: BouquetState;
  onClose: () => void;
};

function ShareModal({ bouquet, onClose }: ModalProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [copied,      setCopied]      = useState(false);
  const [downloading, setDownloading] = useState(false);

  const hasLetter =
    bouquet.letter.to.trim() ||
    bouquet.letter.message.trim() ||
    bouquet.letter.from.trim();

  function copyLink() {
    const url = `${window.location.origin}/send?d=${encodeBouquetUrl(bouquet)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function download() {
    if (!previewRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: "#FDF6EF",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "bloomly-bouquet.png";
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-[420px] max-h-[92vh] overflow-y-auto rounded-3xl bg-cream shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Preview area — captured by html2canvas */}
        <div ref={previewRef} className="bg-[#F8F0E8] rounded-t-3xl px-6 pt-6 pb-4 flex flex-col gap-4">
          <BouquetCanvas bouquet={bouquet} width={372} />
          {hasLetter && <LetterPreview letter={bouquet.letter} />}
        </div>

        {/* Actions */}
        <div className="px-6 py-5 flex flex-col gap-3">
          <button
            onClick={copyLink}
            className={[
              "py-3 rounded-full font-sans text-sm font-medium transition-all active:scale-[0.98]",
              copied
                ? "bg-[#5a8c42] text-white"
                : "bg-terracotta text-cream hover:bg-terracotta-dark",
            ].join(" ")}
          >
            {copied ? "Copied!" : "Copy link"}
          </button>

          <button
            onClick={download}
            disabled={downloading}
            className="py-3 rounded-full font-sans text-sm font-medium border border-terracotta text-terracotta hover:bg-terracotta/8 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? "Saving…" : "Download as image"}
          </button>

          <button
            onClick={onClose}
            className="py-2 font-sans text-sm text-foreground/45 hover:text-foreground/70 transition-colors"
          >
            Keep editing
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Create page ──────────────────────────────────────────────────────────────

export default function CreatePage() {
  const [bouquet, setBouquet] = useState<BouquetState>(defaultBouquetState);
  const [shareId, setShareId] = useState<string | null>(null);

  const update = useCallback(
    <K extends keyof BouquetState>(key: K, value: BouquetState[K]) =>
      setBouquet((prev) => ({ ...prev, [key]: value })),
    []
  );

  const hasLetter =
    bouquet.letter.to.trim() ||
    bouquet.letter.message.trim() ||
    bouquet.letter.from.trim();

  function handlePreviewSend() {
    const id = crypto.randomUUID();
    const finalBouquet = { ...bouquet, id };
    saveBouquet(finalBouquet);
    setBouquet(finalBouquet);
    setShareId(id);
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-cream">

        {/* ── Left panel ──────────────────────────────────────────────── */}
        <aside className="w-[380px] shrink-0 flex flex-col border-r border-black/8 bg-cream">
          <div className="px-6 pt-6 pb-4 border-b border-black/6 shrink-0">
            <h1 className="font-playfair text-2xl text-foreground">Build Your Bouquet</h1>
          </div>

          <div className="flex flex-col gap-6 p-6 overflow-y-auto">

            {/* Section 1 — Flowers */}
            <FlowerPicker
              flowers={bouquet.flowers}
              artStyle={bouquet.artStyle as ArtStyle}
              onChange={(flowers) => update("flowers", flowers)}
            />

            {/* Section 2 — Wrap colour */}
            <section>
              <h2 className="font-playfair text-lg text-foreground mb-3">Wrap colour</h2>
              <div className="flex gap-2.5 flex-wrap">
                {WRAP_COLORS.map(({ hex, label }) => {
                  const active = bouquet.wrap.color === hex;
                  return (
                    <button
                      key={hex}
                      title={label}
                      aria-label={`${label} wrap`}
                      onClick={() => update("wrap", { ...bouquet.wrap, color: hex })}
                      className="w-8 h-8 rounded-full transition-all"
                      style={{
                        backgroundColor: hex,
                        boxShadow: active
                          ? "0 0 0 2px #FDF6EF, 0 0 0 4px #2C1A0E"
                          : "none",
                      }}
                    />
                  );
                })}
              </div>
            </section>

            {/* Section 3 — Letter */}
            <LetterComposer
              letter={bouquet.letter}
              onChange={(letter) => update("letter", letter)}
            />

            {/* Section 4 — Actions */}
            <div className="flex flex-col gap-3 pb-2">
              <button
                className="bg-terracotta text-cream font-sans py-3 rounded-full text-sm font-medium hover:bg-terracotta-dark active:scale-[0.98] transition-all"
                onClick={handlePreviewSend}
              >
                Preview &amp; Send
              </button>
              <button
                className="border border-terracotta text-terracotta font-sans py-3 rounded-full text-sm font-medium hover:bg-terracotta/8 active:scale-[0.98] transition-all"
                onClick={handlePreviewSend}
              >
                Download image
              </button>
            </div>

          </div>
        </aside>

        {/* ── Right panel ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto flex flex-col items-center gap-8 px-8 py-10 bg-[#F8F0E8]">
          <div className="w-full max-w-[340px]">
            <BouquetCanvas bouquet={bouquet} width={340} />
          </div>

          {hasLetter && (
            <div className="w-full max-w-[420px]">
              <p className="font-playfair text-sm text-foreground/45 mb-2 text-center">
                Letter preview
              </p>
              <LetterPreview letter={bouquet.letter} />
            </div>
          )}
        </main>

      </div>

      {/* Share modal — portal-like, sits above everything */}
      <AnimatePresence>
        {shareId && (
          <ShareModal
            bouquet={bouquet}
            onClose={() => setShareId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
