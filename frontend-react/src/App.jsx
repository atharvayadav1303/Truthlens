import { motion, useScroll, useSpring } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Stats from "./components/Stats.jsx";
import Solutions from "./components/Solutions.jsx";
import CookieBanner from "./components/CookieBanner.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  return (
    <div className="app-shell">
      <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
      <div className="ambient-layer" aria-hidden="true">
        <span className="mesh-line mesh-line-one" />
        <span className="mesh-line mesh-line-two" />
        <span className="signal-node signal-node-one" />
        <span className="signal-node signal-node-two" />
        <span className="signal-node signal-node-three" />
      </div>
      <Navbar />
      <main>
        <Hero />
        <section className="info-wrap">
          <About />
          <Stats />
        </section>
        <Solutions />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
