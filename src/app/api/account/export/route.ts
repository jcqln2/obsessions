import { NextResponse } from "next/server";
import { buildAccountExport } from "@/lib/account/build-export";
import { rateLimit, tooManyRequestsResponse } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await rateLimit(`account-export:${user.id}`, "account-export", 5, "1 h");
  if (!limit.success) {
    return tooManyRequestsResponse(limit);
  }

  try {
    const payload = await buildAccountExport(supabase, user);
    const filename = `obsessions-export-${new Date().toISOString().slice(0, 10)}.json`;
    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    console.error("[GET /api/account/export]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
