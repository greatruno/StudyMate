import React, { useState, useRef } from "react";
import {
  FileUp,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  X,
  Loader2,
  ShieldCheck,
  HardDrive,
  Sparkles,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";

export interface QueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  ext: string;
  status: "pending" | "uploading" | "scanning" | "completed" | "failed" | "duplicate" | "cancelled";
  progress: number;
  errorMessage?: string;
  docId?: string;
  abortController?: AbortController;
}

interface DocumentUploadEngineProps {
  onUploadSuccess?: (docData: any) => void;
  className?: string;
}

const ALLOWED_EXTENSIONS = ["pdf", "docx", "pptx", "txt", "md"];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(ext: string) {
  switch (ext.toLowerCase()) {
    case "pdf":
      return <FileText className="w-5 h-5 text-rose-500" />;
    case "docx":
      return <FileText className="w-5 h-5 text-blue-500" />;
    case "pptx":
      return <Presentation className="w-5 h-5 text-amber-500" />;
    case "txt":
      return <FileCode className="w-5 h-5 text-slate-500" />;
    case "md":
      return <FileCode className="w-5 h-5 text-indigo-500" />;
    default:
      return <FileText className="w-5 h-5 text-slate-400" />;
  }
}

export default function DocumentUploadEngine({ onUploadSuccess, className = "" }: DocumentUploadEngineProps) {
  const { session, token } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeToken = token || session?.access_token;

  // Process files selected via browse or drop
  const handleFilesAdded = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newItems: QueueItem[] = [];

    for (const file of fileArray) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      let status: QueueItem["status"] = "pending";
      let errorMessage: string | undefined;

      // Validation
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        status = "failed";
        errorMessage = `Unsupported format (.${ext}). Allowed: PDF, DOCX, PPTX, TXT, MD.`;
      } else if (file.size > MAX_FILE_SIZE_BYTES) {
        status = "failed";
        errorMessage = `File size (${formatBytes(file.size)}) exceeds 25 MB limit.`;
      }

      newItems.push({
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        ext,
        status,
        progress: status === "failed" ? 0 : 0,
        errorMessage
      });
    }

    setQueue((prev) => [...prev, ...newItems]);

    // Auto-start upload for valid pending items
    newItems.forEach((item) => {
      if (item.status === "pending") {
        uploadFileItem(item);
      }
    });
  };

  const uploadFileItem = async (item: QueueItem) => {
    const abortController = new AbortController();

    setQueue((prev) =>
      prev.map((q) =>
        q.id === item.id
          ? { ...q, status: "uploading", progress: 10, abortController }
          : q
      )
    );

    try {
      // Step 1: Read File as Base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 40);
            setQueue((prev) =>
              prev.map((q) => (q.id === item.id ? { ...q, progress: 10 + percent } : q))
            );
          }
        };
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = () => reject(new Error("Failed to read file from local disk."));
        reader.readAsDataURL(item.file);
      });

      // Update progress for Virus Scan & Upload
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "scanning", progress: 65 } : q))
      );

      // Step 2: Send request to secure upload endpoint
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }

      const response = await fetch("/api/v1/documents/upload", {
        method: "POST",
        headers,
        signal: abortController.signal,
        body: JSON.stringify({
          fileName: item.name,
          base64,
          mimeType: item.file.type
        })
      });

      if (response.status === 409) {
        const errData = await response.json();
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: "duplicate",
                  progress: 100,
                  errorMessage: errData.message || "Duplicate file detected in your library."
                }
              : q
          )
        );
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: "Upload failed." }));
        throw new Error(errData.message || "Failed to upload document.");
      }

      const data = await response.json();

      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? {
                ...q,
                status: "completed",
                progress: 100,
                docId: data.document?.id
              }
            : q
        )
      );

      if (onUploadSuccess && data.document) {
        onUploadSuccess(data.document);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "cancelled", progress: 0, errorMessage: "Upload cancelled by user." } : q
          )
        );
      } else {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "failed", progress: 0, errorMessage: err.message || "Upload failed." }
              : q
          )
        );
      }
    }
  };

  const handleCancel = (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (item?.abortController) {
      item.abortController.abort();
    }
    setQueue((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "cancelled", errorMessage: "Cancelled" } : q))
    );
  };

  const handleRetry = (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (item) {
      const resetItem: QueueItem = {
        ...item,
        status: "pending",
        progress: 0,
        errorMessage: undefined
      };
      uploadFileItem(resetItem);
    }
  };

  const handleRemove = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer group ${
          isDragOver
            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01] shadow-xl shadow-indigo-500/10"
            : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.pptx,.txt,.md"
          onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
          className="hidden"
          id="production-file-input"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <FileUp className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Drag & Drop Study Documents Here
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              or click <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline underline-offset-2">Browse files</span> on your device
            </p>
          </div>

          {/* Supported Format Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            {["PDF", "DOCX", "PPTX", "TXT", "MD"].map((fmt) => (
              <span
                key={fmt}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 uppercase"
              >
                {fmt}
              </span>
            ))}
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 ml-1">
              • Up to 25 MB per file
            </span>
          </div>
        </div>
      </div>

      {/* File Queue & Progress Section */}
      {queue.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Upload Queue ({queue.length} {queue.length === 1 ? "file" : "files"})
              </h4>
            </div>
            {queue.some((q) => q.status === "completed" || q.status === "failed") && (
              <button
                type="button"
                onClick={() => setQueue((prev) => prev.filter((q) => q.status !== "completed"))}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                Clear Completed
              </button>
            )}
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {queue.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                        {getFileIcon(item.ext)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {formatBytes(item.size)} • <span className="uppercase">{item.ext}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === "uploading" && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Uploading ({item.progress}%)</span>
                        </div>
                      )}

                      {item.status === "scanning" && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                          <ShieldCheck className="w-3 h-3 animate-pulse" />
                          <span>Virus Scan & Storage</span>
                        </div>
                      )}

                      {item.status === "completed" && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Stored in Bucket</span>
                        </div>
                      )}

                      {item.status === "failed" && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-200 dark:border-rose-800">
                          <XCircle className="w-3 h-3" />
                          <span>Failed</span>
                        </div>
                      )}

                      {item.status === "duplicate" && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Duplicate</span>
                        </div>
                      )}

                      {item.status === "cancelled" && (
                        <span className="text-[10px] font-semibold text-slate-400">Cancelled</span>
                      )}

                      {/* Action buttons */}
                      {(item.status === "uploading" || item.status === "scanning") && (
                        <button
                          type="button"
                          onClick={() => handleCancel(item.id)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                          title="Cancel Upload"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {(item.status === "failed" || item.status === "cancelled") && (
                        <button
                          type="button"
                          onClick={() => handleRetry(item.id)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
                        title="Remove from queue"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(item.status === "uploading" || item.status === "scanning") && (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {item.errorMessage && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium pt-1 flex items-center gap-1">
                      <Info className="w-3 h-3 shrink-0" />
                      <span>{item.errorMessage}</span>
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
