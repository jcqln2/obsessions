"use client";

import { motion } from "framer-motion";
import type { Entry } from "@/lib/types";
import { formatEntryDate } from "@/lib/collage";
import { CollagePreview } from "./CollagePreview";

interface EntryCardProps {
  entry: Entry;
  y: number;
  onDelete?: (id: string) => void;
}

export function EntryCard({ entry, y, onDelete }: EntryCardProps) {
  return (
    <motion.section
      layout
      className="absolute left-1/2 w-full max-w-2xl -translate-x-1/2 px-6"
      style={{ top: y }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          {entry.title ? (
            <h2 className="font-serif text-2xl font-bold tracking-tight text-ink md:text-3xl">
              {entry.title}
            </h2>
          ) : (
            <h2 className="font-serif text-xl italic text-muted">Untitled era</h2>
          )}
          <p className="mt-1 font-mono text-xs text-muted">
            {formatEntryDate(entry.created_at)}
          </p>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="font-sans text-xs text-muted transition hover:text-ink"
            aria-label="Delete entry"
          >
            Remove
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <CollagePreview images={entry.images} />
      </div>

      {entry.notes && (
        <p className="mt-4 max-w-lg font-sans text-sm leading-relaxed text-ink/80">
          {entry.notes}
        </p>
      )}
    </motion.section>
  );
}
