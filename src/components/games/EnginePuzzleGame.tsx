import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Cog, Zap } from "lucide-react";
import engineImg from "@/assets/engine.jpg";
import { GameIntro, GameOutro, ProgressBar } from "./GameModal";

type PartId = "piston" | "gear" | "cover" | "plug";
const PARTS: { id: PartId; name: string; icon: ReactNode }[] = [
  { id: "cover", name: "Крышка", icon: <CoverIcon /> },
  { id: "piston", name: "Поршень", icon: <PistonIcon /> },
  { id: "gear", name: "Шестерня", icon: <Cog className="size-10" /> },
  { id: "plug", name: "Свеча", icon: <Zap className="size-10" /> },
];
// позиции мест на корпусе (в % от поля)
const SLOTS: Record<PartId, { left: string; top: string }> = {
  cover: { left: "50%", top: "16%" },
  piston: { left: "30%", top: "50%" },
  gear: { left: "16%", top: "78%" },
  plug: { left: "76%", top: "44%" },
};

export function EnginePuzzleGame({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [placed, setPlaced] = useState<PartId[]>([]);
  const [selected, setSelected] = useState<PartId | null>(null);
  const [wrong, setWrong] = useState<PartId | null>(null);
  const [drag, setDrag] = useState<{ id: PartId; x: number; y: number } | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function tryPlace(part: PartId, slot: PartId) {
    if (placed.includes(part)) return;
    if (part === slot) {
      const next = [...placed, part];
      setPlaced(next);
      setSelected(null);
      if (next.length === PARTS.length) timers.current.push(window.setTimeout(() => setPhase("done"), 1100));
    } else {
      setWrong(part);
      setSelected(null);
      timers.current.push(window.setTimeout(() => setWrong(null), 400));
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>, id: PartId) {
    if (placed.includes(id) || e.button > 0) return;
    e.preventDefault(); // без выделения текста и нативного drag
    const el = e.currentTarget;
    el.setPointerCapture?.(e.pointerId);
    const startX = e.clientX, startY = e.clientY;
    let moved = false;
    const move = (ev: PointerEvent) => {
      if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 5) return;
      moved = true;
      setDrag({ id, x: ev.clientX, y: ev.clientY });
      const over = document.elementFromPoint(ev.clientX, ev.clientY)?.closest("[data-slot]");
      setHover((over?.getAttribute("data-slot") as PartId | null) ?? null);
    };
    const cleanup = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", cleanup);
      setDrag(null);
      setHover(null);
    };
    const up = (ev: PointerEvent) => {
      cleanup();
      if (!moved) {
        setSelected((s) => (s === id ? null : id));
        return;
      }
      const target = document.elementFromPoint(ev.clientX, ev.clientY)?.closest("[data-slot]");
      const slot = target?.getAttribute("data-slot") as PartId | null;
      if (slot) tryPlace(id, slot);
      else {
        setWrong(id);
        timers.current.push(window.setTimeout(() => setWrong(null), 400));
      }
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", cleanup);
  }

  if (phase === "intro")
    return (
      <GameIntro
        title="Собери двигатель — получи скидку!"
        text="Немного автомобильной смекалки — и бонус на обучение твой. Справишься за 30 секунд?"
        cta="Начать сборку"
        onStart={() => {
          setPlaced([]);
          setPhase("play");
        }}
        visual={<img src={engineImg} alt="Двигатель и детали" width={1024} height={768} className="w-full max-w-md rounded-2xl" />}
      />
    );

  if (phase === "done")
    return (
      <GameOutro title="Двигатель собран!" text="Теперь самое время запустить новый маршрут — к водительским правам. Забирай скидку на обучение в ГИД." onClaim={onComplete}>
        <div className="animate-pop grid size-28 place-items-center rounded-full bg-accent/15 text-accent shadow-glow">
          <Cog className="animate-spin-slow size-16" />
        </div>
      </GameOutro>
    );

  const done = placed.length === PARTS.length;
  return (
    <div className="no-select flex flex-col gap-5" style={{ touchAction: "none" }}>
      <ProgressBar value={(placed.length / PARTS.length) * 100} label={`Установлено ${placed.length} из ${PARTS.length}`} />
      <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stage-foreground/10 bg-stage-muted transition ${done ? "shadow-glow" : ""}`}>
        <EngineBlock lit={done} />
        {PARTS.map((p) => {
          const isPlaced = placed.includes(p.id);
          return (
            <button
              key={p.id}
              data-slot={p.id}
              onClick={() => selected && tryPlace(selected, p.id)}
              aria-label={isPlaced ? `${p.name} установлена` : `Место для детали: ${p.name}`}
              className={`absolute grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border-2 transition sm:size-20 ${
                isPlaced ? "animate-pop border-success bg-success/20 text-stage-foreground" : selected ? "border-accent border-dashed bg-accent/10 text-accent" : "border-dashed border-stage-foreground/30 text-stage-foreground/40"
              }`}
              style={SLOTS[p.id]}
            >
              {isPlaced ? p.icon : <span className="text-[10px] font-semibold sm:text-xs">{p.name}</span>}
              {isPlaced && <Check className="absolute -right-2 -top-2 size-5 rounded-full bg-success p-0.5 text-stage" />}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {PARTS.map((p) => {
          const isPlaced = placed.includes(p.id);
          return (
            <button
              key={p.id}
              disabled={isPlaced}
              onPointerDown={(e) => onPointerDown(e, p.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelected(p.id))}
              aria-pressed={selected === p.id}
              className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs font-semibold transition sm:p-3 ${
                isPlaced ? "opacity-25" : selected === p.id ? "border-accent bg-accent/15 text-accent" : "border-stage-foreground/15 bg-stage-foreground/5 hover:bg-stage-foreground/10"
              } ${wrong === p.id ? "animate-shake border-destructive" : ""} ${drag?.id === p.id ? "opacity-40" : ""}`}
            >
              {p.icon}
              {p.name}
            </button>
          );
        })}
      </div>
      <p className="text-center text-sm text-stage-foreground/60">Перетащи деталь на её место — или нажми на деталь, а потом на место.</p>
      {drag && (
        <div className="pointer-events-none fixed z-[60] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-accent p-3 text-accent-foreground shadow-glow" style={{ left: drag.x, top: drag.y }}>
          {PARTS.find((p) => p.id === drag.id)!.icon}
        </div>
      )}
    </div>
  );
}

function EngineBlock({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 400 300" className={`absolute inset-0 h-full w-full transition ${lit ? "text-accent" : "text-stage-foreground/25"}`} fill="none" stroke="currentColor" strokeWidth="3">
      <rect x="90" y="80" width="230" height="160" rx="14" />
      <rect x="110" y="40" width="190" height="34" rx="8" strokeDasharray="6 6" />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={135 + i * 47} cy="125" r="17" />)}
      <path d="M90 200 H60 M320 140 H350 M150 240 v30 M260 240 v30" />
      <circle cx="64" cy="234" r="26" strokeDasharray="5 5" />
    </svg>
  );
}

function PistonIcon() {
  return (
    <svg viewBox="0 0 40 40" className="size-10" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="9" y="5" width="22" height="16" rx="3" />
      <path d="M9 10h22M9 14h22M20 21v8" />
      <circle cx="20" cy="32" r="4" />
    </svg>
  );
}
function CoverIcon() {
  return (
    <svg viewBox="0 0 40 40" className="size-10" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="4" y="14" width="32" height="14" rx="4" />
      <circle cx="12" cy="11" r="3" />
      <path d="M10 21h20" />
    </svg>
  );
}
