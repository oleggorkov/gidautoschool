import { useEffect, useId, useRef, useState } from "react";
import engineImg from "@/assets/engine.jpg";
import { Button } from "@/components/ui/button";
import { canPlacePiece, PUZZLE_PIECES, puzzlePath } from "@/lib/game-rules";
import { GameIntro, GameOutro, ProgressBar } from "./GameModal";

const ORDER = [7, 2, 10, 0, 5, 9, 3, 11, 6, 1, 8, 4];
function Piece({ id, prefix, whole = false }: { id: number; prefix: string; whole?: boolean }) {
  const x = (id % 4) * 100, y = Math.floor(id / 4) * 100;
  const clip = `${prefix}-${id}`;
  return <svg viewBox={whole ? "0 0 400 300" : `${x - 18} ${y - 18} 136 136`} className="h-full w-full" aria-hidden>
    <defs><clipPath id={clip}><path d={puzzlePath(id)} /></clipPath></defs>
    <image href={engineImg} width="400" height="300" preserveAspectRatio="none" clipPath={`url(#${clip})`} />
    <path d={puzzlePath(id)} fill="none" stroke="var(--puzzle-seam)" strokeWidth="1" />
  </svg>;
}
export function EnginePuzzleGame({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [placed, setPlaced] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ id: number; x: number; y: number } | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const prefix = useId().replace(/:/g, "");
  useEffect(() => () => clearTimeout(timer.current), []);
  function place(id: number, slot: number) {
    if (!canPlacePiece(id, slot, placed)) {
      setWrong(id);
      timer.current = window.setTimeout(() => setWrong(null), 400);
      return;
    }
    const next = [...placed, id];
    setPlaced(next); setSelected(null);
    if (next.length === PUZZLE_PIECES) timer.current = window.setTimeout(() => setPhase("done"), 1000);
  }
  function targetAt(x: number, y: number) {
    const value = document.elementFromPoint(x, y)?.closest("[data-slot]")?.getAttribute("data-slot");
    return value == null ? null : Number(value);
  }
  if (phase === "intro") return <GameIntro title="Двигатель по кусочкам" text="12 фрагментов. Один двигатель. Собери цельную картину и забери свой бонус." cta="Начать сборку" onStart={() => setPhase("play")} visual={<img src={engineImg} alt="Двигатель" className="w-full max-w-md rounded-lg" />} />;
  if (phase === "done") return <GameOutro title="Двигатель собран!" text="Все детали на своих местах. Твой следующий маршрут — к водительским правам вместе с Автогид." onClaim={onComplete}><img src={engineImg} alt="Собранная мозаика двигателя" className="w-full max-w-md rounded-lg" /></GameOutro>;
  return <div className="no-select flex flex-col gap-4">
    <ProgressBar value={placed.length / PUZZLE_PIECES * 100} label={`Собрано ${placed.length} из ${PUZZLE_PIECES}`} />
    <div className="puzzle-board relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted">
      <img src={engineImg} alt="" className="absolute inset-0 h-full w-full opacity-[0.12]" />
      {placed.map(id => <div key={id} className="pointer-events-none absolute inset-0"><Piece id={id} prefix={`${prefix}-board`} whole /></div>)}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-3">
        {Array.from({ length: PUZZLE_PIECES }, (_, id) => <Button key={id} variant="ghost" data-slot={id} aria-label={`Место фрагмента ${id + 1}`} disabled={placed.includes(id)} onClick={() => selected !== null && place(selected, id)} className={`h-full w-full rounded-none border border-puzzle-seam/30 p-0 hover:bg-accent/10 ${hover === id ? "bg-accent/15" : ""}`} />)}
      </div>
    </div>
    <div className="grid grid-cols-6 gap-1 sm:gap-2">
      {ORDER.map(id => <Button key={id} variant="ghost" aria-label={`Фрагмент ${id + 1}`} aria-pressed={selected === id} disabled={placed.includes(id)} draggable={false} className={`puzzle-piece aspect-square h-auto w-full cursor-grab p-0 [&_svg]:size-12 active:cursor-grabbing ${selected === id ? "ring-2 ring-primary" : ""} ${placed.includes(id) ? "opacity-15" : ""} ${wrong === id ? "animate-shake" : ""}`} onClick={() => setSelected(id)}
        onPointerDown={e => { if (e.button > 0) return; e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); setSelected(id); }}
        onPointerMove={e => { if (!e.currentTarget.hasPointerCapture(e.pointerId)) return; setDrag({ id, x: e.clientX, y: e.clientY }); setHover(targetAt(e.clientX, e.clientY)); }}
        onPointerUp={e => { const slot = targetAt(e.clientX, e.clientY); if (slot !== null) place(id, slot); setDrag(null); setHover(null); }}
        onPointerCancel={() => { setDrag(null); setHover(null); }}><Piece id={id} prefix={`${prefix}-tray`} /></Button>)}
    </div>
    {drag && <div className="pointer-events-none fixed z-[70] size-24 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg" style={{ left: drag.x, top: drag.y }}><Piece id={drag.id} prefix={`${prefix}-drag`} /></div>}
  </div>;
}
