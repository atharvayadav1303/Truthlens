import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const STATS = [
  { label: "Projects Completed", value: 120, suffix: "+" },
  { label: "Satisfied Users", value: 96, suffix: "%" },
  { label: "Accuracy On Test Claims", value: 92, suffix: "%" },
  { label: "Team Members", value: 8, suffix: "+" },
];

function useCountUp(target, active) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame;
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return value;
}

const statVariant = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

function StatItem({ stat, active, index }) {
  const value = useCountUp(stat.value, active);
  return (
    <motion.div
      className="stat"
      custom={index}
      variants={statVariant}
      initial="hidden"
      animate={active ? "show" : "hidden"}
    >
      <div className="stat-number">{value}{stat.suffix}</div>
      <div className="stat-label">{stat.label.toUpperCase()}</div>
    </motion.div>
  );
}

export default function Stats() {
  const [active, setActive] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="stats">
      {STATS.map((s, i) => (
        <StatItem key={s.label} stat={s} active={active} index={i} />
      ))}
    </div>
  );
}
