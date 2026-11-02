// Road dust is translucent; wet mud gathers below the doors and wheel arches.
// Colors are material tokens, read from the global design system by the caller.
export function paintRoadDirt(canvas: HTMLCanvasElement, car: HTMLImageElement, dust: string, mud: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  const veil = ctx.createLinearGradient(0, 0, 0, height);
  veil.addColorStop(0, "transparent");
  veil.addColorStop(0.12, dust);
  veil.addColorStop(0.55, dust);
  veil.addColorStop(0.8, mud);
  veil.addColorStop(1, dust);
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, width, height);
  // Fine mineral dust, irregular splashes and dragged rain streaks.
  const k = width / 1200;
  for (let i = 0; i < 14000; i++) {
    const x = Math.random() * width, y = Math.random() * height;
    ctx.globalAlpha = 0.08 + Math.random() * 0.18;
    ctx.fillStyle = Math.random() > 0.65 ? mud : dust;
    const size = (0.5 + Math.random() * 2) * k;
    ctx.fillRect(x, y, size, size);
  }
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * width;
    const y = height * (0.56 + Math.random() * 0.32);
    const radius = (0.8 + Math.random() ** 3 * 11) * k;
    ctx.globalAlpha = 0.1 + Math.random() * 0.4;
    ctx.fillStyle = mud;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * (0.7 + Math.random()), radius * 0.65, Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width, y = height * (0.2 + Math.random() * 0.4);
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = mud;
    ctx.lineWidth = (0.6 + Math.random() * 1.5) * k;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - 2 * k, y + 15 * k, x + 3 * k, y + 35 * k, x, y + (35 + Math.random() * 80) * k);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(car, 0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
}