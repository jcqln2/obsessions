import { describe, expect, it, vi, afterEach } from "vitest";
import { POST } from "./route";

describe("POST /api/waitlist", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects invalid email", async () => {
    const res = await POST(
      new Request("http://localhost/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "not-an-email" }),
      })
    );
    expect(res.status).toBe(400);
  });

  it("accepts honeypot silently", async () => {
    const res = await POST(
      new Request("http://localhost/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "bot@example.com", website: "http://spam" }),
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });
});
