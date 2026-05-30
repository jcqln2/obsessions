/**
 * Shared helpers for Obsessions k6 smoke tests.
 * @see docs/k6.md
 */

export const BASE_URL = __ENV.BASE_URL || "https://obsessions-snowy.vercel.app";

export function postWaitlist(email, extra = {}) {
  const payload = JSON.stringify({
    email,
    website: "",
    ...extra,
  });

  return {
    method: "POST",
    url: `${BASE_URL}/api/waitlist`,
    body: payload,
    headers: { "Content-Type": "application/json" },
    tags: { name: "waitlist_post" },
  };
}

export function parseJson(res) {
  try {
    return res.json();
  } catch {
    return null;
  }
}
