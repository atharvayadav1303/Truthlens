import { lazy, Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import VerifyCard from "./VerifyCard.jsx";

const TruthLensScene = lazy(() => import("./TruthLensScene.jsx"));

function useDesktopScene() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 761px) and (prefers-reduced-motion: no-preference)");
    const sync = () => setEnabled(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return enabled;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Hero() {
  const headline = "Verify News Before It Travels";
  const showScene = useDesktopScene();

  return (
    <motion.section
      id="top"
      className="hero"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="hero-visual" aria-hidden="true">
        {showScene ? (
          <Suspense fallback={<span className="scene-fallback" />}>
            <TruthLensScene />
          </Suspense>
        ) : (
          <span className="scene-fallback" />
        )}
        <span className="light-column" />
        <span className="scan-grid" />
        <span className="hero-orbit-readout">Live semantic field</span>
      </div>

      <motion.p className="eyebrow" variants={item}>AI Credibility Engine</motion.p>
      <motion.h1 variants={item} aria-label={headline}>
        {headline.split(" ").map((word, wordIndex) => (
          <span className="headline-word" aria-hidden="true" key={word}>
            {word.split("").map((char, charIndex) => {
              const index = headline.split(" ").slice(0, wordIndex).join("").length + charIndex + wordIndex;
              return (
                <motion.span
                  className="headline-char"
                  key={`${char}-${charIndex}`}
                  initial={{ opacity: 0, y: 34, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.22 + index * 0.018, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        ))}
      </motion.h1>
      <motion.p className="hero-sub" variants={item}>
        TruthLens compares claims, article links, and screenshots against trusted coverage
        using semantic matching, then returns a clear risk signal.
      </motion.p>
      <motion.div className="hero-signals" variants={item}>
        <span>Semantic Match</span>
        <span>OCR Intake</span>
        <span>Risk Scoring</span>
      </motion.div>

      <motion.div className="hero-card-wrap" variants={item}>
        <motion.span
          className="floating-explore"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          Live Check
        </motion.span>
        <VerifyCard />
      </motion.div>
    </motion.section>
  );
}
