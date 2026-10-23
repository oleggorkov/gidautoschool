import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, Gift } from "lucide-react";
import carImg from "@/assets/car.jpg";
import engineImg from "@/assets/engine.jpg";
import raceImg from "@/assets/race.jpg";
import { PROMO_CONFIG, type GameId } from "@/lib/promo/config";
import { formatRub, issueReward, type Reward } from "@/lib/promo/promo";
import { GameModal } from "./GameModal";
import { CarWashGame } from "./CarWashGame";
import { EnginePuzzleGame } from "./EnginePuzzleGame";
import { ReactionGame } from "./ReactionGame";
import { DiscountReward } from "./DiscountReward";

const GAMES: { id: GameId; title: string; text: string; time: string; cta: string; img: string; imgClass: string }[] = [
  { id: "carwash", title: "Отмой эту красотку", text: "Наведи блеск на автомобиль и забери свою скидку", time: "20 секунд", cta: "Начать мойку", img: carImg, imgClass: "sepia saturate-50 brightness-90" },
  { id: "engine", title: "Собери двигатель", text: "Проверь свою смекалку и собери автомобильный двигатель", time: "20–30 секунд", cta: "Собрать двигатель", img: engineImg, imgClass: "" },
  { id: "reaction", title: "Обгони инструктора", text: "Сможешь среагировать быстрее нашего лучшего инструктора?", time: "3 попытки", cta: "Проверить реакцию", img: raceImg, imgClass: "" },
];

export function GameSelectionSection({ reward, onReward, onChooseTariff, onApply }: { reward: Reward | null; onReward: (r: Reward) => void; onChooseTariff: () => void; onApply: () => void }) {
  const [active, setActive] = useState<GameId | null>(null);
  const [showReward, setShowReward] = useState<{ repeat: boolean } | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && setVisible(true), { threshold: 0.15 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const close = useCallback(() => {
    setActive(null);
    setShowReward(null);
    ref.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, []);

  const finish = (id: GameId, score?: number) => {
    const repeat = !!reward;
    const r = issueReward(id, score);
    onReward(r);
    setShowReward({ repeat });
  };

  const game = GAMES.find((g) => g.id === active);

  return (
    <section ref={ref} id="games" className="scroll-mt-20 px-4 py-16 sm:py-24">
      <div className={`mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-stage-gradient px-5 py-10 text-stage-foreground sm:px-10 sm:py-14 ${visible ? "animate-rise" : "opacity-0"}`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent">
              <Gift className="size-3.5" /> Игры ГИД
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">Забери свою скидку на обучение!</h2>
            <p className="mt-4 text-lg text-stage-foreground/85">3 короткие игры. Пара минут удовольствия. И скидка от {formatRub(PROMO_CONFIG.baseDiscount)} на обучение в ГИД.</p>
            <p className="mt-2 text-sm text-stage-foreground/60">Выбирай игру, проверяй себя и получай персональный бонус.</p>
          </div>
          {reward && (
            <button onClick={() => setShowReward({ repeat: true })} className="shrink-0 rounded-2xl border border-accent/50 bg-accent/10 px-5 py-3 text-left transition hover:bg-accent/20">
              <div className="text-xs text-stage-foreground/70">Твоя скидка</div>
              <div className="font-display font-bold text-accent">−{formatRub(reward.discount)} · {reward.code}</div>
            </button>
          )}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {GAMES.map((g, i) => (
            <article key={g.id} className="group flex flex-col overflow-hidden rounded-3xl border border-stage-foreground/10 bg-stage-foreground/[0.04] transition duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-glow" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={g.img} alt="" loading="lazy" width={1024} height={640} className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${g.imgClass}`} />
                <span className="absolute left-3 top-3 rounded-full bg-stage/80 px-2.5 py-1 font-display text-[11px] font-bold text-accent backdrop-blur">0{i + 1}</span>
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-[repeating-linear-gradient(90deg,var(--accent)_0_18px,transparent_18px_30px)] opacity-70" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold">{g.title}</h3>
                <p className="mt-2 flex-1 text-sm text-stage-foreground/70">{g.text}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-stage-foreground/60">
                  <Clock className="size-3.5 text-accent" /> {g.time}
                </div>
                <button onClick={() => setActive(g.id)} className="mt-4 h-11 rounded-xl bg-accent font-bold text-accent-foreground transition hover:brightness-105 active:scale-[0.98]">
                  {g.cta}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {(game || showReward) && (
        <GameModal title={showReward ? "Твоя награда" : game!.title} onClose={close}>
          {showReward && reward ? (
            <DiscountReward reward={reward} repeat={showReward.repeat} onChooseTariff={() => { setActive(null); setShowReward(null); onChooseTariff(); }} onApply={() => { setActive(null); setShowReward(null); onApply(); }} />
          ) : active === "carwash" ? (
            <CarWashGame onComplete={(s) => finish("carwash", s)} />
          ) : active === "engine" ? (
            <EnginePuzzleGame onComplete={() => finish("engine")} />
          ) : active === "reaction" ? (
            <ReactionGame onComplete={(ms) => finish("reaction", ms)} />
          ) : null}
        </GameModal>
      )}
    </section>
  );
}
