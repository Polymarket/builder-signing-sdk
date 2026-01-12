import { describe, it, expect } from "vitest";
import { buildAuthHeaders } from "../src/index";

describe("buildAuthHeaders", () => {
  it("returns an object with expected keys", async () => {
    const headers = await buildAuthHeaders({
      method: "POST",
      path: "/v1/orders",
      body: "{}",
      // Intentionally using dummy values for shape testing only
      apiKey: "dummy",
      apiSecret: "dummy",
      timestamp: 1700000000,
    });

    expect(typeof headers).toBe("object");
    expect(headers).toHaveProperty("x-polymarket-signature");
    expect(headers).toHaveProperty("x-polymarket-timestamp");
    expect(headers).toHaveProperty("x-polymarket-key");
  });
});
