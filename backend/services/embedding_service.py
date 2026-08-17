"""Semantic claim-to-news matching powered by SBERT.

Sentence-BERT embeds complete sentences into a shared vector space, so a
claim can match an article that expresses the same idea with different words.
The model is loaded on the first analysis request rather than when FastAPI
starts, keeping imports and health checks fast.
"""
from functools import lru_cache
from typing import TYPE_CHECKING

from config import SBERT_MODEL

if TYPE_CHECKING:
    from sentence_transformers import SentenceTransformer


@lru_cache(maxsize=1)
def _get_model() -> "SentenceTransformer":
    """Load and cache the configured SBERT model for this worker process."""
    # Importing PyTorch and sentence-transformers is expensive. Keeping it here
    # lets Render's health endpoint respond before the first analysis request.
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(SBERT_MODEL)


def best_matches(claim: str, candidates: list[dict], top_k: int = 5) -> list[dict]:
    """Rank articles by cosine similarity to the claim's *meaning*.

    With normalized embeddings, a dot product is cosine similarity. Encoding
    the claim and all article text in one batch is also substantially faster
    than encoding each article separately.
    """
    if not candidates or not claim.strip():
        return []

    articles = [dict(candidate) for candidate in candidates]
    texts = [article.get("text", "") for article in articles]
    model = _get_model()
    embeddings = model.encode(
        [claim, *texts],
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    )

    claim_embedding = embeddings[0]
    for article, article_embedding in zip(articles, embeddings[1:]):
        # Both vectors are unit-normalized, therefore this is cosine similarity.
        article["similarity"] = round(float(claim_embedding @ article_embedding), 4)

    articles.sort(key=lambda article: article["similarity"], reverse=True)
    return articles[:top_k]
