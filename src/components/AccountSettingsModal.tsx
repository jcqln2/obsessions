"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DELETE_CONFIRM_PHRASE } from "@/lib/account/delete-account";

interface AccountSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function AccountSettingsModal({ open, onClose }: AccountSettingsModalProps) {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const resetFeedback = () => {
    setError(null);
    setMessage(null);
  };

  const handleExport = async () => {
    resetFeedback();
    setExporting(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Export failed");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? `obsessions-export-${new Date().toISOString().slice(0, 10)}.json`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("Download started — your archive is in the JSON file.");
    } catch {
      setError("Export failed. Check your connection and try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    resetFeedback();
    if (confirmPhrase.trim().toLowerCase() !== DELETE_CONFIRM_PHRASE) {
      setError(`Type "${DELETE_CONFIRM_PHRASE}" to confirm.`);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmPhrase: confirmPhrase.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not delete account");
        return;
      }
      window.location.href = "/login";
    } catch {
      setError("Deletion failed. Check your connection and try again.");
    } finally {
      setDeleting(false);
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
            className="absolute inset-0 bg-blush-700/30 backdrop-blur-sm dark:bg-black/50"
            onClick={onClose}
            aria-label="Close"
          />
          <motion.div
            className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-blush-50 p-5 shadow-[0_4px_24px_rgba(153,53,86,0.08)] dark:bg-stone-900 dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
          >
            <h2 className="text-base font-medium text-blush-700 dark:text-stone-200">Account &amp; data</h2>
            <p className="mt-1 text-sm text-blush-500 dark:text-stone-400">
              Download your timeline or permanently delete your account and all associated data.
            </p>

            <section className="mt-5 rounded-lg border border-blush-200 bg-blush-100 p-4 dark:border-stone-700 dark:bg-stone-800/80">
              <h3 className="text-sm font-medium text-blush-700 dark:text-stone-200">Download your data</h3>
              <p className="mt-1 text-xs leading-relaxed text-blush-500 dark:text-stone-400">
                Exports all entries, notes, links, and temporary signed image URLs (valid for 7
                days).
              </p>
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting || deleting}
                className="mt-3 h-[42px] w-full rounded-lg bg-blush-400 text-sm font-medium text-blush-50 hover:bg-blush-500 disabled:opacity-50"
              >
                {exporting ? "Preparing…" : "Download JSON"}
              </button>
            </section>

            <section className="mt-4 rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Delete account</h3>
              <p className="mt-1 text-xs leading-relaxed text-red-700/90 dark:text-red-300/80">
                Permanently removes your entries, images, and login. This cannot be undone.
              </p>
              <label className="mt-3 block">
                <span className="text-[10px] font-medium uppercase tracking-wide text-red-700/80">
                  Type &quot;{DELETE_CONFIRM_PHRASE}&quot; to confirm
                </span>
                <input
                  type="text"
                  value={confirmPhrase}
                  onChange={(e) => setConfirmPhrase(e.target.value)}
                  autoComplete="off"
                  className="mt-1 h-[42px] w-full rounded-lg border border-red-200 bg-white px-3 text-sm text-blush-700 outline-none focus:border-red-400 dark:border-red-800 dark:bg-stone-950 dark:text-stone-200 dark:focus:border-red-600"
                />
              </label>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || exporting}
                className="mt-3 h-[42px] w-full rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete account permanently"}
              </button>
            </section>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {message && (
              <p className="mt-3 text-sm text-blush-700 dark:text-stone-300">{message}</p>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full text-center text-sm text-blush-500 hover:text-blush-700 dark:text-stone-400 dark:hover:text-stone-200"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
