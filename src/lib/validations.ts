import { z } from "zod";

export const voteSubmissionSchema = z.object({
  voterCode: z
    .string()
    .min(3, "Voter code is required")
    .max(50, "Voter code is too long")
    .transform((val) => val.trim().toUpperCase()),
  teamId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid team identifier"),
});

export const adminLoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const teamCreateSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(60),
  slug: z.string().min(2).max(60).optional(),
  description: z.string().max(500).default(""),
  image: z.string().min(1, "Team image is required"),
  members: z.array(z.string()).optional().default([]),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export const teamUpdateSchema = teamCreateSchema.partial();

export const voterGenerateSchema = z.object({
  count: z
    .number()
    .int()
    .min(1, "Must generate at least 1 pass")
    .max(1000, "Cannot generate more than 1,000 passes at once"),
});

export const eventSettingsSchema = z.object({
  name: z.string().min(2, "Event name is required"),
  description: z.string().default(""),
  eventDate: z.string().nullable().optional(),
  showResults: z.boolean().default(true),
  showVoteCounts: z.boolean().default(true),
  showLeaderboard: z.boolean().default(true),
});
