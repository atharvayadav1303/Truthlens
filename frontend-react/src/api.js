const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

/**
 * Runs a claim through the backend pipeline.
 * mode: "text" | "url" | "image"
 * payload: string for text/url, File object for image
 */
export async function analyzeClaim(mode, payload) {
  let response;

  if (mode === "image") {
    const formData = new FormData();
    formData.append("file", payload);
    response = await fetch(`${API_BASE}/api/analyze/image`, {
      method: "POST",
      body: formData,
    });
  } else {
    response = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: payload, input_type: mode }),
    });
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Something went wrong analyzing that claim.");
  }

  return response.json();
}
