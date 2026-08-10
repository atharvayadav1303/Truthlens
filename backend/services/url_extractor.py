"""
Pulls the headline + lead paragraph out of a pasted article URL.
Deliberately simple (title tag + first <p> tags) rather than pulling in
a heavy library - good enough since SBERT only needs the gist of the
claim, not a perfect full-text extraction.
"""
import requests
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "Mozilla/5.0 (TruthLensBot/1.0)"}


def extract_text_from_url(url: str) -> str:
    resp = requests.get(url, headers=HEADERS, timeout=10)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    title = soup.title.string.strip() if soup.title and soup.title.string else ""

    paragraphs = [p.get_text(strip=True) for p in soup.find_all("p")]
    body = " ".join(paragraphs[:5])  # first few paragraphs is enough context

    combined = f"{title}. {body}".strip()
    return combined[:2000]  # cap length fed into SBERT
