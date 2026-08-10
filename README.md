# TruthLens AI — Fake News Detector

Matches your sketch: user submits a claim → server pulls comparison
articles (NewsAPI, falling back to a local sample DB) → SBERT embeds
both sides → cosine similarity against a threshold decides the verdict.

```
truthlens/
├── backend/
│   ├── main.py                 FastAPI app, 3 endpoints
│   ├── config.py                thresholds + env vars
│   ├── requirements.txt
│   ├── .env.example              copy to .env and fill in
│   ├── data/local_articles.json  fallback "already created database"
│   └── services/
│       ├── embedding_service.py  SBERT + cosine similarity
│       ├── news_service.py       NewsAPI call + local DB fallback
│       ├── ocr_service.py        screenshot → text (pytesseract)
│       ├── url_extractor.py      article URL → text (bs4)
│       └── verdict.py            score → verdict/risk label
├── frontend/                     plain HTML/CSS/JS version (still works)
│   ├── index.html
│   ├── style.css
│   └── script.js
└── frontend-react/                React version, pixel-matched to your screenshots
    ├── src/
    │   ├── App.jsx
    │   ├── api.js                  calls the FastAPI backend
    │   ├── styles.css              colors sampled directly from your screenshots
    │   └── components/
    │       ├── Navbar.jsx
    │       ├── Hero.jsx
    │       ├── VerifyCard.jsx      the interactive checker (tabs, presets, results)
    │       ├── ResultPanel.jsx
    │       ├── About.jsx
    │       ├── Stats.jsx           animated counters (fixes the "0+" bug in your template)
    │       ├── Solutions.jsx
    │       ├── CookieBanner.jsx
    │       └── Footer.jsx
    └── package.json
```

## React frontend setup (matches your screenshots)

```bash
cd frontend-react
npm install
cp .env.example .env      # points at your backend, defaults to localhost:8000
npm run dev
```

Opens on **http://localhost:5500**.

**Colors are sampled directly from your screenshots**, not guessed — I
pixel-sampled the pink (`#C6407E`), the card border (`#C74382`), the
blush section background (`#F8ECF0`), the four preset chip colors, and
the near-black heading color (`#17101A`) straight out of the PNGs you
sent, so it should look essentially identical.

**Two things I changed on purpose, not by accident:**
- The stats counters (`Projects Completed`, etc.) **actually animate up**
  now instead of freezing at "0+" — your screenshots show the original
  site's counter animation never firing. Numbers are placeholders
  (120+, 96%, 92%, 8+) — edit `STATS` in `Stats.jsx` with your real ones.
- The decorative Spider-Man/comics banner and Hogwarts-style castle
  photo from the template are **not** reproduced — those are
  copyrighted Marvel/Warner Bros. material, so I swapped in neutral
  stock photography instead. Swap the `picsum.photos` URLs in
  `About.jsx` / `Solutions.jsx` for your own images whenever you're ready.

The old `frontend/` (plain HTML/CSS/JS) still works if you'd rather not
use React — both talk to the same backend.

## 1. Get a free News API key

You picked "no key yet," so here's the fastest path:

1. Go to **https://newsapi.org/register**
2. Sign up with an email (no credit card needed for the free Developer plan)
3. Copy the API key shown on your account dashboard
4. Free tier limits: **100 requests/day**, and it can't be called from a
   production frontend directly (server-side only — which is exactly
   what this backend does, so you're fine)

Until you add the key, the app **still works** — it automatically falls
back to `backend/data/local_articles.json`, a small sample database you
can freely edit/expand.

## 2. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

# OCR requires the Tesseract binary itself, not just the Python wrapper:
#   macOS:   brew install tesseract
#   Ubuntu:  sudo apt-get install tesseract-ocr
#   Windows: https://github.com/UB-Mannheim/tesseract/wiki

cp .env.example .env
# then open .env and paste your NEWS_API_KEY

uvicorn main:app --reload --port 8000
```

First run will download the SBERT model (~80MB, one-time).

Check it's alive: **http://localhost:8000/api/health**
Interactive API docs: **http://localhost:8000/docs**

## 3. Frontend setup

No build step — it's plain HTML/CSS/JS.

```bash
cd frontend
python3 -m http.server 5500
```

Open **http://localhost:5500**. `script.js` already points
`API_BASE` at `http://localhost:8000`.

## 4. How the scoring works

| Similarity | Verdict | Risk |
|---|---|---|
| ≥ 90% | Very Likely True | Low |
| ≥ 75% | Likely True | Low-Medium |
| ≥ 50% | Related, Unverified | Medium |
| < 50% | Unverified / Possible Misinformation | High |

Thresholds live in `.env` (`THRESHOLD_VERY_LIKELY`, etc.) — tune them
once you've tested against real examples, exactly like your "95% = very
likely, 80% = maybe" notes.

## 5. Things worth doing before this is production-ready

- **Rate limit / auth** the `/api/analyze*` endpoints — right now anyone
  can hit them.
- **Expand `local_articles.json`** or move it to a real database
  (Postgres, etc.) once you outgrow a static file.
- **Cache NewsAPI responses** (e.g. Redis, 15–30 min TTL) — the free
  tier's 100 req/day disappears fast otherwise.
- **Swap `all-MiniLM-L6-v2` for `all-mpnet-base-v2`** in
  `embedding_service.py` if you want higher accuracy and can afford
  the slower inference.
- Tighten CORS in `main.py` (`allow_origins=["*"]`) to your real
  frontend domain before deploying.
