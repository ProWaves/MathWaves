/**
 * Convert an unknown error into a user-friendly message.
 */
export function friendlyError(err: unknown): string {
  // Extract the raw message
  let raw = "";
  const anyErr = err as any;
  if (anyErr?.response?.data?.detail) {
    raw = String(anyErr.response.data.detail);
  } else if (anyErr?.message) {
    raw = String(anyErr.message);
  } else if (typeof err === "string") {
    raw = err;
  } else {
    raw = JSON.stringify(err);
  }

  const lower = raw.toLowerCase();

  // Backend not running
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network error") ||
    lower.includes("err_connection_refused") ||
    lower.includes("econnrefused")
  ) {
    return "Cannot reach the backend. Make sure the FastAPI server is running on port 8000.";
  }

  // Rate limits
  if (lower.includes("429") || lower.includes("rate limit") || lower.includes("quota")) {
    return "AI service rate limit reached. Please wait about 30 seconds and try again.";
  }

  // Groq / LLM issues
  if (lower.includes("llm error") || lower.includes("groq")) {
    return "The AI model had trouble generating code. Try rephrasing the formula.";
  }

  // Parsing issues
  if (lower.includes("could not parse") || lower.includes("could not parse formula")) {
    return "We couldn't understand that formula. Try a simpler form like 'x^2 + 3x'.";
  }

  // OCR (Gemini)
  if (lower.includes("gemini") || lower.includes("ocr")) {
    if (lower.includes("no formula")) {
      return "No mathematical formula detected in that image. Try a clearer photo.";
    }
    return "Image OCR failed. Try a clearer, well-lit photo of the formula.";
  }

  // Timeout
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "Request timed out. The AI service may be slow right now — try again.";
  }

  // Server error
  if (lower.includes("500") || lower.includes("internal server")) {
    return "Something went wrong on the server. Please try again in a moment.";
  }

  // Fallback: show a trimmed version of the original
  const trimmed = raw.length > 200 ? raw.slice(0, 200) + "..." : raw;
  return trimmed || "Something unexpected happened. Please try again.";
}