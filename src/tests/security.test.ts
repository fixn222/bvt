import { describe, it, expect } from "vitest";
import { generateVoterCode, hashVoterCode, checkRateLimit } from "../lib/security";

describe("Security and Voter Code Tests", () => {
  it("should generate cryptographically random, non-sequential codes", () => {
    const code1 = generateVoterCode();
    const code2 = generateVoterCode();

    expect(code1).toMatch(/^BVT-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
    expect(code2).toMatch(/^BVT-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
    expect(code1).not.toBe(code2);
  });

  it("should generate unique codes in bulk without immediate collisions", () => {
    const set = new Set<string>();
    for (let i = 0; i < 500; i++) {
      const code = generateVoterCode();
      expect(set.has(code)).toBe(false);
      set.add(code);
    }
    expect(set.size).toBe(500);
  });

  it("should generate identical hash for the same code (normalized case and trim)", () => {
    const code = "BVT-4K9W-2M8X";
    const hash1 = hashVoterCode(code);
    const hash2 = hashVoterCode("  bvt-4k9w-2m8x  ");

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // sha256 hex string
  });

  it("should produce completely different hashes for different codes", () => {
    const hash1 = hashVoterCode("BVT-AAAA-BBBB");
    const hash2 = hashVoterCode("BVT-AAAA-BBBC");

    expect(hash1).not.toBe(hash2);
  });

  it("should enforce rate limiting per client", () => {
    const clientId = `test-ip-${Date.now()}`;
    const limit = 5;

    for (let i = 0; i < limit; i++) {
      const result = checkRateLimit(clientId, limit, 10000);
      expect(result.allowed).toBe(true);
    }

    // 6th attempt exceeds limit
    const exceeded = checkRateLimit(clientId, limit, 10000);
    expect(exceeded.allowed).toBe(false);
    expect(exceeded.remaining).toBe(0);
  });
});
