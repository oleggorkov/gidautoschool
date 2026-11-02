import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { formatRub, type Reward } from "@/lib/promo/promo";

export function DiscountReward({ reward, repeat }: { reward: Reward; repeat?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reward.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="flex flex-col items-center text-center">
      <p className="animate-rise text-stage-foreground/80">{repeat ? "Ты уже получил скидку в этой акции — вот твой промокод." : "Поздравляем! Твоя скидка на обучение в Автогид готова."}</p>
      <div className="animate-pop relative mt-6 w-full max-w-sm overflow-hidden rounded-3xl bg-accent p-7 text-accent-foreground shadow-glow">
        <div className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-card/50 to-transparent" />
        <div className="text-xs font-bold uppercase tracking-[0.2em]">Скидка на обучение</div>
        <div className="mt-2 font-display text-5xl font-black sm:text-6xl">−{formatRub(reward.discount)}</div>
        <div className="mt-2 text-sm font-medium">Применяй бонус при записи на обучение</div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-lg border-2 border-dashed border-accent-foreground/30 px-4 py-3">
          <span className="font-display text-lg font-bold tracking-wider">{reward.code}</span>
          <Button variant="secondary" size="icon" title= aria-label="Скопировать промокод" onClick={copy} className="flex items-center gap-1 rounded-lg bg-accent-foreground px-3 py-1.5 text-xs font-bold text-accent transition active:scale-95">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            
          </Button>
        </div>
        <div className="mt-3 text-xs opacity-80">Действует до {new Date(reward.expiresAt).toLocaleDateString("ru-RU")}</div>
      </div>
    </div>
  );
}
