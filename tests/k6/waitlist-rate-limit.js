/**
 * Spam test: 10 concurrent POST /api/waitlist from one runner IP.
 *
 * Rate limit runs before Turnstile validation, so requests 6–10 should return 429
 * even without a captcha token (when Upstash is configured on the target).
 *
 * Run: k6 run tests/k6/waitlist-rate-limit.js
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";
import { BASE_URL, parseJson, postWaitlist } from "./lib.js";

const rateLimitedCount = new Counter("rate_limited_responses");

export const options = {
  scenarios: {
    concurrent_spam: {
      executor: "shared-iterations",
      vus: 10,
      iterations: 10,
      maxDuration: "30s",
    },
  },
  thresholds: {
    rate_limited_responses: ["count>=5"],
  },
};

export default function () {
  const email = `k6-load-${__VU}-${Date.now()}@loadtest.invalid`;
  const req = postWaitlist(email);
  const res = http.post(req.url, req.body, {
    headers: req.headers,
    tags: req.tags,
    responseCallback: http.expectedStatuses(400, 429),
  });

  const body = parseJson(res);
  const isRateLimited = res.status === 429;

  if (isRateLimited) {
    rateLimitedCount.add(1);
  }

  check(res, {
    got_rate_limited_or_captcha: () =>
      isRateLimited ||
      (res.status === 400 && body?.error?.includes("Captcha")) ||
      res.status === 200,
    rate_limit_error_message: () =>
      !isRateLimited ||
      (typeof body?.error === "string" && body.error.toLowerCase().includes("too many")),
  });

  sleep(0.1);
}

export function handleSummary(data) {
  const limited = data.metrics.rate_limited_responses?.values?.count ?? 0;
  const text = [
    "",
    "Waitlist rate-limit load test",
    `  Target:     ${BASE_URL}`,
    `  Concurrent: 10 POST /api/waitlist`,
    `  429 count:  ${limited} (expected >= 5 when Upstash is configured)`,
    "",
    limited >= 5
      ? "  Result: PASS — rate limiting is active."
      : "  Result: FAIL — fewer than 5× 429. Check UPSTASH_* env on Vercel and redeploy.",
    "",
  ].join("\n");
  return { stdout: text };
}
