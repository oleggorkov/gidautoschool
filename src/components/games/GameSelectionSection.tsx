import { useCallback, useRef, useState } from "react";
import { ArrowUpRight, Clock, Gift } from "lucide-react";
import carImg from "@/assets/car-autogid.png";
import engineImg from "@/assets/engine.jpg";
import raceImg from "@/assets/race.jpg";
import logo from "@/assets/autogid-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { PROMO_CONFIG, type GameId } from "@/lib/promo/config";
import { formatRub, issueReward, type Reward } from "@/lib/promo/promo";
import { GameModal } from "./GameModal";
import { CarWashGame } from "./CarWashGame";
import { EnginePuzzleGame } from "./EnginePuzzleGame";
import { ReactionGame } from "./ReactionGame";
import { DiscountReward } from "./DiscountReward";

const GAMES = [
  { id: "carwash" as const, title: "Отмой эту красотку", text: "Дорожная пыль, брызги и немного твоего терпения", time: "35 секунд", cta: "Начать мойку", img: carImg },
  { id: "engine" as const, title: "Собери двигатель", text: "Соедини 12 фрагментов в один работающий замысел", time: "12 фрагментов", cta: "Собрать двигатель", img: engineImg },
  { id: "reaction" as const, title: "Обгони инструктора", text: "Зелёный свет. Быстрый старт. Всё решает реакция", time: "3 попытки", cta: "Проверить реакцию", img: raceImg },
];
export function GameSelectionSection({ reward, onReward }: { reward: Reward | null; onReward: (r: Reward) => void }) {
  const [active, setActive] = useState<GameId | null>(null);
  const [showReward, setShowReward] = useState<{ repeat: boolean } | null>(null);
  const ref = useRef<HTMLElement>(null);
  const close = useCallback(() => { setActive(null); setShowReward(null); }, []);
  const finish = (id: GameId, score?: number) => { onReward(issueReward(id, score)); setShowReward({ repeat: !!reward }); };
  const game = GAMES.find(g => g.id === active);
  return <section ref={ref} id="games" className="min-h-screen bg-background text-foreground">
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 border-b border-border px-5 py-3 sm:px-8">
      <img src={logo.url} alt="Автошкола Автогид — твой путь к уверенности" className="h-16 w-48 object-cover sm:h-20 sm:w-60" />
      <span className="text-right text-xs font-semibold text-muted-foreground">Твой путь<br />к уверенности</span>
    </header>
    <div className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-3xl">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Gift className="size-4" /> Игры Автогид</span>
          <h1 className="mt-4 text-3xl font-extrabold uppercase leading-tight sm:text-5xl">Играй. Побеждай.<br /><span className="text-primary">Забирай скидку.</span></h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground">Три автомобильных испытания и скидка от {formatRub(PROMO_CONFIG.baseDiscount)} на обучение в Автогид.</p>
        </div>
        {reward && <Button variant="outline" className="h-auto flex-col items-start py-3" onClick={() => setShowReward({ repeat: true })}><span className="text-xs">Твоя скидка</span><span className="text-primary">−{formatRub(reward.discount)} · {reward.code}</span></Button>}
      </div>
      <div className="mt-9 grid gap-5 md:grid-cols-3">
        {GAMES.map((g, i) => <article key={g.id} className="group flex flex-col overflow-hidden rounded-lg border border-border bg-muted transition hover:border-primary/40">
          <div className={`relative aspect-[16/10] overflow-hidden ${g.id === "carwash" ? "bg-card" : ""}`}>
            <img src={g.img} alt={g.title} className={`h-full w-full transition duration-500 group-hover:scale-105 ${g.id === "carwash" ? "object-contain p-4" : "object-cover"}`} />
            <span className="absolute left-3 top-3 font-display text-sm font-bold text-primary">0{i + 1}</span>
          </div>
          <div className="flex flex-1 flex-col p-5"><h2 className="text-xl font-bold">{g.title}</h2><p className="mt-2 flex-1 text-sm text-muted-foreground">{g.text}</p><div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><Clock className="size-3.5" />{g.time}</div><Button onClick={() => setActive(g.id)} className="mt-4 h-11 w-full justify-between font-bold">{g.cta}<ArrowUpRight /></Button></div>
        </article>)}
      </div>
    </div>
    {(game || showReward) && <GameModal title={showReward ? "Твоя награда" : game?.title ?? "Игра"} onClose={close}>
      {showReward && reward ? <DiscountReward reward={reward} repeat={showReward.repeat} /> : active === "carwash" ? <CarWashGame onComplete={s => finish("carwash", s)} /> : active === "engine" ? <EnginePuzzleGame onComplete={() => finish("engine")} /> : active === "reaction" ? <ReactionGame onComplete={ms => finish("reaction", ms)} /> : null}
    </GameModal>}
  </section>;
}
