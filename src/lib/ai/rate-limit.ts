import { AI_LIMITS } from "@/lib/ai/limits";

type Bucket = {
  count: number;
  windowStart: number;
};

const buckets = new Map<string, Bucket>();

function getBucket(key: string): Bucket {
  const existing = buckets.get(key);
  const now = Date.now();

  if (
    !existing ||
    now - existing.windowStart >= AI_LIMITS.rateLimitWindowMs
  ) {
    const fresh = { count: 0, windowStart: now };
    buckets.set(key, fresh);
    return fresh;
  }

  return existing;
}

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSec: number };

export function checkAiRateLimit(
  userId: string,
  action: "agent" | "revise"
): RateLimitResult {
  const max =
    action === "agent"
      ? AI_LIMITS.agentRequestsPerHour
      : AI_LIMITS.reviseRequestsPerHour;

  const bucket = getBucket(`${action}:${userId}`);
  const now = Date.now();

  if (now - bucket.windowStart >= AI_LIMITS.rateLimitWindowMs) {
    bucket.count = 0;
    bucket.windowStart = now;
  }

  if (bucket.count >= max) {
    const retryAfterMs =
      AI_LIMITS.rateLimitWindowMs - (now - bucket.windowStart);
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1_000)),
    };
  }

  bucket.count += 1;

  return {
    allowed: true,
    remaining: max - bucket.count,
  };
}
