"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  buildCreatePayload,
  layoutDrafts,
  newClientId,
  validateNoteText,
} from "@/lib/collage-items";
import { createEntry } from "@/lib/entries";

interface QuickNoteCaptureProps {
  open: boolean;
  onClose: () => void;
  onCreated: (entryId?: string) => void;
}

export function QuickNoteCapture({ open, onClose, onCreated }: QuickNoteCaptureProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setText("");
      setError(null);
      window.setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSave = async () => {
    const validationError = validateNoteText(text);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const draft = { kind: "note" as const, text, clientId: newClientId() };
      const layout = layoutDrafts([draft]);
      const entry = await createEntry({
        items: buildCreatePayload([draft], layout, []),
      });
      setText("");
      onCreated(entry.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSave();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-blush-700/30 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close"
          />
          <motion.div
            className="relative z-10 w-full max-w-md rounded-xl bg-blush-50 p-5 shadow-[0_4px_24px_rgba(153,53,86,0.08)]"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            onKeyDown={handleKeyDown}
          >
            <h2 className="text-base font-medium text-blush-700">Quick note</h2>
            <p className="mt-1 text-sm text-blush-500">
              Jot it down — it&apos;ll get pinned to your timeline.
            </p>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What are you building?"
              rows={5}
              maxLength={2000}
              className="mt-4 w-full resize-none rounded-lg border border-blush-300 bg-blush-100 px-3 py-2.5 text-sm text-blush-700 outline-none placeholder:text-blush-300 focus:border-blush-400"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="h-[42px] flex-1 rounded-lg bg-blush-400 text-sm font-medium text-blush-50 hover:bg-blush-500 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Pin to timeline"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 text-sm text-blush-500 hover:text-blush-700"
              >
                Cancel
              </button>
            </div>
            <p className="mt-2 text-[10px] text-blush-300">⌘+Enter to save</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
