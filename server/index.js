import express from "express";
import { buildSystemPrompt } from "./prompt.js";
import { buildDemoReply } from "./mockAssistant.js";
import { classifyPrompt, extractLatestUserMessage } from "./moderation.js";

const app = express();
const PORT = Number(process.env.PORT || 8787);
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
const USE_DEMO_FALLBACK = process.env.USE_DEMO_FALLBACK !== "false";

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
  res.json({ ok: true, configured: Boolean(ANTHROPIC_API_KEY) });
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

    if (!ANTHROPIC_API_KEY) {
      return res.json({
        reply: buildDemoReply({ messages, denomination }),
        safety: { blocked: false },
        mode: "demo"
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        temperature: 0.7,
        system: buildSystemPrompt(denomination),
        messages: messages.slice(-20).map((message) => ({
          role: message.role,
          content: String(message.content || "")
        }))
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (USE_DEMO_FALLBACK) {
        return res.json({
          reply: buildDemoReply({ messages, denomination }),
          safety: { blocked: false },
          mode: "fallback",
          error: errorText
        });
      }

      return res.status(response.status).json({
        error: "Anthropic request failed",
        details: errorText
      });
    }

    const data = await response.json();
    const reply = data?.content?.map((block) => block?.text || "").join("").trim() || "I'm sorry, I could not generate a response.";

    return res.json({
      reply,
      safety: { blocked: false },
      mode: "anthropic"
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
