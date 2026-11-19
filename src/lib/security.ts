import crypto from "crypto";
import { isValidDeviceId } from "./device";

const DEVICE_SECRET =
  process.env.DEVICE_HASH_SECRET || "bvtalent-party-default-device-secret-2026";

/**
 * Produces a deterministic HMAC-SHA256 hash of the browser device ID.
 * The raw device ID is never stored in the database.
 */
export function hashDeviceId(rawDeviceId: string): string {
  if (!isValidDeviceId(rawDeviceId)) {
    throw new Error("Invalid device ID format");
  }
  return crypto
    .createHmac("sha256", DEVICE_SECRET)
    .update(rawDeviceId.trim())
    .digest("hex");
}

/**
 * Sliding window rate limiter for voting requests
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  identifier: string,
  limit: number = 30,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Clean up old entries periodically
  if (rateLimitMap.size > 5000) {
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
