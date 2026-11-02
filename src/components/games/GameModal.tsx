import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function GameModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-overlay/60 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="animate-pop relative flex w-full flex-col overflow-y-auto bg-stage-gradient text-stage-foreground outline-none sm:max-h-[92vh] sm:max-w-3xl sm:rounded-lg sm:shadow-card"
      >
        <div className="flex items-center justify-between gap-4 border-b border-stage-foreground/10 px-5 py-3">
          <span className="font-display text-sm tracking-wide text-stage-foreground/80">{title}</span>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Закрыть игру" className="rounded-full p-2 text-stage-foreground/80 transition hover:bg-stage-foreground/10 hover:text-stage-foreground focus-visible:ring-2 focus-visible:ring-ring">
            <X className="size-5" />
          </Button>
        </div>
        <div className="flex-1 p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

export function GameIntro({ title, text, cta, onStart, visual }: { title: string; text: string; cta: string; onStart: () => void; visual?: ReactNode }) {
  return (
    <div className="animate-rise flex flex-col items-center text-center">
      {visual}
      <h3 className="mt-6 text-2xl font-bold sm:text-3xl">{title}</h3>
      <p className="mt-3 max-w-md text-stage-foreground/75">{text}</p>
      <Button onClick={onStart} className="mt-7 h-12 rounded-xl bg-accent px-8 font-bold text-accent-foreground shadow-glow transition hover:brightness-105 active:scale-95">
        {cta}
      </Button>
    </div>
  );
}

export function GameOutro({ title, text, onClaim, children }: { title: string; text: string; onClaim: () => void; children?: ReactNode }) {
  return (
    <div className="animate-rise flex flex-col items-center text-center">
      {children}
      <h3 className="mt-6 text-2xl font-bold sm:text-3xl">{title}</h3>
      <p className="mt-3 max-w-md text-stage-foreground/75">{text}</p>
      <Button onClick={onClaim} className="mt-7 h-12 rounded-xl bg-accent px-8 font-bold text-accent-foreground shadow-glow transition hover:brightness-105 active:scale-95">
        Забрать скидку
      </Button>
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="w-full">
      <div className="mb-1.5 flex justify-between text-xs font-semibold text-stage-foreground/70">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stage-foreground/10" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
