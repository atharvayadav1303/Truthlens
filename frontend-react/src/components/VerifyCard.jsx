import { useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { analyzeClaim } from "../api.js";
import ResultPanel from "./ResultPanel.jsx";

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

const PRESETS = [
  { label: "Health Myth", tone: "health", text: "Drinking hot water with lemon every morning cures cancer within weeks." },
  { label: "Financial Scam", tone: "financial", text: "You won a lottery of 25 lakh, share your bank details to claim it." },
  { label: "Verified News", tone: "verified", text: "Gukesh Dommaraju won World chess championship" },
  { label: "Unverified Claim", tone: "unverified", text: "Aliens spotted landing near Mumbai coastline last night." },
];

export default function VerifyCard() {
  const [activeTab, setActiveTab] = useState("text");
  const [textValue, setTextValue] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const rotateX = useSpring(useTransform(tiltY, [-0.5, 0.5], [4, -4]), { stiffness: 180, damping: 22 });
  const rotateY = useSpring(useTransform(tiltX, [-0.5, 0.5], [-5, 5]), { stiffness: 180, damping: 22 });

  function handleCardMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(x);
    tiltY.set(y);
    glareX.set((x + 0.5) * 100);
    glareY.set((y + 0.5) * 100);
  }

  function resetCardTilt() {
    tiltX.set(0);
    tiltY.set(0);
    glareX.set(50);
    glareY.set(50);
  }

  function goToTab(tab) {
    setActiveTab(tab);
    setError(null);
  }

  function openFilePicker() {
    setActiveTab("image");
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  }

  async function handleAnalyze() {
    setError(null);
    setResult(null);

    let payload;
    if (activeTab === "text") {
      if (!textValue.trim()) return setError("Please enter some text first.");
      payload = textValue;
    } else if (activeTab === "url") {
      if (!urlValue.trim()) return setError("Please paste an article link first.");
      payload = urlValue;
    } else {
      if (!imageFile) return setError("Please choose a screenshot to upload.");
      payload = imageFile;
    }

    setLoading(true);
    try {
      const data = await analyzeClaim(activeTab, payload);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const quickBarValue =
    activeTab === "url" ? urlValue : activeTab === "image" ? (imageFile?.name || "") : textValue;

  return (
    <motion.div
      id="verify"
      className="verify-card"
      onMouseMove={handleCardMove}
      onMouseLeave={resetCardTilt}
      style={{
        rotateX,
        rotateY,
        "--glare-x": useTransform(glareX, (v) => `${v}%`),
        "--glare-y": useTransform(glareY, (v) => `${v}%`),
      }}
    >
      <span className="pill-tag">Verification Engine</span>
      <h2>Check Any News Article, Link, or Image</h2>
      <p className="verify-sub">
        Type a news headline, paste an article URL, or upload a screenshot to verify credibility instantly.
      </p>

      {/* Quick single-line bar, mirrors whichever tab is active below */}
      <div className="quick-bar">
        <svg className="quick-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="quick-input"
          placeholder="Enter news headline, paste article link (URL), or upload screenshot image"
          value={quickBarValue}
          readOnly={activeTab === "image"}
          onChange={(e) =>
            activeTab === "url" ? setUrlValue(e.target.value) : setTextValue(e.target.value)
          }
          onFocus={() => activeTab === "image" && setActiveTab("text")}
        />
        <button type="button" className="quick-btn" onClick={() => goToTab("url")}>
          <span className="quick-btn-icon" aria-hidden="true">URL</span> Link
        </button>
        <button type="button" className="quick-btn" onClick={openFilePicker}>
          <span className="quick-btn-icon" aria-hidden="true">IMG</span> Image
        </button>
        <motion.button
          type="button"
          className="btn btn-primary quick-submit"
          onClick={handleAnalyze}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.04 }}
          whileTap={{ scale: loading ? 1 : 0.96 }}
        >
          {loading ? <><Spinner /> Checking...</> : "Check Truth"}
        </motion.button>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === "text" ? "active" : ""}`} onClick={() => goToTab("text")}>
          Text Input
        </button>
        <button className={`tab ${activeTab === "url" ? "active" : ""}`} onClick={() => goToTab("url")}>
          News Link
        </button>
        <button className={`tab ${activeTab === "image" ? "active" : ""}`} onClick={() => goToTab("image")}>
          Screenshot OCR
        </button>
        <div className="domain-select">
          <span>Domain:</span>
          <select defaultValue="auto">
            <option value="auto">Auto-Detect Domain</option>
            <option value="politics">Politics</option>
            <option value="health">Health</option>
            <option value="finance">Finance</option>
            <option value="sports">Sports</option>
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "text" && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <textarea
              className="claim-textarea"
              placeholder="Paste article text or message forward here..."
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
            />
            <div className="char-count">{textValue.length} characters</div>
          </motion.div>
        )}

        {activeTab === "url" && (
          <motion.input
            key="url"
            className="url-field"
            type="url"
            placeholder="Paste the news article link (URL) here..."
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {activeTab === "image" && (
          <motion.button
            key="image"
            type="button"
            className="dropzone"
            onClick={() => fileInputRef.current?.click()}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.01 }}
          >
            {imageFile ? (
              <span>{imageFile.name}</span>
            ) : (
              <span>Click to upload a screenshot for OCR verification</span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="visually-hidden"
        onChange={handleFileChange}
      />

      <div className="presets">
        <span className="presets-label">Quick Presets:</span>
        {PRESETS.map((p) => (
          <motion.button
            key={p.label}
            type="button"
            className={`preset preset-${p.tone}`}
            onClick={() => {
              setActiveTab("text");
              setTextValue(p.text);
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            {p.label}
          </motion.button>
        ))}
        <motion.button
          type="button"
          className="btn btn-primary"
          onClick={handleAnalyze}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.04 }}
          whileTap={{ scale: loading ? 1 : 0.96 }}
        >
          {loading ? <><Spinner /> Analyzing...</> : "Analyze Credibility"}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {(result || error) && (
          <motion.div
            key={error ? "error" : "result"}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <ResultPanel result={result} error={error} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
