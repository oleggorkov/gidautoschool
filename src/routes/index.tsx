import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameSelectionSection } from "@/components/games/GameSelectionSection";
import { getSavedReward, type Reward } from "@/lib/promo/promo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Автогид — автомобильные игры и скидка на обучение" },
      { name: "description", content: "Пройди одну из трёх мини-игр и получи скидку от 3 000 ₽ на обучение в автошколе Автогид." },
      { property: "og:title", content: "Автогид — забери скидку на обучение" },
      { property: "og:description", content: "Три короткие игры и гарантированная скидка на обучение вождению." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [reward, setReward] = useState<Reward | null>(null);
  useEffect(() => setReward(getSavedReward()), []);
  return <main className="min-h-screen"><GameSelectionSection reward={reward} onReward={setReward} /></main>;
}
