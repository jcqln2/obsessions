"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateCollageLayout } from "@/lib/collage";
import { createEntry } from "@/lib/entries";
import { loadImageDimensions, uploadEntryImages } from "@/lib/upload";
import type { LocalImageFile, ImageRecord } from "@/lib/types";
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
  const [files, setFiles] = useState<LocalImageFile[]>([]);
  const [previewImages, setPreviewImages] = useState<ImageRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const rebuildPreview = useCallback((items: LocalImageFile[]) => {
    if (items.length === 0) {
      setPreviewImages([]);
      return;
    }
    const layout = generateCollageLayout(
      items.map((f) => ({ width: f.width, height: f.height }))
    );
    const previews: ImageRecord[] = items.map((item, i) => ({
      id: `preview-${i}`,
      entry_id: "preview",
      image_url: item.previewUrl,
      storage_path: "",
      position_x: layout[i].x,
      position_y: layout[i].y,
      rotation_degrees: layout[i].rotation,
      scale_factor: layout[i].scale,
      width_px: Math.round(layout[i].width),
      height_px: Math.round(layout[i].height),
      z_index: layout[i].zIndex,
      created_at: new Date().toISOString(),
    }));
    setPreviewImages(previews);
  }, []);

  const addFiles = async (incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;

    const combined = [...files];
    for (const file of list) {
      if (combined.length >= 8) break;
      try {
        const dims = await loadImageDimensions(file);
        combined.push({ file, previewUrl: dims.previewUrl, width: dims.width, height: dims.height });
      } catch {
        /* skip bad files */
      }
    }
    setFiles(combined);
    rebuildPreview(combined);
    setError(null);
  };

  const handleSave = async () => {
    if (files.length < 1) {
      setError("Add at least one image");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const layout = generateCollageLayout(
        files.map((f) => ({ width: f.width, height: f.height }))
      );
      const uploaded = await uploadEntryImages(
        files.map((f) => f.file),
        userId
      );

      await createEntry({
        title: title.trim() || undefined,
        images: uploaded.map((up, i) => ({
          storagePath: up.storagePath,
          imageUrl: up.imageUrl,
          position_x: layout[i].x,
          position_y: layout[i].y,
          rotation_degrees: layout[i].rotation,
          scale_factor: layout[i].scale,
          width_px: Math.round(layout[i].width),
          height_px: Math.round(layout[i].height),
          z_index: layout[i].zIndex,
        })),
      });

      files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      setFiles([]);
      setPreviewImages([]);
      setTitle("");
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setPreviewImages([]);
    setTitle("");
    setError(null);
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
            className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            onClick={handleClose}
            aria-label="Close"
          />
          <motion.div
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-sm bg-canvas p-6 shadow-scrap"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="font-serif text-2xl font-bold text-ink">New obsession</h2>
            <p className="mt-1 font-sans text-sm text-muted">
              Drop 1–8 screenshots. We&apos;ll scatter them into a collage.
            </p>

            <div
              className={`mt-6 cursor-pointer border border-dashed px-4 py-10 text-center transition ${
                dragOver ? "border-ink bg-ink/5" : "border-muted/40 hover:border-muted"
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
              <p className="font-sans text-sm text-muted">
                Drag & drop images here, or click to browse
              </p>
              <p className="mt-1 font-mono text-xs text-muted/70">
                {files.length}/8 selected
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </div>

            {previewImages.length > 0 && (
              <div className="mt-6 flex justify-center overflow-hidden">
                <CollagePreview images={previewImages} />
              </div>
            )}

            <label className="mt-6 block">
              <span className="font-mono text-xs uppercase tracking-wide text-muted">
                Title (optional)
              </span>
              <input
                type="text"
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="pink techwear era"
                className="mt-2 w-full border-b border-muted/30 bg-transparent py-2 font-serif text-lg text-ink outline-none focus:border-ink"
              />
            </label>

            {error && (
              <p className="mt-4 font-sans text-sm text-red-600">{error}</p>
            )}

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || files.length < 1}
                className="flex-1 bg-ink py-3 font-sans text-sm text-canvas transition hover:bg-ink/90 disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save to timeline"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-3 font-sans text-sm text-muted transition hover:text-ink"
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
