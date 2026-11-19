import { z } from "zod";

export const voteSubmissionSchema = z.object({
  deviceId: z
    .string()
    .uuid("Invalid device identifier format")
    .transform((val) => val.trim()),
  teamId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid team identifier format"),
});

export const adminLoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const teamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(100),
  description: z.string().max(500).default(""),
  image: z
    .string()
    .min(1, "Team image is required")
    .refine(
      (val) =>
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("/"),
      "Image must be a valid URL (http:// or https://) or relative path (/)"
    ),
  color: z
    .enum(["yellow", "pink", "cyan", "lime", "purple", "orange"])
    .default("yellow"),
});

export const teamUpdateSchema = teamSchema.partial();

export const eventStatusSchema = z.object({
  status: z.enum(["upcoming", "open", "closed"]),
});
