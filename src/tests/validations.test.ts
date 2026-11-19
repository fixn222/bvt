import { describe, it, expect } from "vitest";
import {
  voteSubmissionSchema,
  adminLoginSchema,
  teamSchema,
  eventStatusSchema,
  performingSchema,
} from "../lib/validations";

describe("Cartoon Validation Schemas Tests", () => {
  it("should validate and trim a valid vote submission", () => {
    const valid = {
      deviceId: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
      teamId: "507f1f77bcf86cd799439011",
    };

    const res = voteSubmissionSchema.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.deviceId).toBe("a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d");
      expect(res.data.teamId).toBe("507f1f77bcf86cd799439011");
    }
  });

  it("should reject invalid deviceId format (must be UUID)", () => {
    const invalid = {
      deviceId: "not-a-valid-uuid",
      teamId: "507f1f77bcf86cd799439011",
    };
    expect(voteSubmissionSchema.safeParse(invalid).success).toBe(false);
  });

  it("should reject invalid teamId (must be 24-char hex ObjectId)", () => {
    const invalid = {
      deviceId: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
      teamId: "short-id",
    };
    expect(voteSubmissionSchema.safeParse(invalid).success).toBe(false);
  });

  it("should validate admin login credentials", () => {
    expect(adminLoginSchema.safeParse({ username: "ad", password: "123" }).success).toBe(false);
    expect(
      adminLoginSchema.safeParse({ username: "admin", password: "AdminPassword123!" }).success
    ).toBe(true);
  });

  it("should validate team creation with required fields and theme color", () => {
    const validTeam = {
      name: "The Disco Dragons",
      description: "Funky live performers",
      image: "https://example.com/team.jpg",
      color: "yellow",
    };
    expect(teamSchema.safeParse(validTeam).success).toBe(true);

    const validLocalImage = {
      name: "The Disco Dragons",
      description: "Funky live performers",
      image: "/team.jpg",
      color: "yellow",
    };
    expect(teamSchema.safeParse(validLocalImage).success).toBe(true);

    const invalidImage = {
      name: "The Disco Dragons",
      description: "Funky live performers",
      image: "plain-text-no-url",
      color: "yellow",
    };
    expect(teamSchema.safeParse(invalidImage).success).toBe(false);
  });

  it("should validate event status transitions", () => {
    expect(eventStatusSchema.safeParse({ status: "open" }).success).toBe(true);
    expect(eventStatusSchema.safeParse({ status: "upcoming" }).success).toBe(true);
    expect(eventStatusSchema.safeParse({ status: "closed" }).success).toBe(true);
    expect(eventStatusSchema.safeParse({ status: "paused" }).success).toBe(false);
  });

  it("should validate stage performingSchema payload", () => {
    // Valid ObjectId
    expect(
      performingSchema.safeParse({
        teamId: "507f1f77bcf86cd799439011",
        lockUnperformedTeams: true,
      }).success
    ).toBe(true);

    // Null teamId (clearing stage)
    expect(
      performingSchema.safeParse({
        teamId: null,
        lockUnperformedTeams: false,
      }).success
    ).toBe(true);

    // Invalid format
    expect(
      performingSchema.safeParse({
        teamId: "not-a-valid-hex-id",
      }).success
    ).toBe(false);
  });
});
