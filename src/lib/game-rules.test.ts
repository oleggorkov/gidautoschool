import { describe, expect, it } from "vitest";
import { canPlacePiece, PUZZLE_PIECES, WASH_BRUSH_RADIUS, WASH_BRUSH_STRENGTH, WASH_DURATION_SECONDS } from "./game-rules";

describe("requested game rules", () => {
  it("gives exactly 20 seconds to wash the car", () => {
    expect(WASH_DURATION_SECONDS).toBe(20);
  });
  it("requires more scrubbing than the original large strong brush", () => {
    expect(WASH_BRUSH_RADIUS).toBeLessThan(42);
    expect(WASH_BRUSH_STRENGTH).toBeLessThan(0.9);
  });
  it("contains 10–15 mosaic pieces", () => {
    expect(PUZZLE_PIECES).toBeGreaterThanOrEqual(10);
    expect(PUZZLE_PIECES).toBeLessThanOrEqual(15);
  });
  it("only accepts a matching unplaced piece", () => {
    expect(canPlacePiece(2, 2, [])).toBe(true);
    expect(canPlacePiece(2, 3, [])).toBe(false);
    expect(canPlacePiece(2, 2, [2])).toBe(false);
    expect(canPlacePiece(12, 12, [])).toBe(false);
  });
});