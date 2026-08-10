// Point this at your FastAPI backend (uvicorn main:app --reload runs on :8000 by default)
const API_BASE = "http://localhost:8000";

const textInput = document.getElementById("claim-input");
const urlInput = document.getElementById("url-input");
const imageInput = document.getElementById("image-input");
const charCount = document.getElementById("char-count");
const analyzeBtn = document.getElementById("analyze-btn");
const resultBox = document.getElementById("result");
const tabs = document.querySelectorAll(".tab");

let activeTab = "text";

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    activeTab = tab.dataset.tab;

    textInput.style.display = activeTab === "text" ? "block" : "none";
    urlInput.classList.toggle("visible", activeTab === "url");
    imageInput.classList.toggle("visible", activeTab === "image");
  });
});

textInput.addEventListener("input", () => {
  charCount.textContent = textInput.value.length;
});

document.querySelectorAll(".preset").forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    document.querySelector('[data-tab="text"]').classList.add("active");
    activeTab = "text";
    textInput.style.display = "block";
    urlInput.classList.remove("visible");
    imageInput.classList.remove("visible");

    textInput.value = btn.dataset.preset;
    charCount.textContent = textInput.value.length;
  });
});

function riskClass(risk) {
  if (risk === "Low" || risk === "Low-Medium") return "low";
  if (risk === "Medium") return "medium";
  return "high";
}

function renderResult(data) {
  resultBox.classList.remove("hidden");

  const matches = (data.matched_articles || []).map(a => `
    <li>
      <strong>${(a.similarity * 100).toFixed(1)}%</strong> match &mdash;
      ${a.source ? `<em>${a.source}</em>: ` : ""} ${a.text}
      ${a.url ? ` &middot; <a href="${a.url}" target="_blank" rel="noopener">source</a>` : ""}
    </li>
  `).join("");

  resultBox.innerHTML = `
    <h3>${data.verdict}</h3>
    <div class="score-row">
      <span class="badge ${riskClass(data.risk_level)}">${data.risk_level} risk</span>
      <span>Credibility score: <strong>${(data.credibility_score * 100).toFixed(1)}%</strong></span>
    </div>
    <p>${data.explanation}</p>
    <p style="color:#6B6470; font-size:13px;">Compared against: ${data.source_used === "news_api" ? "live News API results" : "local sample database"}</p>
    ${matches ? `<ul class="matched-list">${matches}</ul>` : ""}
  `;
}

function renderError(message) {
  resultBox.classList.remove("hidden");
  resultBox.innerHTML = `<p class="error-text">${message}</p>`;
}

async function analyze() {
  analyzeBtn.textContent = "Analyzing...";
  analyzeBtn.disabled = true;

  try {
    let response;

    if (activeTab === "image") {
      const file = imageInput.files[0];
      if (!file) throw new Error("Please choose a screenshot to upload.");
      const formData = new FormData();
      formData.append("file", file);
      response = await fetch(`${API_BASE}/api/analyze/image`, { method: "POST", body: formData });
    } else {
      const content = activeTab === "url" ? urlInput.value : textInput.value;
      if (!content.trim()) throw new Error("Please enter some text or a link first.");
      response = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, input_type: activeTab }),
      });
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Something went wrong analyzing that claim.");
    }

    const data = await response.json();
    renderResult(data);
  } catch (err) {
    renderError(err.message);
  } finally {
    analyzeBtn.textContent = "Analyze Credibility";
    analyzeBtn.disabled = false;
  }
}

analyzeBtn.addEventListener("click", analyze);
