import { describe, it, expect } from "vitest";
import { isValidDeviceId, getDeviceId } from "../lib/device";
import { hashDeviceId, checkRateLimit } from "../lib/security";
import { formatPercentage } from "../lib/utils";

describe("Device Identification and Security Tests", () => {
  it("should validate standard UUID v4 strings", () => {
    const validUUID = "e4eea8e9-d7b4-4b53-90d9-b9d9df356875";
    expect(isValidDeviceId(validUUID)).toBe(true);
  });

  it("should reject non-UUID strings", () => {
    expect(isValidDeviceId("not-a-uuid")).toBe(false);
    expect(isValidDeviceId("12345")).toBe(false);
    expect(isValidDeviceId("")).toBe(false);
    expect(isValidDeviceId(null)).toBe(false);
    expect(isValidDeviceId(undefined)).toBe(false);
  });

  it("should generate valid UUID v4 fallback string matching regex", () => {
    const fallbackUUID = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    expect(isValidDeviceId(fallbackUUID)).toBe(true);
  });

  it("should safely format percentages with edge cases", () => {
    expect(formatPercentage(50)).toBe("50.0%");
    expect(formatPercentage(0)).toBe("0.0%");
    expect(formatPercentage(NaN)).toBe("0.0%");
    // @ts-expect-error testing invalid type
    expect(formatPercentage(undefined)).toBe("0.0%");
    // @ts-expect-error testing invalid type
    expect(formatPercentage(null)).toBe("0.0%");
    expect(formatPercentage(Infinity)).toBe("0.0%");
  });

  it("should deterministically hash valid device IDs using HMAC-SHA256", () => {
    const deviceId = "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d";
    const hash1 = hashDeviceId(deviceId);
    const hash2 = hashDeviceId(deviceId);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).not.toBe(deviceId);
  });

  it("should throw error when attempting to hash an invalid device ID", () => {
    expect(() => hashDeviceId("malformed-id")).toThrow("Invalid device ID format");
  });

  it("should enforce rate limiting per device or IP", () => {
    const testKey = `test-client-${Date.now()}`;
    const limit = 5;

    for (let i = 0; i < limit; i++) {
      const res = checkRateLimit(testKey, limit, 10000);
      expect(res.allowed).toBe(true);
    }

    const exceeded = checkRateLimit(testKey, limit, 10000);
    expect(exceeded.allowed).toBe(false);
  });
});
