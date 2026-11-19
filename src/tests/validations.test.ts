import { describe, it, expect } from "vitest";
import {
  voteSubmissionSchema,
  adminLoginSchema,
  teamCreateSchema,
  voterGenerateSchema,
  eventSettingsSchema,
} from "../lib/validations";

describe("Validation Schemas Tests", () => {
  it("should validate and normalize valid vote submission", () => {
    const valid = {
      voterCode: "  bvt-7k2m-9p4q  ",
      teamId: "507f1f77bcf86cd799439011",
    };

    const res = voteSubmissionSchema.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.voterCode).toBe("BVT-7K2M-9P4Q");
      expect(res.data.teamId).toBe("507f1f77bcf86cd799439011");
    }
  });

  it("should reject invalid teamId or empty code in vote submission", () => {
    const invalidTeam = {
      voterCode: "BVT-1234-5678",
      teamId: "not-a-valid-object-id",
    };
    expect(voteSubmissionSchema.safeParse(invalidTeam).success).toBe(false);

    const emptyCode = {
      voterCode: "",
      teamId: "507f1f77bcf86cd799439011",
    };
    expect(voteSubmissionSchema.safeParse(emptyCode).success).toBe(false);
  });

  it("should validate admin login credentials", () => {
    expect(adminLoginSchema.safeParse({ username: "ad", password: "123" }).success).toBe(false);
    expect(
      adminLoginSchema.safeParse({ username: "admin", password: "SecurePassword123!" }).success
    ).toBe(true);
  });

  it("should validate team creation with required fields", () => {
    const validTeam = {
      name: "The Groove Collective",
      image: "https://example.com/team.jpg",
      description: "Live soul performers",
      isActive: true,
      displayOrder: 1,
    };
    expect(teamCreateSchema.safeParse(validTeam).success).toBe(true);

    const missingName = {
      image: "https://example.com/team.jpg",
    };
    expect(teamCreateSchema.safeParse(missingName).success).toBe(false);
  });

  it("should enforce pass generation bounds (1 to 1000)", () => {
    expect(voterGenerateSchema.safeParse({ count: 0 }).success).toBe(false);
    expect(voterGenerateSchema.safeParse({ count: 1001 }).success).toBe(false);
    expect(voterGenerateSchema.safeParse({ count: 50 }).success).toBe(true);
  });

  it("should validate event settings updates", () => {
    const validSettings = {
      name: "BVTalent Grand Finale",
      description: "Annual talent showcase",
      showResults: true,
      showVoteCounts: false,
      showLeaderboard: true,
    };
    expect(eventSettingsSchema.safeParse(validSettings).success).toBe(true);
  });
});
