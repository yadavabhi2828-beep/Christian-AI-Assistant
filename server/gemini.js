const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export function getGeminiModelList() {
  const raw = String(process.env.GEMINI_MODELS || "gemini-2.5-flash,gemini-3.5-flash,gemini-2.5-flash-lite");
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildContents(messages = []) {
  return messages
    .filter((message) => message && (message.role === "user" || message.role === "assistant"))
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: String(message.content || "") }]
    }));
}

function buildSystemInstruction(systemPrompt) {
  return {
    role: "system",
    parts: [{ text: String(systemPrompt || "") }]
  };
}

function extractTextFromResponse(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();
}

function isRateLimitOrQuotaError(status, data, rawText) {
  const haystack = `${status ?? ""} ${data?.error?.status ?? ""} ${data?.error?.message ?? ""} ${rawText ?? ""}`.toLowerCase();
  return status === 429 || haystack.includes("quota") || haystack.includes("resource_exhausted") || haystack.includes("rate limit");
}

export async function callGeminiWithFailover({
  apiKey,
  modelList,
  systemPrompt,
  messages,
  maxOutputTokens = 1200,
  temperature = 0.7
}) {
  const models = Array.isArray(modelList) && modelList.length ? modelList : getGeminiModelList();
  const contents = buildContents(messages);
  const systemInstruction = buildSystemInstruction(systemPrompt);
  const attempted = [];
  let lastLimitError = null;

  for (const model of models) {
    attempted.push(model);

    try {
      const response = await fetch(`${GEMINI_API_BASE}/models/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          system_instruction: systemInstruction,
          contents,
          generationConfig: {
            temperature,
            maxOutputTokens
          }
        })
      });

      const rawText = await response.text();
      let data = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (isRateLimitOrQuotaError(response.status, data, rawText)) {
          lastLimitError = {
            model,
            status: response.status,
            message: data?.error?.message || rawText || `Gemini quota/limit reached for ${model}`
          };
          continue;
        }

        return {
          ok: false,
          kind: "fatal",
          model,
          attempted,
          error: data?.error?.message || rawText || `Gemini request failed for ${model}`
        };
      }

      const text = extractTextFromResponse(data);
      if (!text) {
        return {
          ok: false,
          kind: "fatal",
          model,
          attempted,
          error: `Gemini returned an empty response for ${model}`
        };
      }

      return {
        ok: true,
        model,
        attempted,
        text
      };
    } catch (error) {
      return {
        ok: false,
        kind: "fatal",
        model,
        attempted,
        error: String(error?.message || error)
      };
    }
  }

  return {
    ok: false,
    kind: "quota_exhausted",
    model: models[models.length - 1] || null,
    attempted,
    error: lastLimitError?.message || "Gemini quota/limit reached for all configured models"
  };
}
