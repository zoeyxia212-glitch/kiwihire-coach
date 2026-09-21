import { describe, expect, it } from "vitest";
import { getSafeExternalUrl } from "./safeExternalUrl";

describe("getSafeExternalUrl", () => {
  it("accepts normal HTTP and HTTPS job links", () => {
    expect(getSafeExternalUrl("https://www.seek.co.nz/job/123"))
      .toBe("https://www.seek.co.nz/job/123");
    expect(getSafeExternalUrl("http://localhost:8080/jobs/1"))
      .toBe("http://localhost:8080/jobs/1");
  });

  it("rejects executable, incomplete, and missing links", () => {
    expect(getSafeExternalUrl("javascript:alert('unsafe')")).toBeNull();
    expect(getSafeExternalUrl("https://")).toBeNull();
    expect(getSafeExternalUrl("")).toBeNull();
    expect(getSafeExternalUrl(null)).toBeNull();
  });
});
