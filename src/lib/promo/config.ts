/**
 * Настройки акции «Забери свою скидку». Меняйте значения здесь — игры их не дублируют.
 */
export type GameId = "carwash" | "engine" | "reaction";

export interface BonusTier {
  /** Если указано — уровень действует только для этой игры */
  gameId?: GameId;
  /** Минимальный игровой результат (для мойки — % очистки, для реакции — НЕ используйте, там меньше = лучше) */
  minScore?: number;
  /** Максимальное время реакции в мс (только для игры «Обгони инструктора») */
  maxReactionMs?: number;
  discount: number;
}

export const PROMO_CONFIG = {
  campaignId: "gid-games-2026",
  /** Гарантированная скидка за прохождение любой игры, ₽ */
  baseDiscount: 3000,
  /** Верхняя граница скидки, ₽ */
  maxDiscount: 5000,
  /** Дополнительные уровни до maxDiscount. Пусто — пока правила акции не утверждены. */
  bonusTiers: [] as BonusTier[],
  /** Срок действия промокода, дней */
  validDays: 30,
  codePrefix: "GID",
  storageKey: "gid-promo-v1",
  /** Игровой ориентир для реакции (не результат реального инструктора) */
  reactionBenchmarkMs: 250,
};

export type PromoConfig = typeof PROMO_CONFIG;
