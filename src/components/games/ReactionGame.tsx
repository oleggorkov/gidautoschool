import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import raceImg from "@/assets/race.jpg";
import brandCar from "@/assets/car-autogid.png";
import grayCar from "@/assets/car-gray.png";
import brandWheel from "@/assets/wheel-autogid.png";
import grayWheel from "@/assets/wheel-gray.png";
import squeal from "@/assets/tire-squeal.mp3.asset.json";
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
  const [muted, setMuted] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => { clearTimeout(timer.current); audio.current?.pause(); }, []);

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
    if (next.length >= ATTEMPTS) timer.current = window.setTimeout(() => setPhase("done"), 2200);
  }

  function press() {
    if (light === "red") {
      clearTimeout(timer.current);
      record({ ms: null });
    } else if (light === "green") {
      if (!muted) {
        if (!audio.current) audio.current = new Audio(squeal.url);
        audio.current.currentTime = 0;
        audio.current.volume = 0.35;
        void audio.current.play().catch(() => {});
      }
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
            {best !== undefined && best <= PROMO_CONFIG.reactionBenchmarkMs ? "Быстрее игрового рекорда Автогид" : `Игровой рекорд Автогид: ${PROMO_CONFIG.reactionBenchmarkMs} мс`}
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
      <Button variant="ghost" aria-label="Поле реакции"
        onPointerDown={(e) => {
          e.preventDefault();
          press();
        }}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), press())}
        className={`reaction-stage no-select relative flex h-auto min-h-[440px] w-full whitespace-normal flex-col overflow-hidden items-center justify-center gap-6 rounded-2xl border-2 p-6 transition-colors duration-150 ${
          light === "green" ? "border-success bg-success/20" : light === "red" ? "border-destructive/50 bg-destructive/10" : "border-stage-foreground/15 bg-stage-foreground/5"
        }`}
        style={{ touchAction: "manipulation" }}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[43%]" aria-hidden>
          <div className="road-surface absolute inset-0" />
          <div className="absolute inset-x-0 bottom-[45%] border-t-2 border-dashed border-road-line/60" />
          {[{ src: grayCar, wheel: grayWheel, cls: "road-car-gray" }, { src: brandCar, wheel: brandWheel, cls: "road-car-brand" }].map(car => (
            <div key={car.cls} className={`road-car ${car.cls} ${light === "result" && last?.ms != null ? "launch" : ""}`}>
              <img src={car.src} alt="" className="car-body w-full" />
              <img src={car.wheel} alt="" className="car-wheel wheel-front" />
              <img src={car.wheel} alt="" className="car-wheel wheel-rear" />
            </div>
          ))}
        </div>
        <div className="traffic-housing absolute left-[8%] top-6 z-10 flex flex-col gap-2 rounded-lg p-3 shadow-card">
          <span className={`size-10 rounded-full transition ${light === "red" ? "bg-destructive shadow-[0_0_30px_var(--destructive)]" : "bg-destructive/20"}`} />
          <span className="traffic-yellow size-10 rounded-full opacity-20" />
          <span className={`size-10 rounded-full transition ${light === "green" ? "bg-success shadow-[0_0_30px_var(--success)]" : "bg-success/20"}`} />
        </div>
        <span key={label} className="animate-rise absolute right-4 top-10 z-10 w-[65%] max-w-sm rounded-lg bg-stage/90 px-3 py-2 text-center font-display text-lg font-semibold" aria-live="polite">{label}</span>
      </Button>
      <Button variant="ghost" size="icon" className="self-end" title={muted ? "Включить звук" : "Выключить звук"} aria-label={muted ? "Включить звук" : "Выключить звук"} onClick={() => { setMuted(!muted); audio.current?.pause(); }}>{muted ? <VolumeX /> : <Volume2 />}</Button>
    </div>
  );
}
