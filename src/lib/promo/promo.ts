import { PROMO_CONFIG, type GameId, type PromoConfig } from "./config";

export interface Reward {
  campaignId: string;
  code: string;
  discount: number;
  gameId: GameId;
  issuedAt: string;
  expiresAt: string;
}

/** Размер скидки определяется только здесь. */
export function computeDiscount(gameId: GameId, score: number | undefined, config: PromoConfig = PROMO_CONFIG): number {
  let d = config.baseDiscount;
  for (const t of config.bonusTiers) {
    if (t.gameId && t.gameId !== gameId) continue;
    if (t.minScore !== undefined && (score === undefined || score < t.minScore)) continue;
    if (t.maxReactionMs !== undefined && (score === undefined || score > t.maxReactionMs)) continue;
    d = Math.max(d, t.discount);
  }
  return Math.min(d, config.maxDiscount);
}

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function generateCode(prefix = PROMO_CONFIG.codePrefix): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `${prefix}-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

type Store = Pick<Storage, "getItem" | "setItem">;
const storage = (): Store | null => (typeof window === "undefined" ? null : window.localStorage);

export function getSavedReward(store: Store | null = storage(), config: PromoConfig = PROMO_CONFIG): Reward | null {
  try {
    const raw = store?.getItem(config.storageKey);
    if (!raw) return null;
    const r = JSON.parse(raw) as Reward;
    return r.campaignId === config.campaignId ? r : null;
  } catch {
    return null;
  }
}

/**
 * Клиентская выдача. Повторно возвращает уже выданный код.
 * ВАЖНО: localStorage не защищает от повторного получения — для боевой акции
 * замените на серверную генерацию и проверку кода (та же сигнатура, но async).
 */
export function issueReward(
  gameId: GameId,
  score?: number,
  store: Store | null = storage(),
  now = new Date(),
  config: PromoConfig = PROMO_CONFIG,
): Reward {
  const existing = getSavedReward(store, config);
  if (existing) return existing;
  const expires = new Date(now.getTime() + config.validDays * 86400000);
  const reward: Reward = {
    campaignId: config.campaignId,
    code: generateCode(config.codePrefix),
    discount: computeDiscount(gameId, score, config),
    gameId,
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
  store?.setItem(config.storageKey, JSON.stringify(reward));
  return reward;
}

export const formatRub = (n: number) => `${n.toLocaleString("ru-RU").replace(/\u00a0/g, " ")} ₽`;
