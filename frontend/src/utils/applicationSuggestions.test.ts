import { describe, expect, it } from "vitest";
import {
  COMPANY_SUGGESTIONS,
  LOCATION_SUGGESTIONS,
  ROLE_SUGGESTIONS,
} from "./applicationSuggestions";

describe("application suggestions", () => {
  it("has no repeated options", () => {
    for (const list of [
      COMPANY_SUGGESTIONS,
      ROLE_SUGGESTIONS,
      LOCATION_SUGGESTIONS,
    ]) {
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it("has no empty options", () => {
    for (const list of [
      COMPANY_SUGGESTIONS,
      ROLE_SUGGESTIONS,
      LOCATION_SUGGESTIONS,
    ]) {
      expect(list.every((option) => option.trim().length > 0)).toBe(true);
    }
  });
});
