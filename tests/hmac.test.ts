import { describe, it, expect } from "vitest";
import { buildHmacSignature } from "../src/signing/index.js";

describe("hmac", () => {
    it("buildHmacSignature", () => {
        const signature = buildHmacSignature(
            "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
            1000000,
            "test-sign",
            "/orders",
            '{"hash": "0x123"}',
        );
        expect(signature).not.toBeNull();
        expect(signature).toBeDefined();
        expect(signature.length).toBeGreaterThan(0);
        expect(signature).toBe("ZwAdJKvoYRlEKDkNMwd5BuwNNtg93kNaR_oU2HrfVvc=");
    });
});
