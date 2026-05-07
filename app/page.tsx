"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import BouquetCanvas from "@/components/bouquet/BouquetCanvas";
import { BouquetState } from "@/lib/bouquetState";

// ─── Static preset bouquet for hero preview ───────────────────────────────────

const HERO_BOUQUET: BouquetState = {
  id: "hero-preview",
  artStyle: "illustrated",
  flowers: [
    { id: "r1", type: "rose",  color: "#E8829A", count: 2 },
    { id: "p1", type: "peony", color: "#D4849A", count: 1 },
    { id: "d1", type: "daisy", color: "#F8F0E0", count: 1 },
  ],
  fillers: [],
  displayStyle: "hand-tied",
  wrap: {
    material: "kraft",
    foldStyle: "classic",
    color: "#C4955A",
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
};

// ─── How it works steps ───────────────────────────────────────────────────────

const STEPS = [
  {
    n: "1",
    title: "Pick your flowers",
    desc: "Choose from illustrated blooms in your favourite style and colours.",
  },
  {
    n: "2",
    title: "Write a letter",
    desc: "Add a personal message with the paper, ink, and font that feels right.",
  },
  {
    n: "3",
    title: "Send the link",
    desc: "They get a beautiful animated reveal — bouquet and letter together.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  function scrollToHowItWorks(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="bg-cream min-h-screen">

      {/* ── Nav ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 py-4 bg-cream/85 backdrop-blur-md border-b border-black/5">
        <span className="font-dancing text-[28px] text-terracotta leading-none">
          Fleur Atalier
        </span>
        <Link
          href="/create"
          className="bg-terracotta text-cream font-sans text-sm font-medium px-5 py-2.5 rounded-full hover:bg-terracotta-dark active:scale-[0.97] transition-all"
        >
          Build a bouquet
        </Link>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 gap-6">

        {/* Pill tag */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-block font-sans text-xs font-medium tracking-wide text-terracotta bg-terracotta/10 border border-terracotta/20 px-4 py-1.5 rounded-full">
            Digital bouquets that feel real
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          className="font-playfair text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.12] text-foreground max-w-[600px]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          Send flowers that{" "}
          <em className="not-italic text-terracotta italic">never</em>{" "}
          fade
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="font-sans font-light text-foreground/60 text-base md:text-lg max-w-[440px] leading-relaxed"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          Build a bouquet in your style, write a letter, send something they&rsquo;ll never forget.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          <Link
            href="/create"
            className="bg-terracotta text-cream font-sans font-medium text-sm px-7 py-3.5 rounded-full hover:bg-terracotta-dark active:scale-[0.97] transition-all"
          >
            Build a bouquet
          </Link>
          <a
            href="#how-it-works"
            onClick={scrollToHowItWorks}
            className="border border-terracotta/50 text-terracotta font-sans font-medium text-sm px-7 py-3.5 rounded-full hover:bg-terracotta/8 active:scale-[0.97] transition-all"
          >
            See how it works
          </a>
        </motion.div>

        {/* Bouquet preview */}
        <motion.div
          className="w-full max-w-[320px] mt-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.2,
            }}
          >
            <BouquetCanvas bouquet={HERO_BOUQUET} width={320} />
          </motion.div>
        </motion.div>

      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24 px-6 bg-[#FFF8F3]"
      >
        <div className="max-w-[900px] mx-auto">

          {/* Heading */}
          <motion.h2
            className="font-playfair text-[clamp(1.8rem,4vw,2.6rem)] text-foreground text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            How it works
          </motion.h2>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {STEPS.map(({ n, title, desc }, i) => (
              <motion.div
                key={n}
                className="flex flex-col items-center text-center gap-4"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: "easeOut" }}
              >
                {/* Circle number */}
                <div className="w-11 h-11 rounded-full bg-terracotta flex items-center justify-center shrink-0">
                  <span className="font-sans font-semibold text-cream text-base leading-none">
                    {n}
                  </span>
                </div>

                <h3 className="font-playfair text-xl text-foreground font-medium">
                  {title}
                </h3>
                <p className="font-sans text-sm text-foreground/55 leading-relaxed max-w-[220px]">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA section ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#2C1810] text-center">
        <motion.div
          className="flex flex-col items-center gap-8 max-w-[520px] mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <h2 className="font-playfair text-[clamp(1.7rem,4vw,2.4rem)] text-cream leading-[1.2]">
            Ready to send something beautiful?
          </h2>
          <Link
            href="/create"
            className="bg-terracotta text-cream font-sans font-medium text-sm px-8 py-4 rounded-full hover:bg-terracotta-dark active:scale-[0.97] transition-all"
          >
            Build your bouquet →
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 bg-cream border-t border-black/6 flex flex-col items-center gap-2">
        <span className="font-dancing text-2xl text-terracotta">Fleur Atalier</span>
        <p className="font-sans text-xs text-foreground/30 tracking-wide">
          made with love
        </p>
      </footer>

    </div>
  );
}
