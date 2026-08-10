import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={`nav ${scrolled ? "nav-scrolled" : ""}`}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="nav-inner">
        <a className="wordmark" href="#top">
          <span className="wordmark-mark" aria-hidden="true" />
          TruthLens
        </a>
        <nav className="nav-links">
          <a href="#top" className="active">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#blog">Blog</a>
          <a href="#contact">Contact</a>
        </nav>
        <motion.a
          href="#verify"
          className="btn btn-outline"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
        >
          Explore Now
        </motion.a>
      </div>
    </motion.header>
  );
}
