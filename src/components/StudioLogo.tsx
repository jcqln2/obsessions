import { LayoutGrid } from "lucide-react";

export function StudioLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-blush-400">
        <LayoutGrid className="h-[18px] w-[18px] text-blush-50" aria-hidden />
      </div>
      <h1 className="text-xl font-medium text-blush-700">Miniature Studio</h1>
    </div>
  );
}
