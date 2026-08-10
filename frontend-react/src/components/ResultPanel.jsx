function riskClass(risk) {
  if (risk === "Low" || risk === "Low-Medium") return "low";
  if (risk === "Medium") return "medium";
  return "high";
}

export default function ResultPanel({ result, error }) {
  if (error) {
    return (
      <div className="result">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="result">
      <h3>{result.verdict}</h3>
      <div className="score-row">
        <span className={`badge ${riskClass(result.risk_level)}`}>
          {result.risk_level} risk
        </span>
        <span>
          Credibility score:{" "}
          <strong>{(result.credibility_score * 100).toFixed(1)}%</strong>
        </span>
      </div>
      <p>{result.explanation}</p>
      <p className="source-note">
        Compared against:{" "}
        {result.source_used === "news_api"
          ? "live News API results"
          : "local sample database"}
      </p>

      {result.matched_articles?.length > 0 && (
        <ul className="matched-list">
          {result.matched_articles.map((a, i) => (
            <li key={i}>
              <strong>{(a.similarity * 100).toFixed(1)}%</strong> match
              {a.source ? <> &mdash; <em>{a.source}</em>:</> : null} {a.text}
              {a.url && (
                <>
                  {" "}
                  &middot;{" "}
                  <a href={a.url} target="_blank" rel="noopener noreferrer">
                    source
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
