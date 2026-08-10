"""
Wraps a Sentence-BERT model so the rest of the app never has to think
about tokenization, batching, or cosine math.
"""
from functools import lru_cache
from sentence_transformers import SentenceTransformer, util


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    # all-MiniLM-L6-v2 is small (~80MB), fast on CPU, and good enough for
    # headline/claim similarity. Swap for all-mpnet-base-v2 if you want
    # higher accuracy at the cost of speed.
    return SentenceTransformer("all-MiniLM-L6-v2")


def embed(texts: list[str]):
    model = get_model()
    return model.encode(texts, convert_to_tensor=True, normalize_embeddings=True)


def best_matches(claim: str, candidates: list[dict], top_k: int = 5) -> list[dict]:
    """
    candidates: list of dicts each with a "text" key (e.g. article title/summary).
    Returns the same dicts, sorted by similarity, each annotated with a
    "similarity" float in [0, 1].
    """
    if not candidates:
        return []

    claim_emb = embed([claim])
    candidate_texts = [c["text"] for c in candidates]
    candidate_embs = embed(candidate_texts)

    scores = util.cos_sim(claim_emb, candidate_embs)[0]

    for c, s in zip(candidates, scores):
        c["similarity"] = round(float(s), 4)

    candidates.sort(key=lambda c: c["similarity"], reverse=True)
    return candidates[:top_k]
