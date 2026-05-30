"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { CollageItemRecord, Entry } from "@/lib/types";
import { formatEntryTimestamp } from "@/lib/collage";
import { updateEntry } from "@/lib/entries";
import { CollagePreview } from "./CollagePreview";

interface EntryCardProps {
  entry: Entry;
  y: number;
  onDelete?: (id: string) => void;
  onUpdate?: (entry: Entry) => void;
  onItemClick?: (item: CollageItemRecord, element: HTMLElement) => void;
}

export function EntryCard({ entry, y, onDelete, onUpdate, onItemClick }: EntryCardProps) {
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
              className="w-full rounded-lg border border-blush-300 bg-blush-50/50 py-1 text-base font-medium text-blush-700 outline-none focus:border-blush-400 md:text-lg"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-left text-base font-medium text-blush-700 transition hover:text-blush-500 md:text-lg"
            >
              {entry.title ? (
                entry.title
              ) : (
                <span className="italic text-blush-400">Untitled era — click to name</span>
              )}
            </button>
          )}
          <div className="mt-2 space-y-0.5 font-mono text-[11px] text-blush-400">
            <p>Added {formatEntryTimestamp(entry.created_at)}</p>
            <p>Modified {formatEntryTimestamp(entry.updated_at)}</p>
          </div>
          {error && <p className="mt-1 font-sans text-xs text-red-600">{error}</p>}
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="shrink-0 font-sans text-xs text-blush-400 transition hover:text-blush-700"
            aria-label="Delete entry"
          >
            Remove
          </button>
        )}
      </div>

      <div className="flex justify-end">
        <CollagePreview
          items={entry.items}
          entryTitle={entry.title}
          entryDate={entry.created_at}
          onItemClick={onItemClick}
        />
      </div>
    </motion.section>
  );
}
