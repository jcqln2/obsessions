/**
 * Smoke test: /login waitlist UI (Turnstile widget present when configured at build time).
 *
 * Run: k6 run tests/k6/waitlist-smoke.js
 *      BASE_URL=https://obsessions-snowy.vercel.app k6 run tests/k6/waitlist-smoke.js
 */
import http from "k6/http";
import { check } from "k6";
import { BASE_URL } from "./lib.js";

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    checks: ["rate==1.0"],
    http_req_failed: ["rate==0"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/login`, {
    tags: { name: "login_page" },
  });

  check(res, {
    "login page status 200": (r) => r.status === 200,
    "waitlist tab copy present": (r) =>
      r.body.includes("Waitlist") || r.body.includes("waitlist"),
    "join waitlist CTA present": (r) =>
      r.body.includes("Join waitlist") || r.body.includes("join waitlist"),
    // Turnstile: widget script or site key baked into Next.js bundle when env is set
    "turnstile integration present": (r) =>
      r.body.includes("challenges.cloudflare.com") ||
      r.body.includes("turnstile") ||
      r.body.includes("Turnstile"),
  });
}
