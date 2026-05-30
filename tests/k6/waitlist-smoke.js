/**
 * Smoke test: /login waitlist UI + server-side Turnstile enforcement.
 *
 * Turnstile loads client-side (not in initial HTML), so we verify the API rejects
 * requests without a captcha token when TURNSTILE_SECRET_KEY is set on the server.
 *
 * Run: k6 run tests/k6/waitlist-smoke.js
 */
import http from "k6/http";
import { check } from "k6";
import { BASE_URL, parseJson, postWaitlist } from "./lib.js";

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    checks: ["rate==1.0"],
    http_req_failed: ["rate==0"],
  },
};

export default function () {
  const pageRes = http.get(`${BASE_URL}/login`, {
    tags: { name: "login_page" },
  });

  check(pageRes, {
    "login page status 200": (r) => r.status === 200,
    "waitlist tab copy present": (r) =>
      r.body.includes("Waitlist") || r.body.includes("waitlist"),
    "join waitlist CTA present": (r) =>
      /join the waitlist/i.test(r.body) || /join waitlist/i.test(r.body),
  });

  const email = `k6-smoke-${Date.now()}@loadtest.invalid`;
  const req = postWaitlist(email);
  const apiRes = http.post(req.url, req.body, {
    headers: req.headers,
    tags: { name: "waitlist_captcha_check" },
    // 400 = captcha required; 429 = rate limit (runner IP may already be hot from prior runs)
    responseCallback: http.expectedStatuses(400, 429),
  });
  const body = parseJson(apiRes);

  check(apiRes, {
    "security gate active (captcha or rate limit)": (r) => {
      const err = typeof body?.error === "string" ? body.error.toLowerCase() : "";
      if (r.status === 400) return err.includes("captcha");
      if (r.status === 429) return err.includes("too many");
      return false;
    },
  });
}
