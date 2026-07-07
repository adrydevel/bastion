import { describe, it, expect } from "vitest";
import { cvar, valueAtRisk } from "./cvar.js";

describe("cvar", () => {
  it("is non-negative on a symmetric sample", () => {
    expect(cvar([-0.02, -0.01, 0.01, 0.02])).toBeGreaterThanOrEqual(0);
  });
  it("var tracks the worst tail", () => {
    expect(valueAtRisk([-0.05, 0.01, 0.02], 0.9)).toBeGreaterThan(0);
  });
});
