import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "truthlens-cookie-choice";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  function choose(choice) {
    localStorage.setItem(STORAGE_KEY, choice);
    setVisible(false);
    setShowPrefs(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="cookie-banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="cookie-text">
            <p>
              We use cookies to improve your experience and understand how you use our site.
              You can review your choices at any time.
            </p>
            <span className="cookie-powered">Powered by <strong>◐ SureCookie</strong></span>
          </div>

          {showPrefs ? (
            <div className="cookie-prefs">
              <label>
                <input type="checkbox" checked disabled /> Essential (always on)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
                Analytics
              </label>
              <button className="cookie-btn cookie-btn-accept" onClick={() => choose("custom")}>
                Save Preferences
              </button>
            </div>
          ) : (
            <div className="cookie-actions">
              <button className="cookie-btn cookie-btn-accept" onClick={() => choose("all")}>
                Accept All
              </button>
              <button className="cookie-btn cookie-btn-accept" onClick={() => choose("essential")}>
                Only Essential
              </button>
              <button className="cookie-btn cookie-btn-outline" onClick={() => setShowPrefs(true)}>
                Preferences
              </button>
              <button className="cookie-btn cookie-btn-accept" onClick={() => choose("declined")}>
                Decline
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
