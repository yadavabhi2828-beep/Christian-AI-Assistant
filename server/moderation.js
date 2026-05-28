const BLOCK_PATTERNS = [
  {
    regex: /rewrite (?:the )?(?:bible|scripture|john 3:16|psalm \d+)/i,
    reason: "rewriting Scripture to support a separate ideology"
  },
  {
    regex: /support (?:an? )?(?:extreme|hateful|racist|violent|terrorist|neo-nazi|supremacist) ideology/i,
    reason: "supporting hateful or extremist ideology"
  },
  {
    regex: /(violent|graphic|blood-soaked|torture) .* jesus/i,
    reason: "violent religious imagery"
  },
  {
    regex: /hateful (?:religious )?content/i,
    reason: "hateful religious content"
  },
  {
    regex: /blasphem(?:y|ous).*generate/i,
    reason: "blasphemous content generation"
  }
];

export function extractLatestUserMessage(messages = []) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === "user") {
      return String(message.content || "");
    }
  }

  return "";
}

export function classifyPrompt(text = "") {
  const normalized = String(text || "").trim();
  if (!normalized) {
    return { blocked: false };
  }

  for (const pattern of BLOCK_PATTERNS) {
    if (pattern.regex.test(normalized)) {
      return {
        blocked: true,
        reason: pattern.reason,
        message: `This request was moderated because it involves ${pattern.reason}. I can help with a respectful Christian explanation or a grounded biblical alternative.`
      };
    }
  }

  return { blocked: false };
}
