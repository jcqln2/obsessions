import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const limiters = new Map<string, Ratelimit>();

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getLimiter(
  name: string,
  limit: number,
  window: `${number} ${"s" | "m" | "h" | "d"}`
): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const key = `${name}:${limit}:${window}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `obsessions:${name}`,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

export async function rateLimit(
  identifier: string,
  name: string,
  limit: number,
  window: `${number} ${"s" | "m" | "h" | "d"}`
): Promise<RateLimitResult> {
  const limiter = getLimiter(name, limit, window);
  if (!limiter) {
    return { success: true, limit, remaining: limit, reset: Date.now() };
  }

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
}

export function tooManyRequestsResponse(result: RateLimitResult): Response {
  return new Response(JSON.stringify({ error: "Too many requests. Try again later." }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      ...rateLimitHeaders(result),
    },
  });
}
