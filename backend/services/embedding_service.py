"""Lightweight claim-to-article similarity ranking.

This deliberately avoids loading a transformer model at request time so the
API can run reliably on small deployment instances.
"""
from collections import Counter
from math import sqrt
import re


def _term_counts(text: str) -> Counter[str]:
    return Counter(re.findall(r"[a-z0-9]+", text.lower()))


def _cosine_similarity(left: Counter[str], right: Counter[str]) -> float:
    if not left or not right:
        return 0.0

    dot_product = sum(count * right.get(term, 0) for term, count in left.items())
    left_norm = sqrt(sum(count * count for count in left.values()))
    right_norm = sqrt(sum(count * count for count in right.values()))
    return dot_product / (left_norm * right_norm) if left_norm and right_norm else 0.0


def best_matches(claim: str, candidates: list[dict], top_k: int = 5) -> list[dict]:
    """Rank candidate articles by normalized keyword overlap with the claim."""
    if not candidates:
        return []

    claim_terms = _term_counts(claim)
    ranked = []
    for candidate in candidates:
        article = dict(candidate)
        article["similarity"] = round(_cosine_similarity(claim_terms, _term_counts(article["text"])), 4)
        ranked.append(article)

    ranked.sort(key=lambda article: article["similarity"], reverse=True)
    return ranked[:top_k]
