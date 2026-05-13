// Cost-efficient AI integration design:
// 1. The app always tries the local parser first. That costs zero tokens.
// 2. AI parsing is only suggested when local confidence is low.
// 3. Scoring stays local, so the model never needs to calculate formulas.
// 4. AI responses should be tiny JSON objects, not long natural-language text.
// 5. In production, these calls should go through a backend endpoint so API keys
//    are never shipped to the browser.

const aiConfidenceThreshold = 0.7;

export function shouldUseAiParser(parseResult) {
  return parseResult.needsAi || parseResult.confidence < aiConfidenceThreshold;
}

export function buildAiParserPayload(text) {
  return {
    task: "parse_activities",
    responseFormat: "json",
    text,
    schema: {
      activities: [
        {
          type: "study | exercise | food | discipline | social | waste",
          duration: "number of minutes",
          category: "body | knowledge | health | discipline | social | waste",
          difficulty: "easy | normal | hard | veryHard",
        },
      ],
    },
  };
}

export function buildAiDailyReportPayload(reportData) {
  return {
    task: "daily_summary",
    responseFormat: "json",
    reportData,
    schema: {
      score: "number",
      strengths: ["short bullet"],
      weaknesses: ["short bullet"],
      suggestions: ["short bullet"],
    },
  };
}

export async function requestAiActivityParse(text) {
  const payload = buildAiParserPayload(text);

  // This endpoint is intentionally a placeholder. A backend can decide whether
  // the low-confidence input is worth sending to an AI model, cache repeated
  // requests, and enforce a cheap JSON-only response.
  const response = await fetch("/api/ai/parse-activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("AI parser request failed.");
  }

  return response.json();
}

export async function requestAiDailyReport(reportData) {
  const payload = buildAiDailyReportPayload(reportData);

  // Daily reports are user-requested, so this avoids automatic background AI
  // calls while still leaving a clean integration point for a future backend.
  const response = await fetch("/api/ai/daily-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("AI daily report request failed.");
  }

  return response.json();
}
