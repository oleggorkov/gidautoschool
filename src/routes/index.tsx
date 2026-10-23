import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameSelectionSection } from "@/components/games/GameSelectionSection";
import { getSavedReward, formatRub, type Reward } from "@/lib/promo/promo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ГИД — Городской институт движения: скидка за мини-игры" },
      { name: "description", content: "Пройди одну из трёх мини-игр и получи скидку от 3 000 ₽ на обучение в автошколе ГИД." },
      { property: "og:title", content: "ГИД — забери скидку на обучение" },
      { property: "og:description", content: "Три короткие игры и гарантированная скидка на обучение вождению." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TARIFFS = [
  { name: "Стандарт", price: 45000 },
  { name: "Комфорт", price: 55000 },
  { name: "Премиум", price: 69000 },
];

function Index() {
  const [reward, setReward] = useState<Reward | null>(null);
  useEffect(() => setReward(getSavedReward()), []);
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <main className="min-h-screen overflow-x-hidden">
      <GameSelectionSection reward={reward} onReward={setReward} onChooseTariff={() => go("tariffs")} onApply={() => go("apply")} />
      <section id="tariffs" className="mx-auto max-w-6xl scroll-mt-10 px-4 py-12">
        <h2 className="text-3xl font-bold">Тарифы и цены</h2>
        {reward && <p className="mt-4 rounded-xl bg-accent/20 px-4 py-3 font-semibold">У тебя есть скидка {formatRub(reward.discount)}. Не забудь применить промокод {reward.code}!</p>}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {TARIFFS.map((t) => (
            <div key={t.name} className="rounded-2xl bg-card p-6 shadow-card">
              <h3 className="font-bold">{t.name}</h3>
              <p className="mt-2 text-2xl font-bold">{formatRub(t.price)}</p>
              {reward && <p className="text-sm text-muted-foreground">с промокодом: {formatRub(t.price - reward.discount)}</p>}
            </div>
          ))}
        </div>
      </section>
      <section id="apply" className="mx-auto max-w-xl scroll-mt-10 px-4 py-12">
        <h2 className="text-3xl font-bold">Оставить заявку</h2>
        <form className="mt-6 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); alert("Отправка заявки пока не подключена к серверу."); }}>
          <input required placeholder="Имя" className="h-11 rounded-xl border bg-card px-4" />
          <input required placeholder="Телефон" className="h-11 rounded-xl border bg-card px-4" />
          <input key={reward?.code} defaultValue={reward?.code ?? ""} placeholder="Промокод" className="h-11 rounded-xl border bg-card px-4" />
          <button className="h-12 rounded-xl bg-primary font-bold text-primary-foreground">Отправить</button>
        </form>
      </section>
    </main>
  );
}
