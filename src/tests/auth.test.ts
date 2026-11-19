import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword, signAdminToken, verifyAdminToken } from "../lib/auth";
import { IAdminUser } from "../types";

describe("Admin Authentication & Security Tests", () => {
  it("should securely hash password with bcrypt and verify match", async () => {
    const plain = "TalentAdminSecret2026!";
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash.startsWith("$2")).toBe(true);

    const isMatch = await comparePassword(plain, hash);
    expect(isMatch).toBe(true);

    const isWrong = await comparePassword("WrongPassword!", hash);
    expect(isWrong).toBe(false);
  });

  it("should sign and verify valid admin JWT token", () => {
    const user: IAdminUser = {
      id: "admin-id-123",
      username: "chief_judge",
      role: "admin",
    };

    const token = signAdminToken(user);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);

    const verified = verifyAdminToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(user.id);
    expect(verified?.username).toBe(user.username);
    expect(verified?.role).toBe(user.role);
  });

  it("should reject invalid or tampered JWT token", () => {
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature";
    const verified = verifyAdminToken(invalidToken);
    expect(verified).toBeNull();
  });
});
