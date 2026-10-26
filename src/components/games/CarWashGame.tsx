import { useCallback, useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import carImg from "@/assets/car-branded.png";
import { GameIntro, GameOutro, ProgressBar } from "./GameModal";

const DURATION = 20;

export function CarWashGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [left, setLeft] = useState(DURATION);
  const [clean, setClean] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const cleanRef = useRef(0);
  const totalRef = useRef(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const [sponge, setSponge] = useState<{ x: number; y: number } | null>(null);

  const paintDirt = useCallback(async () => {
    const c = canvasRef.current;
    const img = imgRef.current;
    if (!c || !img) return;
    await img.decode().catch(() => {});
    const r = c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = r.width * dpr;
    c.height = r.height * dpr;
    const ctx = c.getContext("2d")!;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(110, 86, 58, 0.82)";
    ctx.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * c.width, y = Math.random() * c.height, rad = (8 + Math.random() * 40) * dpr;
      ctx.fillStyle = `rgba(${70 + Math.random() * 50}, ${55 + Math.random() * 35}, ${35 + Math.random() * 25}, ${0.25 + Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    // оставляем грязь только на кузове (по силуэту машины)
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(img, 0, 0, c.width, c.height);
    ctx.globalCompositeOperation = "source-over";
    totalRef.current = countDirt(c);
  }, []);

  function countDirt(c: HTMLCanvasElement) {
    const data = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 3; i < data.length; i += 4 * 40) if ((data[i] ?? 0) >= 60) n++;
    return n;
  }

  function measure() {
    const c = canvasRef.current;
    if (!c || !c.width || !totalRef.current) return;
    const left = countDirt(c);
    const pct = Math.min(100, ((totalRef.current - left) / totalRef.current) * 100 * 1.15);
    cleanRef.current = pct;
    setClean(pct);
  }

  function scrub(e: React.PointerEvent<HTMLCanvasElement>) {
    if (phase !== "play") return;
    const c = canvasRef.current!;
    const box = c.getBoundingClientRect();
    setSponge({ x: e.clientX - box.left, y: e.clientY - box.top });
    const r = c.getBoundingClientRect();
    const k = c.width / r.width;
    const x = (e.clientX - r.left) * k, y = (e.clientY - r.top) * k;
    const ctx = c.getContext("2d")!;
    ctx.globalCompositeOperation = "destination-out";
    const rad = 42 * k;
    const from = last.current ?? { x, y };
    const steps = Math.max(1, Math.hypot(x - from.x, y - from.y) / (rad / 3));
    for (let i = 0; i <= steps; i++) {
      const px = from.x + ((x - from.x) * i) / steps, py = from.y + ((y - from.y) * i) / steps;
      const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, "rgba(0,0,0,0.9)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    last.current = { x, y };
  }

  if (phase === "intro")
    return (
      <GameIntro
        title="Эта красотка заслуживает блеска!"
        text="У тебя есть 20 секунд, чтобы отмыть автомобиль. Веди губкой по кузову и смотри, как он преображается."
        cta="Поехали!"
        onStart={() => {
          setClean(0);
          setLeft(DURATION);
          setPhase("play");
        }}
        visual={<img src={carImg} alt="Грязный автомобиль" width={1200} height={457} className="w-full max-w-lg rounded-2xl opacity-90 sepia saturate-50 brightness-75" />}
      />
    );

  if (phase === "done")
    return (
      <GameOutro title="Вот это блеск!" text="Ты навёл порядок — теперь наведи порядок со своими планами и получи скидку на обучение в ГИД." onClaim={() => onComplete(cleanRef.current)}>
        <div className="relative w-full max-w-lg overflow-hidden rounded-2xl">
          <img src={carImg} alt="Чистый автомобиль" width={1200} height={457} className="w-full" />
          <div className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-card/70 to-transparent" />
        </div>
      </GameOutro>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 rounded-full bg-stage-foreground/10 px-3 py-1.5 font-display text-sm tabular-nums">
          <Timer className="size-4 text-accent" /> {left} c
        </div>
        <ProgressBar value={clean} label="Чистота кузова" />
      </div>
      <div className="no-select relative overflow-hidden rounded-2xl bg-stage-foreground/5 p-4" style={{ touchAction: "none" }}>
        <div className="relative">
        <img ref={imgRef} src={carImg} alt="" draggable={false} width={1200} height={457} className="pointer-events-none w-full" />
        <canvas
          ref={canvasRef}
          aria-label="Грязный кузов — проведи пальцем или курсором, чтобы отмыть"
          className="absolute inset-0 h-full w-full cursor-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            last.current = null;
            scrub(e);
          }}
          onPointerMove={scrub}
          onPointerUp={() => (last.current = null)}
          onPointerLeave={() => {
            last.current = null;
            setSponge(null);
          }}
        />
        {sponge && (
          <svg viewBox="0 0 64 48" className="pointer-events-none absolute w-16 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg" style={{ left: sponge.x, top: sponge.y }} aria-hidden>
            <rect x="4" y="8" width="56" height="34" rx="10" fill="#f5c84c" />
            <rect x="4" y="8" width="56" height="12" rx="6" fill="#3fa36b" />
            {[14, 26, 40, 50, 20, 34, 46].map((cx, i) => (
              <circle key={i} cx={cx} cy={i < 4 ? 28 : 36} r="2.4" fill="#d9a92e" />
            ))}
            <circle cx="12" cy="6" r="4" fill="#fff" opacity=".85" />
            <circle cx="52" cy="4" r="3" fill="#fff" opacity=".7" />
          </svg>
        )}
        </div>
        {[18, 42, 66, 84].map((l, i) => (
          <span key={l} className="animate-drip pointer-events-none absolute top-[30%] h-3 w-1.5 rounded-full bg-card/70" style={{ left: `${l}%`, animationDelay: `${i * 0.35}s` }} />
        ))}
      </div>
      <p className="text-center text-sm text-stage-foreground/60">Не обязательно до идеала — скидка гарантирована.</p>
    </div>
  );
}
