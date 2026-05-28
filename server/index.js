import express from "express";
import { buildSystemPrompt } from "./prompt.js";
import { buildDemoReply } from "./mockAssistant.js";
import { classifyPrompt, extractLatestUserMessage } from "./moderation.js";
import { callGeminiWithFailover, getGeminiModelList } from "./gemini.js";

const app = express();
const PORT = Number(process.env.PORT || 8787);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const USE_DEMO_FALLBACK = process.env.USE_DEMO_FALLBACK !== "false";
const GEMINI_MODEL_LIST = getGeminiModelList();

app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key, anthropic-version");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, configured: Boolean(GEMINI_API_KEY), models: GEMINI_MODEL_LIST });
});

app.post("/api/chat", async (req, res) => {
  try {
    const denomination = String(req.body?.denomination || "Protestant");
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const latestUserMessage = extractLatestUserMessage(messages);
    const moderation = classifyPrompt(latestUserMessage);

    if (moderation.blocked) {
      return res.json({
        reply: `|||FLAGGED|||${moderation.message}`,
        safety: moderation,
        mode: "moderated"
      });
    }

    if (!GEMINI_API_KEY) {
      return res.json({
        reply: buildDemoReply({ messages, denomination }),
        safety: { blocked: false },
        mode: "demo"
      });
    }

    const geminiResult = await callGeminiWithFailover({
      apiKey: GEMINI_API_KEY,
      modelList: GEMINI_MODEL_LIST,
      systemPrompt: buildSystemPrompt(denomination),
      messages: messages.slice(-20),
      maxOutputTokens: 1200,
      temperature: 0.7
    });

    if (geminiResult.ok) {
      return res.json({
        reply: geminiResult.text,
        safety: { blocked: false },
        mode: "gemini",
        model: geminiResult.model,
        attemptedModels: geminiResult.attempted
      });
    }

    if (USE_DEMO_FALLBACK) {
      return res.json({
        reply: buildDemoReply({ messages, denomination }),
        safety: { blocked: false },
        mode: geminiResult.kind === "quota_exhausted" ? "fallback-quota" : "fallback-error",
        model: geminiResult.model,
        attemptedModels: geminiResult.attempted,
        error: geminiResult.error
      });
    }

    return res.status(502).json({
      error: "Gemini request failed",
      details: geminiResult.error,
      attemptedModels: geminiResult.attempted
    });
  } catch (error) {
    if (USE_DEMO_FALLBACK) {
      return res.json({
        reply: buildDemoReply({
          messages: Array.isArray(req.body?.messages) ? req.body.messages : [],
          denomination: String(req.body?.denomination || "Protestant")
        }),
        safety: { blocked: false },
        mode: "fallback",
        error: String(error?.message || error)
      });
    }

    return res.status(500).json({
      error: "Server error",
      details: String(error?.message || error)
    });
  }
});

app.listen(PORT, () => {
  console.log(`Christian AI Assistant backend listening on http://127.0.0.1:${PORT}`);
});
