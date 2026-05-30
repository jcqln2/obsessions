import { Heart, Lock, Smartphone } from "lucide-react";

const items = [
  { icon: Lock, label: "Private by default" },
  { icon: Smartphone, label: "Works on mobile" },
  { icon: Heart, label: "Made for makers" },
] as const;

export function LoginTrustBar() {
  return (
    <section className="border-t border-blush-200 bg-blush-100 px-4 py-3">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 text-[11px] text-blush-500"
          >
            <Icon className="h-[13px] w-[13px] text-blush-400" aria-hidden />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
