"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Entry, ImageRecord } from "@/lib/types";
import { formatEntryTimestamp } from "@/lib/collage";
import { updateEntry } from "@/lib/entries";
import { CollagePreview } from "./CollagePreview";

interface EntryCardProps {
  entry: Entry;
  y: number;
  onDelete?: (id: string) => void;
  onUpdate?: (entry: Entry) => void;
  onImageClick?: (image: ImageRecord, element: HTMLElement) => void;
}

export function EntryCard({ entry, y, onDelete, onUpdate, onImageClick }: EntryCardProps) {
  const [title, setTitle] = useState(entry.title ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setTitle(entry.title ?? "");
  }, [entry.title, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const saveTitle = async () => {
    const trimmed = title.trim();
    const previous = entry.title ?? "";

    if (trimmed === previous) {
      setEditing(false);
      setError(null);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await updateEntry(entry.id, { title: trimmed || null });
      onUpdate?.({ ...entry, title: updated.title, updated_at: updated.updated_at });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setTitle(previous);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setTitle(entry.title ?? "");
    setEditing(false);
    setError(null);
  };

  return (
    <motion.section
      layout
      className="absolute left-4 right-16 w-full max-w-xl sm:left-auto sm:right-24 lg:right-28"
      style={{ top: y }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void saveTitle();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  cancelEdit();
                }
              }}
              disabled={saving}
              placeholder="Untitled era"
              className="w-full border-b border-ink/40 bg-transparent py-1 font-serif text-lg text-ink outline-none md:text-xl"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-left font-serif text-lg font-medium tracking-tight text-ink transition hover:text-ink/70 md:text-xl"
            >
              {entry.title ? (
                entry.title
              ) : (
                <span className="italic text-muted">Untitled era — click to name</span>
              )}
            </button>
          )}
          <div className="mt-2 space-y-0.5 font-mono text-[11px] text-muted">
            <p>Added {formatEntryTimestamp(entry.created_at)}</p>
            <p>Modified {formatEntryTimestamp(entry.updated_at)}</p>
          </div>
          {error && <p className="mt-1 font-sans text-xs text-red-600">{error}</p>}
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="shrink-0 font-sans text-xs text-muted transition hover:text-ink"
            aria-label="Delete entry"
          >
            Remove
          </button>
        )}
      </div>

      <div className="flex justify-end">
        <CollagePreview
          images={entry.images}
          entryTitle={entry.title}
          entryDate={entry.created_at}
          onImageClick={onImageClick}
        />
      </div>

      {entry.notes && (
        <p className="mt-4 max-w-lg font-sans text-sm leading-relaxed text-ink/80">
          {entry.notes}
        </p>
      )}
    </motion.section>
  );
}
