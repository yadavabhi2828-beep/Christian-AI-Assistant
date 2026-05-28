export function parseAssistantResponse(rawText = "") {
  const text = String(rawText || "").trim();
  const blocks = [];
  let working = text;
  let isFlagged = false;
  let imagePrompt = null;

  if (/^\|\|\|FLAGGED\|\|\|/.test(working)) {
    isFlagged = true;
    working = working.replace(/^\|\|\|FLAGGED\|\|\|\s*/, "");
  }

  const imageRegex = /\|\|\|IMAGE\|\|\|([\s\S]*?)\|\|\|ENDIMAGE\|\|\|/;
  const imageMatch = working.match(imageRegex);
  if (imageMatch) {
    imagePrompt = imageMatch[1].trim();
    working = working.replace(imageMatch[0], "").trim();
  }

  const scriptureRegex = /\|\|\|SCRIPTURE\|\|\|([\s\S]*?)\|\|\|REF\|\|\|([\s\S]*?)\|\|\|END\|\|\|/g;
  let lastIndex = 0;
  let match;

  while ((match = scriptureRegex.exec(working)) !== null) {
    const before = working.slice(lastIndex, match.index).trim();
    if (before) {
      blocks.push({ type: "text", content: before });
    }

    blocks.push({
      type: "scripture",
      verse: match[1].trim(),
      ref: match[2].trim()
    });
    lastIndex = scriptureRegex.lastIndex;
  }

  const after = working.slice(lastIndex).trim();
  if (after) {
    blocks.push({ type: "text", content: after });
  }

  if (!blocks.length && working) {
    blocks.push({ type: "text", content: working });
  }

  return { blocks, imagePrompt, isFlagged };
}
