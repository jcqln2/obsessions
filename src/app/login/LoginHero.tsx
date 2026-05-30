import { Box, Home, Shirt, Sparkles } from "lucide-react";
import { StudioLogo } from "@/components/StudioLogo";

const previewTiles = [
  { bg: "bg-blush-100", icon: Home, iconColor: "text-blush-400" },
  { bg: "bg-blush-200", icon: Sparkles, iconColor: "text-blush-500" },
  { bg: "bg-[#EEEDFE]", icon: Shirt, iconColor: "text-[#7F77DD]" },
  { bg: "bg-[#FAEEDA]", icon: Box, iconColor: "text-[#BA7517]" },
] as const;

export function LoginHero() {
  return (
    <section className="border-b border-blush-200 bg-blush-100 px-6 py-5">
      <StudioLogo />

      <p className="mt-3 text-[13px] leading-relaxed text-blush-500">
        Your creative archive for dioramas, custom dolls &amp; scale builds. Save
        images, links &amp; notes — beautifully organized.
      </p>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {previewTiles.map(({ bg, icon: Icon, iconColor }) => (
          <div
            key={bg}
            className={`flex aspect-square items-center justify-center rounded-lg ${bg}`}
          >
            <Icon className={`h-4 w-4 ${iconColor}`} aria-hidden />
          </div>
        ))}
      </div>

      <p className="mt-2 text-center text-[10px] text-blush-500">
        1/6 scale rooms · Blythe outfits · Diorama inspo · Miniatures
      </p>
    </section>
  );
}
