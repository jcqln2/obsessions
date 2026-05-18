export default function SetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="max-w-lg">
        <h1 className="font-serif text-2xl font-medium text-ink">Setup required</h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-muted">
          Copy <code className="text-ink">.env.example</code> to{" "}
          <code className="text-ink">.env.local</code> and add your Supabase URL and
          anon key. Then run the SQL in <code className="text-ink">supabase/migrations/</code>{" "}
          and create the <code className="text-ink">entry-images</code> storage bucket.
        </p>
        <p className="mt-4 font-sans text-sm text-muted">
          See <code className="text-ink">README.md</code> for full deploy steps.
        </p>
      </div>
    </div>
  );
}
