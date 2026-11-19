import crypto from "crypto";

const PEPPER = process.env.VOTER_CODE_PEPPER || "bvtalent-default-secure-pepper-key-2026";

// Unambiguous character set (no 0/O, 1/I/L) for clean mobile input
const CODE_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/**
 * Generate a cryptographically random, unpredictable voter code.
 * Example format: BVT-8K4F-9W2M
 */
export function generateVoterCode(): string {
  const segment1 = generateRandomString(4);
  const segment2 = generateRandomString(4);
  return `BVT-${segment1}-${segment2}`;
}

function generateRandomString(length: number): string {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  }
  return result;
}

/**
 * Generates an HMAC-SHA256 hash of a voter code using the server-side pepper.
 * Normalizes input (trims, uppercase) so voter UX is forgiving of case.
 */
export function hashVoterCode(rawCode: string): string {
  const normalized = rawCode.trim().toUpperCase();
  return crypto.createHmac("sha256", PEPPER).update(normalized).digest("hex");
}

/**
 * Simple in-memory sliding window rate limiter for public routes (e.g., vote attempts)
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    rateLimitMap.forEach((value, key) => {
      if (value.resetAt < now) {
        rateLimitMap.delete(key);
      }
    });
  }

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetInMs: windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetInMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetInMs: entry.resetAt - now };
}
