import { describe, it, expect } from "vitest";
import { kellyFraction, sizePosition } from "./kelly.js";

describe("kelly", () => {
  it("returns zero edge for non-positive payoff", () => {
    expect(kellyFraction(0.6, 0)).toBe(0);
  });

  it("is positive for a real edge", () => {
    expect(kellyFraction(0.6, 1.5)).toBeGreaterThan(0);
  });

  it("half-kelly stays under the cap", () => {
    expect(sizePosition(0.7, 2, 0.25)).toBeLessThanOrEqual(0.25);
  });
});
