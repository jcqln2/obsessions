"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MAX_ITEMS_PER_ENTRY,
  buildCreatePayload,
  draftsToPreviewItems,
  layoutDrafts,
  newClientId,
  validateLinkLabel,
  validateLinkUrl,
  validateNoteText,
} from "@/lib/collage-items";
import { createEntry } from "@/lib/entries";
import { loadImageDimensions, uploadEntryImages } from "@/lib/upload";
import type { CollageItemRecord, DraftItem } from "@/lib/types";
import { CollagePreview } from "./CollagePreview";

interface CreateEntryModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  userId: string;
}

export function CreateEntryModal({
  open,
  onClose,
  onCreated,
  userId,
}: CreateEntryModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [previewItems, setPreviewItems] = useState<CollageItemRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");

  const rebuildPreview = useCallback((items: DraftItem[]) => {
    if (items.length === 0) {
      setPreviewItems([]);
      return;
    }
    const layout = layoutDrafts(items);
    setPreviewItems(draftsToPreviewItems(items, layout));
  }, []);

  const updateDrafts = (items: DraftItem[]) => {
    setDrafts(items);
    rebuildPreview(items);
  };

  const addFiles = async (incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;

    const combined = [...drafts];
    for (const file of list) {
      if (combined.length >= MAX_ITEMS_PER_ENTRY) break;
      try {
        const dims = await loadImageDimensions(file);
        combined.push({
          kind: "image",
          clientId: newClientId(),
          file,
          previewUrl: dims.previewUrl,
          width: dims.width,
          height: dims.height,
        });
      } catch {
        /* skip bad files */
      }
    }
    updateDrafts(combined);
    setError(null);
  };

  const addNote = () => {
    const noteError = validateNoteText(noteDraft);
    if (noteError) {
      setError(noteError);
      return;
    }
    if (drafts.length >= MAX_ITEMS_PER_ENTRY) {
      setError(`Maximum ${MAX_ITEMS_PER_ENTRY} items per entry`);
      return;
    }
    updateDrafts([
      ...drafts,
      { kind: "note", text: noteDraft.trim(), clientId: newClientId() },
    ]);
    setNoteDraft("");
    setError(null);
  };

  const addLink = () => {
    const urlError = validateLinkUrl(linkUrl);
    if (urlError) {
      setError(urlError);
      return;
    }
    const labelError = validateLinkLabel(linkLabel);
    if (labelError) {
      setError(labelError);
      return;
    }
    if (drafts.length >= MAX_ITEMS_PER_ENTRY) {
      setError(`Maximum ${MAX_ITEMS_PER_ENTRY} items per entry`);
      return;
    }
    updateDrafts([
      ...drafts,
      {
        kind: "link",
        url: linkUrl.trim(),
        label: linkLabel.trim() || undefined,
        clientId: newClientId(),
      },
    ]);
    setLinkUrl("");
    setLinkLabel("");
    setError(null);
  };

  const removeDraft = (clientId: string) => {
    const next = drafts.filter((d) => {
      if (d.clientId !== clientId) return true;
      if (d.kind === "image") URL.revokeObjectURL(d.previewUrl);
      return false;
    });
    updateDrafts(next);
  };

  const resetState = () => {
    drafts.forEach((d) => {
      if (d.kind === "image") URL.revokeObjectURL(d.previewUrl);
    });
    setDrafts([]);
    setPreviewItems([]);
    setTitle("");
    setNoteDraft("");
    setLinkUrl("");
    setLinkLabel("");
    setError(null);
  };

  const handleSave = async () => {
    if (drafts.length < 1) {
      setError("Add at least one image, note, or link");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const layout = layoutDrafts(drafts);
      const imageDrafts = drafts.filter((d): d is Extract<DraftItem, { kind: "image" }> => d.kind === "image");
      const uploaded = await uploadEntryImages(
        imageDrafts.map((d) => d.file),
        userId
      );

      await createEntry({
        title: title.trim() || undefined,
        items: buildCreatePayload(drafts, layout, uploaded),
      });

      resetState();
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-blush-700/30 backdrop-blur-sm"
            onClick={handleClose}
            aria-label="Close"
          />
          <motion.div
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-blush-50 p-6 shadow-[0_4px_24px_rgba(153,53,86,0.08)]"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-base font-medium text-blush-700">New collage entry</h2>
            <p className="mt-1 font-sans text-sm text-blush-500">
              Add up to {MAX_ITEMS_PER_ENTRY} images, notes, and links — scattered into a collage.
            </p>

            <div
              className={`mt-6 cursor-pointer rounded-lg border border-dashed px-4 py-8 text-center transition ${
                dragOver
                  ? "border-blush-400 bg-blush-100"
                  : "border-blush-300 bg-blush-100 hover:border-blush-400"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            >
              <p className="font-sans text-sm text-blush-500">
                Drag & drop images here, or click to browse
              </p>
              <p className="mt-1 font-mono text-xs text-blush-400">
                {drafts.length}/{MAX_ITEMS_PER_ENTRY} items
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </div>

            <div className="mt-4 space-y-3 rounded-lg border border-blush-200 bg-blush-100 p-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-blush-400">
                Add a note
              </p>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Quick thought or build note…"
                rows={2}
                maxLength={2000}
                className="w-full resize-none rounded-lg border border-blush-300 bg-blush-50 px-3 py-2 text-sm text-blush-700 outline-none placeholder:text-blush-300 focus:border-blush-400"
              />
              <button
                type="button"
                onClick={addNote}
                disabled={!noteDraft.trim() || drafts.length >= MAX_ITEMS_PER_ENTRY}
                className="rounded-lg bg-blush-400 px-3 py-1.5 text-xs font-medium text-blush-50 hover:bg-blush-500 disabled:opacity-40"
              >
                Add note
              </button>

              <p className="pt-1 text-[10px] font-medium uppercase tracking-wide text-blush-400">
                Add a link
              </p>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://…"
                className="h-[38px] w-full rounded-lg border border-blush-300 bg-blush-50 px-3 text-sm text-blush-700 outline-none placeholder:text-blush-300 focus:border-blush-400"
              />
              <input
                type="text"
                maxLength={100}
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="Label (optional)"
                className="h-[38px] w-full rounded-lg border border-blush-300 bg-blush-50 px-3 text-sm text-blush-700 outline-none placeholder:text-blush-300 focus:border-blush-400"
              />
              <button
                type="button"
                onClick={addLink}
                disabled={!linkUrl.trim() || drafts.length >= MAX_ITEMS_PER_ENTRY}
                className="rounded-lg bg-blush-400 px-3 py-1.5 text-xs font-medium text-blush-50 hover:bg-blush-500 disabled:opacity-40"
              >
                Add link
              </button>
            </div>

            {drafts.length > 0 && (
              <ul className="mt-4 space-y-1">
                {drafts.map((draft) => (
                  <li
                    key={draft.clientId}
                    className="flex items-center justify-between gap-2 text-xs text-blush-600"
                  >
                    <span className="truncate">
                      {draft.kind === "image" && "Image"}
                      {draft.kind === "note" && `Note: ${draft.text.slice(0, 40)}`}
                      {draft.kind === "link" && `Link: ${draft.label || draft.url}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDraft(draft.clientId)}
                      className="shrink-0 text-blush-400 hover:text-blush-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {previewItems.length > 0 && (
              <div className="mt-6 flex justify-center overflow-hidden">
                <CollagePreview items={previewItems} />
              </div>
            )}

            <label className="mt-6 block">
              <span className="text-[10px] font-medium uppercase tracking-wide text-blush-400">
                Title (optional)
              </span>
              <input
                type="text"
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="pink techwear era"
                className="mt-1 h-[42px] w-full rounded-lg border border-blush-300 bg-blush-100 px-3 text-sm text-blush-700 outline-none placeholder:text-blush-300 focus:border-blush-400"
              />
            </label>

            {error && <p className="mt-4 font-sans text-sm text-red-600">{error}</p>}

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || drafts.length < 1}
                className="h-[42px] flex-1 rounded-lg bg-blush-400 font-sans text-sm font-medium text-blush-50 transition hover:bg-blush-500 disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save to timeline"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-3 font-sans text-sm text-blush-500 transition hover:text-blush-700"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
