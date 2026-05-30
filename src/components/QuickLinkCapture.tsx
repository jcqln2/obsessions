"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  buildCreatePayload,
  layoutDrafts,
  newClientId,
  validateLinkLabel,
  validateLinkUrl,
} from "@/lib/collage-items";
import { createEntry } from "@/lib/entries";

interface QuickLinkCaptureProps {
  open: boolean;
  onClose: () => void;
  onCreated: (entryId?: string) => void;
}

export function QuickLinkCapture({ open, onClose, onCreated }: QuickLinkCaptureProps) {
  const urlRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setUrl("");
      setLabel("");
      setError(null);
      window.setTimeout(() => urlRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSave = async () => {
    const urlError = validateLinkUrl(url);
    if (urlError) {
      setError(urlError);
      return;
    }
    const labelError = validateLinkLabel(label);
    if (labelError) {
      setError(labelError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const draft = {
        kind: "link" as const,
        url,
        label: label.trim() || undefined,
        clientId: newClientId(),
      };
      const layout = layoutDrafts([draft]);
      const entry = await createEntry({
        items: buildCreatePayload([draft], layout, []),
      });
      setUrl("");
      setLabel("");
      onCreated(entry.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save link");
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
            <h2 className="text-base font-medium text-blush-700">Quick link</h2>
            <p className="mt-1 text-sm text-blush-500">
              Save a reference — it&apos;ll get pinned to your timeline.
            </p>

            <label className="mt-4 block">
              <span className="text-[10px] font-medium uppercase tracking-wide text-blush-400">
                URL
              </span>
              <input
                ref={urlRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/item"
                className="mt-1 h-[42px] w-full rounded-lg border border-blush-300 bg-blush-100 px-3 text-sm text-blush-700 outline-none placeholder:text-blush-300 focus:border-blush-400"
              />
            </label>

            <label className="mt-3 block">
              <span className="text-[10px] font-medium uppercase tracking-wide text-blush-400">
                Label (optional)
              </span>
              <input
                type="text"
                maxLength={100}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Mid-century chair inspo"
                className="mt-1 h-[42px] w-full rounded-lg border border-blush-300 bg-blush-100 px-3 text-sm text-blush-700 outline-none placeholder:text-blush-300 focus:border-blush-400"
              />
            </label>

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
