/**
 * Optional: single successful waitlist submit (needs a real Turnstile token).
 *
 * 1. Open /login → Waitlist in a browser, complete Turnstile.
 * 2. DevTools → Network → copy turnstileToken from POST /api/waitlist body.
 * 3. Run:
 *      K6_TURNSTILE_TOKEN='...' k6 run tests/k6/waitlist-submit.js
 */
import http from "k6/http";
import { check } from "k6";
import { BASE_URL, parseJson, postWaitlist } from "./lib.js";

const token = __ENV.K6_TURNSTILE_TOKEN;

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    checks: ["rate==1.0"],
  },
};

export function setup() {
  if (!token) {
    throw new Error(
      "Set K6_TURNSTILE_TOKEN to a fresh token from the browser (expires quickly)."
    );
  }
}

export default function () {
  const email = `k6-submit-${Date.now()}@loadtest.invalid`;
  const req = postWaitlist(email, { turnstileToken: token });
  const res = http.post(req.url, req.body, { headers: req.headers, tags: req.tags });
  const body = parseJson(res);

  check(res, {
    "submit status 200": (r) => r.status === 200,
    "submit ok true": () => body?.ok === true,
    "not rate limited": (r) => r.status !== 429,
  });
}
