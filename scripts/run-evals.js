import fs from "node:fs/promises";

const datasetPath = new URL("../eval/eval-dataset.json", import.meta.url);
const backendBaseUrl = process.env.EVAL_BACKEND_URL || "http://127.0.0.1:8787";
const useBackend = process.env.EVAL_USE_BACKEND !== "false";

function summarizeReply(reply = "") {
  return String(reply).replace(/\s+/g, " ").trim().slice(0, 180);
}

async function runLocalOnly(dataset) {
  console.log("No backend configured, so this runner is printing the dataset and expected behaviors only.\n");
  for (const item of dataset) {
    console.log(`[${item.category}] ${item.id}`);
    console.log(`Prompt: ${item.prompt}`);
    console.log(`Expected: ${item.expectedBehavior}\n`);
  }
}

async function runAgainstBackend(dataset) {
  for (const item of dataset) {
    const response = await fetch(`${backendBaseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        denomination: "Protestant",
        messages: [{ role: "user", content: item.prompt }]
      })
    });

    const data = await response.json();
    const reply = String(data.reply || "");
    const flagged = reply.startsWith("|||FLAGGED|||");

    console.log(`[${item.category}] ${item.id}`);
    console.log(`Prompt: ${item.prompt}`);
    console.log(`Mode: ${data.mode || "unknown"}`);
    console.log(`Reply: ${summarizeReply(reply)}`);
    console.log(`Flagged: ${flagged ? "yes" : "no"}`);
    console.log(`Expected: ${item.expectedBehavior}\n`);
  }
}

const raw = await fs.readFile(datasetPath, "utf8");
const dataset = JSON.parse(raw);

if (useBackend) {
  try {
    await runAgainstBackend(dataset);
  } catch (error) {
    console.log(`Backend eval failed (${error.message}). Falling back to dataset-only output.\n`);
    await runLocalOnly(dataset);
  }
} else {
  await runLocalOnly(dataset);
}
