import { motion } from "framer-motion";

const imageVariant = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const textVariant = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.15 } },
};

export default function About() {
  return (
    <section id="about" className="about">
      <div className="about-inner">
        <motion.div
          className="about-image"
          variants={imageVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <img
            src="https://picsum.photos/seed/truthlens-about/700/900"
            alt="Students working on the TruthLens AI project"
          />
        </motion.div>
        <motion.div
          className="about-content"
          variants={textVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <p className="eyebrow-label">Intelligence Layer</p>
          <h2>A calmer way to inspect fast-moving claims</h2>
          <p>
            TruthLens AI is an investigative interface for checking suspicious
            headlines, social posts, forwarded messages, and screenshots before
            they spread further.
          </p>
          <p>
            Our services revolve around providing accurate news credibility
            assessments using SBERT-driven semantic matching. We compare every
            claim against real coverage from trusted outlets before returning a
            verdict, so nothing is flagged on vibes alone.
          </p>
          <p>
            The result is a focused credibility report: score, verdict, risk
            level, source type, and the closest matching articles.
          </p>
          <motion.a
            href="#services"
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            Start Checking
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
