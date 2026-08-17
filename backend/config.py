import os
from dotenv import load_dotenv

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
NEWS_API_URL = "https://newsapi.org/v2/everything"

# A compact SBERT model with strong semantic-search quality. It downloads once
# on the first analysis request and is then cached by sentence-transformers.
SBERT_MODEL = os.getenv("SBERT_MODEL", "all-MiniLM-L6-v2")

TRUSTED_DOMAINS = [
    d.strip() for d in os.getenv("TRUSTED_DOMAINS", "").split(",") if d.strip()
]

THRESHOLD_VERY_LIKELY = float(os.getenv("THRESHOLD_VERY_LIKELY", 0.90))
THRESHOLD_MAYBE = float(os.getenv("THRESHOLD_MAYBE", 0.75))
THRESHOLD_RELATED = float(os.getenv("THRESHOLD_RELATED", 0.50))

# How many outlets to pull from NewsAPI / the local fallback database per check.
ARTICLES_TO_COMPARE = 20
