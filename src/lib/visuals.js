function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function drawStar(context, x, y, radius) {
  context.beginPath();
  for (let index = 0; index < 5; index += 1) {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (index === 0) {
      context.moveTo(px, py);
    } else {
      context.lineTo(px, py);
    }
  }
  context.closePath();
  context.fill();
}

export function createChristianArtDataUrl(prompt, width = 640, height = 640) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return "";

  const seed = hashString(prompt);
  const variant = seed % 4;
  const hue = 35 + (seed % 25);

  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, `hsl(${hue + 10}, 55%, 18%)`);
  background.addColorStop(0.45, `hsl(${hue}, 52%, 32%)`);
  background.addColorStop(1, `hsl(${hue - 10}, 58%, 74%)`);
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(width * 0.5, height * 0.3, 20, width * 0.5, height * 0.3, width * 0.4);
  glow.addColorStop(0, "rgba(255, 241, 205, 0.82)");
  glow.addColorStop(0.6, "rgba(255, 241, 205, 0.12)");
  glow.addColorStop(1, "rgba(255, 241, 205, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(255, 246, 225, 0.14)";
  for (let index = 0; index < 24; index += 1) {
    const x = ((seed * (index + 7)) % width + index * 19) % width;
    const y = ((seed * (index + 11)) % height + index * 29) % height;
    drawStar(context, x, y, 4 + (index % 3));
  }

  context.save();
  context.translate(width / 2, height * 0.48);
  context.strokeStyle = "rgba(255, 247, 228, 0.95)";
  context.shadowColor = "rgba(255, 235, 180, 0.4)";
  context.shadowBlur = 30;
  context.lineCap = "round";
  context.lineWidth = 16;

  if (variant === 0) {
    context.beginPath();
    context.moveTo(0, -120);
    context.lineTo(0, 120);
    context.stroke();
    context.beginPath();
    context.moveTo(-78, -8);
    context.lineTo(78, -8);
    context.stroke();
    context.fillStyle = "rgba(244, 215, 146, 0.9)";
    context.beginPath();
    context.arc(0, -150, 46, 0, Math.PI * 2);
    context.fill();
  } else if (variant === 1) {
    context.lineWidth = 12;
    context.beginPath();
    context.roundRect(-150, -120, 300, 240, 20);
    context.stroke();
    context.lineWidth = 10;
    context.beginPath();
    context.moveTo(-150, -40);
    context.lineTo(150, -40);
    context.stroke();
    context.beginPath();
    context.moveTo(-90, -120);
    context.lineTo(-90, 120);
    context.stroke();
    context.beginPath();
    context.moveTo(0, -120);
    context.lineTo(0, 120);
    context.stroke();
    context.beginPath();
    context.moveTo(90, -120);
    context.lineTo(90, 120);
    context.stroke();
    context.lineWidth = 14;
    context.beginPath();
    context.moveTo(0, -100);
    context.lineTo(0, 100);
    context.stroke();
    context.beginPath();
    context.moveTo(-66, -5);
    context.lineTo(66, -5);
    context.stroke();
  } else if (variant === 2) {
    context.lineWidth = 13;
    context.beginPath();
    context.arc(-70, 10, 52, Math.PI * 1.1, Math.PI * 1.95);
    context.stroke();
    context.beginPath();
    context.arc(70, 10, 52, Math.PI * 1.15, Math.PI * 1.98);
    context.stroke();
    context.beginPath();
    context.moveTo(-90, 52);
    context.lineTo(90, 52);
    context.stroke();
    context.beginPath();
    context.moveTo(-10, -86);
    context.lineTo(10, -86);
    context.lineTo(18, -28);
    context.lineTo(-18, -28);
    context.closePath();
    context.fillStyle = "rgba(255, 247, 228, 0.96)";
    context.fill();
  } else {
    context.lineWidth = 14;
    context.beginPath();
    context.moveTo(0, -120);
    context.lineTo(0, 120);
    context.stroke();
    context.beginPath();
    context.moveTo(-78, -8);
    context.lineTo(78, -8);
    context.stroke();
    context.fillStyle = "rgba(255, 241, 205, 0.55)";
    context.beginPath();
    context.arc(0, -162, 70, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();

  context.fillStyle = "rgba(255, 250, 241, 0.92)";
  context.font = "700 28px Georgia, serif";
  context.textAlign = "center";
  const title = prompt.toLowerCase().includes("nativity")
    ? "Nativity"
    : prompt.toLowerCase().includes("stained glass")
      ? "Stained Glass"
      : "Christian Art";
  context.fillText(title, width / 2, height - 88);
  context.font = "500 18px 'Source Sans 3', sans-serif";
  context.fillText("Generated locally for demo reliability", width / 2, height - 56);

  return canvas.toDataURL("image/png");
}
