from config import THRESHOLD_VERY_LIKELY, THRESHOLD_MAYBE, THRESHOLD_RELATED


def classify(top_score: float) -> dict:
    """
    Mirrors the thresholds from the architecture sketch:
      >= 0.90  -> Very Likely True   (was ">95%" in the sketch; tune in .env)
      >= 0.75  -> Maybe True
      >= 0.50  -> Related but Unverified (matches another outlet's angle,
                  not a clean confirmation - your "0.5 to 0.75 -> another
                  news outlet" case)
      <  0.50  -> Unverified / Likely False (no matching coverage found)
    """
    if top_score >= THRESHOLD_VERY_LIKELY:
        return {
            "verdict": "Very Likely True",
            "risk_level": "Low",
            "explanation": "This claim closely matches coverage from a verified news source.",
        }
    if top_score >= THRESHOLD_MAYBE:
        return {
            "verdict": "Likely True",
            "risk_level": "Low-Medium",
            "explanation": "This claim is well aligned with existing coverage, though not an exact match.",
        }
    if top_score >= THRESHOLD_RELATED:
        return {
            "verdict": "Related, Unverified",
            "risk_level": "Medium",
            "explanation": "Similar stories exist, but no outlet confirms this exact claim. Treat with caution.",
        }
    return {
        "verdict": "Unverified / Possible Misinformation",
        "risk_level": "High",
        "explanation": "No credible coverage matching this claim was found in the sources checked.",
    }
