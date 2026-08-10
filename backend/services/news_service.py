"""
Two sources, matching your "1st option / 2nd option" sketch:

  1. LOCAL_DB   - a small curated JSON file of known-real headlines,
                  used when there's no NEWS_API_KEY configured yet,
                  or as an offline fallback if NewsAPI errors out.
  2. NEWS_API   - live search across ~20 outlets via newsapi.org.

fetch_comparison_articles() picks whichever source is available and
always returns the same shape: [{"text": ..., "source": ..., "url": ...}]
"""
import json
import os
import requests

from config import NEWS_API_KEY, NEWS_API_URL, TRUSTED_DOMAINS, ARTICLES_TO_COMPARE

LOCAL_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "local_articles.json")


def _load_local_db() -> list[dict]:
    try:
        with open(LOCAL_DB_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []


def _search_local_db(query: str) -> list[dict]:
    """Very simple keyword overlap filter so we don't hand SBERT the
    entire database every time. SBERT does the real matching after this."""
    words = {w.lower() for w in query.split() if len(w) > 3}
    articles = _load_local_db()
    if not words:
        return articles[:ARTICLES_TO_COMPARE]

    scored = []
    for a in articles:
        overlap = sum(1 for w in words if w in a["text"].lower())
        scored.append((overlap, a))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [a for _, a in scored[:ARTICLES_TO_COMPARE]]


def _search_news_api(query: str) -> list[dict]:
    params = {
        "q": query,
        "apiKey": NEWS_API_KEY,
        "language": "en",
        "sortBy": "relevancy",
        "pageSize": ARTICLES_TO_COMPARE,
    }
    if TRUSTED_DOMAINS:
        params["domains"] = ",".join(TRUSTED_DOMAINS)

    def request_articles(request_params: dict) -> list[dict]:
        resp = requests.get(NEWS_API_URL, params=request_params, timeout=10)
        resp.raise_for_status()

        articles = []
        for item in resp.json().get("articles", []):
            title = item.get("title") or ""
            description = item.get("description") or ""
            text = f"{title}. {description}".strip()
            if not text:
                continue
            articles.append({
                "text": text,
                "source": (item.get("source") or {}).get("name", "Unknown"),
                "url": item.get("url", ""),
            })
        return articles

    articles = request_articles(params)
    if articles or not TRUSTED_DOMAINS:
        return articles

    # The allowlist is a preference, not a reason to discard all live coverage.
    unrestricted_params = {k: v for k, v in params.items() if k != "domains"}
    return request_articles(unrestricted_params)


def fetch_comparison_articles(query: str) -> tuple[list[dict], str]:
    """
    Returns (articles, source_used) where source_used is "news_api" or
    "local_db" so the frontend/response can be transparent about it.
    """
    if NEWS_API_KEY:
        try:
            articles = _search_news_api(query)
            if articles:
                return articles, "news_api"
        except requests.RequestException:
            pass  # fall through to local DB

    return _search_local_db(query), "local_db"
