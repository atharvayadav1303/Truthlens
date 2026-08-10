import { motion } from "framer-motion";

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: "easeOut" },
  }),
};

const CARDS = [
  {
    title: "Credibility Assessment",
    text: "Semantic comparison against coverage from trusted outlets and local fallback data.",
    image: "https://picsum.photos/seed/truthlens-cred/500/420",
  },
  {
    title: "Risk Level Analysis",
    text: "Clear Low, Medium, and High risk labels mapped from similarity thresholds.",
    image: "https://picsum.photos/seed/truthlens-risk/500/420",
  },
  {
    title: "Concise Summaries",
    text: "Matched article previews show what the engine compared your claim against.",
    image: "https://picsum.photos/seed/truthlens-summary/500/420",
  },
];

export default function Solutions() {
  return (
    <section id="services" className="solutions">
      <motion.div
        className="divider-line"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      />
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
      >
        Built For Rapid Credibility Checks
      </motion.h2>
      <div className="solutions-grid">
        {CARDS.map((c, i) => (
          <motion.div
            className="solution-card"
            key={c.title}
            custom={i}
            variants={cardVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(23,16,26,0.12)" }}
          >
            <h3>{c.title}</h3>
            <p>{c.text}</p>
            <a href="#verify" className="read-more">Try It</a>
            <img src={c.image} alt={c.title} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
