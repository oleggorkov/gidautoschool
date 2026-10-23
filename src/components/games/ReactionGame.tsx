import { useEffect, useRef, useState } from "react";
import raceImg from "@/assets/race.jpg";
import { PROMO_CONFIG } from "@/lib/promo/config";
import { GameIntro, GameOutro } from "./GameModal";

const ATTEMPTS = 3;
type Light = "idle" | "red" | "green" | "result";
export type Attempt = { ms: number | null }; // null = фальстарт

export function reactionMessage(ms: number | null): string {
  if (ms === null) return "Фальстарт! Не торопись, гонщик.";
  if (ms < 180) return `${ms} мс — да ты просто ракета!`;
  if (ms < 260) return `${ms} мс — отличная реакция!`;
  if (ms < 360) return `${ms} мс — инструктор уже пристегнулся.`;
  return `${ms} мс — разогрев засчитан, давай ещё!`;
}

export function ReactionGame({ onComplete }: { onComplete: (bestMs?: number) => void }) {
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [light, setLight] = useState<Light>("idle");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const greenAt = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const busy = useRef(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  function startAttempt() {
    if (busy.current) return;
    busy.current = true;
    setLight("red");
    const wait = 1500 + Math.random() * 2500;
    timer.current = window.setTimeout(() => {
      greenAt.current = performance.now();
      setLight("green");
    }, wait);
  }

  function record(a: Attempt) {
    busy.current = false;
    const next = [...attempts, a];
    setAttempts(next);
    setLight("result");
    if (next.length >= ATTEMPTS) timer.current = window.setTimeout(() => setPhase("done"), 1400);
  }

  function press() {
    if (light === "red") {
      clearTimeout(timer.current);
      record({ ms: null });
    } else if (light === "green") {
      record({ ms: Math.max(1, Math.round(performance.now() - greenAt.current)) });
    } else if (light === "idle" || (light === "result" && attempts.length < ATTEMPTS)) {
      startAttempt();
    }
  }

  const valid = attempts.map((a) => a.ms).filter((m): m is number => m !== null);
  const best = valid.length ? Math.min(...valid) : undefined;

  if (phase === "intro")
    return (
      <GameIntro
        title="Думаешь, у тебя реакция лучше инструктора?"
        text="Дождись зелёного сигнала и нажми как можно быстрее. У тебя есть 3 попытки, чтобы доказать это!"
        cta="На старт!"
        onStart={() => {
          setAttempts([]);
          setLight("idle");
          setPhase("play");
        }}
        visual={<img src={raceImg} alt="Стартовый светофор" width={1024} height={768} className="w-full max-w-md rounded-2xl" />}
      />
    );

  if (phase === "done")
    return (
      <GameOutro title="Реакция проверена!" text="За рулём важны не только быстрые реакции, но и уверенные навыки. Начни свой путь к правам вместе с ГИД." onClaim={() => onComplete(best)}>
        <div className="animate-pop rounded-2xl border border-accent/40 bg-accent/10 px-8 py-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-stage-foreground/60">Лучший результат</div>
          <div className="font-display text-4xl font-bold text-accent">{best !== undefined ? `${best} мс` : "—"}</div>
          <div className="mt-1 text-xs text-stage-foreground/60">
            {best !== undefined && best <= PROMO_CONFIG.reactionBenchmarkMs ? "Быстрее игрового рекорда ГИД" : `Игровой рекорд ГИД: ${PROMO_CONFIG.reactionBenchmarkMs} мс`}
          </div>
        </div>
      </GameOutro>
    );

  const last = attempts[attempts.length - 1];
  const label =
    light === "idle" ? "Нажми, чтобы начать попытку" : light === "red" ? "Жди зелёный…" : light === "green" ? "ЖМИ!" : attempts.length < ATTEMPTS ? `${reactionMessage(last?.ms ?? null)} Нажми для следующей попытки` : reactionMessage(last?.ms ?? null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between text-sm font-semibold text-stage-foreground/70">
        <span>Попытка {Math.min(attempts.length + (light === "result" ? 0 : 1), ATTEMPTS)} из {ATTEMPTS}</span>
        <span className="flex gap-1.5">
          {Array.from({ length: ATTEMPTS }, (_, i) => (
            <span key={i} className={`size-2.5 rounded-full ${i < attempts.length ? (attempts[i]?.ms === null ? "bg-destructive" : "bg-success") : "bg-stage-foreground/20"}`} />
          ))}
        </span>
      </div>
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          press();
        }}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), press())}
        className={`no-select flex min-h-[340px] flex-col items-center justify-center gap-6 rounded-2xl border-2 p-6 transition-colors duration-150 ${
          light === "green" ? "border-success bg-success/20" : light === "red" ? "border-destructive/50 bg-destructive/10" : "border-stage-foreground/15 bg-stage-foreground/5"
        }`}
        style={{ touchAction: "manipulation" }}
      >
        <div className="flex flex-col gap-3 rounded-3xl bg-stage p-4 shadow-card">
          <span className={`size-14 rounded-full transition ${light === "red" ? "bg-destructive shadow-[0_0_30px_var(--destructive)]" : "bg-destructive/20"}`} />
          <span className="size-14 rounded-full bg-accent/15" />
          <span className={`size-14 rounded-full transition ${light === "green" ? "bg-success shadow-[0_0_30px_var(--success)]" : "bg-success/20"}`} />
        </div>
        <span key={label} className="animate-rise max-w-sm text-center font-display text-lg font-semibold" aria-live="polite">{label}</span>
      </button>
    </div>
  );
}
