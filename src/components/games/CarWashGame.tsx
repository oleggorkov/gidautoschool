import { useCallback, useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import carImg from "@/assets/car.jpg";
import { GameIntro, GameOutro, ProgressBar } from "./GameModal";

const DURATION = 20;

export function CarWashGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [left, setLeft] = useState(DURATION);
  const [clean, setClean] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const cleanRef = useRef(0);

  const paintDirt = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
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
  }, []);

  useEffect(() => {
    if (phase !== "play") return;
    paintDirt();
    const start = performance.now();
    const t = window.setInterval(() => {
      const remain = Math.max(0, DURATION - (performance.now() - start) / 1000);
      setLeft(Math.ceil(remain));
      if (remain <= 0) setPhase("done");
    }, 200);
    const m = window.setInterval(measure, 400);
    return () => {
      clearInterval(t);
      clearInterval(m);
    };
  }, [phase, paintDirt]);

  function measure() {
    const c = canvasRef.current;
    if (!c || !c.width) return;
    const data = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let cleared = 0, total = 0;
    for (let i = 3; i < data.length; i += 4 * 40) {
      total++;
      if ((data[i] ?? 0) < 60) cleared++;
    }
    const pct = Math.min(100, (cleared / total) * 100 * 1.15);
    cleanRef.current = pct;
    setClean(pct);
  }

  function scrub(e: React.PointerEvent<HTMLCanvasElement>) {
    if (phase !== "play") return;
    const c = canvasRef.current!;
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
        visual={<img src={carImg} alt="Грязный автомобиль" width={1280} height={720} className="w-full max-w-lg rounded-2xl opacity-90 sepia saturate-50 brightness-75" />}
      />
    );

  if (phase === "done")
    return (
      <GameOutro title="Вот это блеск!" text="Ты навёл порядок — теперь наведи порядок со своими планами и получи скидку на обучение в ГИД." onClaim={() => onComplete(cleanRef.current)}>
        <div className="relative w-full max-w-lg overflow-hidden rounded-2xl">
          <img src={carImg} alt="Чистый автомобиль" width={1280} height={720} className="w-full" />
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
      <div className="no-select relative overflow-hidden rounded-2xl" style={{ touchAction: "none" }}>
        <img src={carImg} alt="" draggable={false} width={1280} height={720} className="pointer-events-none w-full" />
        <canvas
          ref={canvasRef}
          aria-label="Грязный кузов — проведи пальцем или курсором, чтобы отмыть"
          className="absolute inset-0 h-full w-full cursor-crosshair"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            last.current = null;
            scrub(e);
          }}
          onPointerMove={scrub}
          onPointerUp={() => (last.current = null)}
          onPointerLeave={() => (last.current = null)}
        />
        {[18, 42, 66, 84].map((l, i) => (
          <span key={l} className="animate-drip pointer-events-none absolute top-4 h-3 w-1.5 rounded-full bg-card/70" style={{ left: `${l}%`, animationDelay: `${i * 0.35}s` }} />
        ))}
      </div>
      <p className="text-center text-sm text-stage-foreground/60">Не обязательно до идеала — скидка гарантирована.</p>
    </div>
  );
}
