import { describe, expect, it } from "vitest";
import { PROMO_CONFIG } from "./config";
import { computeDiscount, issueReward } from "./promo";

const memStore = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

describe("promo rules", () => {
  it("every game gives guaranteed 3000 ₽ by default", () => {
    expect(computeDiscount("carwash", 5)).toBe(3000);
    expect(computeDiscount("engine", undefined)).toBe(3000);
    expect(computeDiscount("reaction", 999)).toBe(3000);
  });

  it("bonus tiers never exceed 5000 ₽", () => {
    const cfg = { ...PROMO_CONFIG, bonusTiers: [{ discount: 9000 }] };
    expect(computeDiscount("engine", 1, cfg)).toBe(5000);
  });

  it("second issue returns the same code (no new bonus on reload)", () => {
    const s = memStore();
    const a = issueReward("carwash", 50, s);
    const b = issueReward("reaction", 150, s);
    expect(b.code).toBe(a.code);
  });

  it("code is valid for 30 days", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const r = issueReward("engine", undefined, memStore(), now);
    expect(r.expiresAt).toBe("2026-01-31T00:00:00.000Z");
  });
});
