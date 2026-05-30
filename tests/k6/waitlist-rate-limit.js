/**
 * Spam test: 10 concurrent POST /api/waitlist from one runner IP.
 *
 * Rate limit runs before Turnstile validation, so requests 6–10 should return 429
 * even without a captcha token (when Upstash is configured on the target).
 *
 * Run: k6 run tests/k6/waitlist-rate-limit.js
 *
 * Optional — full success path (requires valid token from browser or test keys):
 *   K6_TURNSTILE_TOKEN=... k6 run tests/k6/waitlist-submit.js
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, parseJson, postWaitlist } from "./lib.js";

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
    "checks{got_rate_limited}": ["count>=5"],
    "checks{rate_limit_body}": ["count>=5"],
  },
};

export default function () {
  const email = `k6-load-${__VU}-${Date.now()}@loadtest.invalid`;
  const req = postWaitlist(email);
  const res = http.post(req.url, req.body, { headers: req.headers, tags: req.tags });

  const body = parseJson(res);
  const rateLimited = res.status === 429;
  const captchaRejected = res.status === 400 && body?.error?.includes("Captcha");

  check(res, {
    got_rate_limited: () => rateLimited,
    rate_limit_body: () =>
      rateLimited &&
      typeof body?.error === "string" &&
      body.error.toLowerCase().includes("too many"),
    captcha_or_ok_or_duplicate: () =>
      rateLimited || captchaRejected || res.status === 200,
  });

  if (res.headers["X-Ratelimit-Remaining"]) {
    check(res, {
      rate_limit_headers_present: () => Boolean(res.headers["X-Ratelimit-Remaining"]),
    });
  }

  sleep(0.1);
}

export function handleSummary(data) {
  const checks = data.root_group?.checks || [];
  let limited = 0;
  for (const c of checks) {
    if (c.name === "got_rate_limited" && c.passes) limited = c.passes;
  }
  const total = 10;
  const text = [
    "",
    "Waitlist rate-limit load test",
    `  Target:     ${BASE_URL}`,
    `  Concurrent: ${total} POST /api/waitlist`,
    `  429 count:  ${limited} (expected >= 5 when Upstash is configured)`,
    "",
    limited >= 5
      ? "  Result: PASS — rate limiting is active."
      : "  Result: FAIL — fewer than 5× 429. Check UPSTASH_* env on Vercel and redeploy.",
    "",
  ].join("\n");
  return { stdout: text };
}
