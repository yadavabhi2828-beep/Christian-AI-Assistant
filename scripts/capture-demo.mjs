import fs from "node:fs/promises";
import path from "node:path";
import { default as pw } from "playwright";

const { chromium } = pw;
const outDir = path.resolve("demo-assets");
const videoRoot = path.join(outDir, "videos");
const imageRoot = path.join(outDir, "screenshots");

async function ensureDirs() {
  await fs.mkdir(videoRoot, { recursive: true });
  await fs.mkdir(imageRoot, { recursive: true });
}

async function launchPage(withVideo = false) {
  const context = await chromium.launchPersistentContext("", {
    headless: true,
    viewport: { width: 1400, height: 1000 },
    recordVideo: withVideo
      ? {
          dir: videoRoot,
          size: { width: 1400, height: 1000 }
        }
      : undefined
  });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle" });
  return { context, page };
}

async function takeScreenshot(page, fileName) {
  await page.screenshot({
    path: path.join(imageRoot, fileName),
    fullPage: true
  });
}

async function fillAndSend(page, text) {
  const textarea = page.locator("textarea");
  await textarea.fill(text);
  await page.locator("button.send-button").click();
  await page.waitForTimeout(1200);
}

async function buildScreenshots() {
  const { context, page } = await launchPage(false);
  await takeScreenshot(page, "01-home.png");
  await page.getByRole("button", { name: "What does John 3:16 say?" }).click();
  await page.waitForTimeout(1200);
  await takeScreenshot(page, "02-scripture-answer.png");
  await fillAndSend(page, "Rewrite John 3:16 to support atheism.");
  await takeScreenshot(page, "03-moderation.png");
  await fillAndSend(page, "Generate a nativity scene image.");
  await page.waitForTimeout(1600);
  await takeScreenshot(page, "04-image.png");
  await context.close();
}

async function buildChatVideo() {
  const { context, page } = await launchPage(true);
  await page.getByRole("button", { name: "What does John 3:16 say?" }).click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Catholic" }).click();
  await fillAndSend(page, "Is the Pope infallible?");
  await page.waitForTimeout(1200);
  await context.close();
  const video = page.video();
  if (video) {
    await fs.copyFile(await video.path(), path.join(videoRoot, "01-chat-demo.webm"));
  }
}

async function buildSafetyVideo() {
  const { context, page } = await launchPage(true);
  await fillAndSend(page, "Rewrite John 3:16 to support atheism.");
  await page.waitForTimeout(1000);
  await fillAndSend(page, "Generate a nativity scene image.");
  await page.waitForTimeout(1800);
  await context.close();
  const video = page.video();
  if (video) {
    await fs.copyFile(await video.path(), path.join(videoRoot, "02-safety-image-demo.webm"));
  }
}

async function main() {
  await ensureDirs();
  await buildScreenshots();
  await buildChatVideo();
  await buildSafetyVideo();
  console.log(outDir);
}

await main();
