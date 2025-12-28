import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter for AI functions
// Allows 10 requests per 10 seconds per identifier
export const aiRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/ai",
});

// Create a stricter ratelimiter for PR reviews
// Allows 5 requests per minute
export const prReviewRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/pr-review",
});
