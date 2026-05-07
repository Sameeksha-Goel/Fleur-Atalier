"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { BouquetState, loadBouquet, decodeBouquetUrl } from "@/lib/bouquetState";
import BouquetCanvas from "@/components/bouquet/BouquetCanvas";
import LetterPreview from "@/components/letter/LetterPreview";

type PageState = BouquetState | "loading" | "not-found";

export default function RecipientPage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<PageState>("loading");

  useEffect(() => {
    if (!id) { setState("not-found"); return; }

    // Primary: decode bouquet from URL ?d= param (works cross-device)
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("d");
    if (encoded) {
      const decoded = decodeBouquetUrl(encoded, id);
      if (decoded) { setState(decoded); return; }
    }

    // Fallback: localStorage (same browser only)
    const found = loadBouquet(id);
    setState(found ?? "not-found");
  }, [id]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state === "loading") {
    return <div className="min-h-screen bg-cream" />;
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (state === "not-found") {
    return (
      <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center gap-5">
        <p className="font-dancing text-3xl text-foreground/45">
          This bouquet couldn&rsquo;t be found
        </p>
        <Link
          href="/create"
          className="font-sans text-sm text-terracotta hover:underline underline-offset-4 transition-colors"
        >
          Build your own →
        </Link>
      </main>
    );
  }

  // ── Found ─────────────────────────────────────────────────────────────────
  const bouquet = state;
  const hasLetter =
    bouquet.letter.to.trim() ||
    bouquet.letter.message.trim() ||
    bouquet.letter.from.trim();

  return (
    <main className="min-h-screen bg-cream">
      <div className="max-w-[480px] mx-auto px-6 py-12 flex flex-col items-center gap-8">

        {/* 1. Bouquet: entrance fade-up + continuous float */}
        <motion.div
          className="w-full max-w-[360px]"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          >
            <BouquetCanvas bouquet={bouquet} width={360} />
          </motion.div>
        </motion.div>

        {/* 2. Letter preview: delayed slide-up */}
        {hasLetter && (
          <motion.div
            className="w-full max-w-[360px]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          >
            <LetterPreview letter={bouquet.letter} />
          </motion.div>
        )}

        {/* 3. Footer: delayed fade-in */}
        <motion.footer
          className="flex flex-col items-center gap-4 w-full pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <Link
            href="/create"
            className="border border-terracotta text-terracotta font-sans text-sm py-3 px-8 rounded-full hover:bg-terracotta/8 active:scale-[0.97] transition-all"
          >
            Send one back
          </Link>
          <p className="font-dancing text-base text-foreground/35">
            made with bloomly
          </p>
        </motion.footer>

      </div>
    </main>
  );
}
