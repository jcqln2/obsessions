interface PinnedNoteProps {
  text: string;
  compact?: boolean;
}

export function PinnedNote({ text, compact = true }: PinnedNoteProps) {
  return (
    <div className="relative h-full w-full">
      <div
        className="absolute left-1/2 top-0 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blush-400 shadow-sm ring-2 ring-blush-200"
        aria-hidden
      />
      <div
        className={`flex h-full w-full flex-col rounded-sm bg-[#FAEEDA] shadow-scrap ${
          compact ? "p-2.5 pt-3" : "p-4 pt-5"
        }`}
      >
        <p
          className={`whitespace-pre-wrap font-sans text-blush-700 ${
            compact ? "line-clamp-6 text-[11px] leading-snug" : "text-sm leading-relaxed"
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
