"use client";

import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { uploadDocumentationAction } from "@/actions/documentation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INITIAL_DOCUMENTATION_UPLOAD_STATE } from "@/lib/forms/states";

const MAX_INPUT_BYTES = 10 * 1024 * 1024;
/** Setelah kompresi; di bawah batas body Vercel (4.5MB). */
const MAX_COMPRESSED_BYTES = 3.5 * 1024 * 1024;
const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 0.85;
const MAX_FILES = 50;
/** Paralel 4: cepat, tapi tidak menabrak rate-limit Drive / memory browser. */
const UPLOAD_CONCURRENCY = 4;

const ACCEPTED = "image/jpeg,image/png,image/webp";
const ACCEPTED_TYPES = new Set(ACCEPTED.split(","));

async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas tidak tersedia.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
  );
  if (!blob) throw new Error("Gagal mengompres foto.");

  const baseName = file.name.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** `lastModified` (ms) → "YYYY-MM-DD" waktu lokal. */
function formatDateInput(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Jalankan `worker` untuk tiap item dengan batas paralel. */
async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (true) {
        const i = cursor++;
        if (i >= items.length) return;
        results[i] = await worker(items[i], i);
      }
    },
  );
  await Promise.all(runners);
  return results;
}

type ItemStatus = "pending" | "uploading" | "error";

type PickedFile = {
  id: string;
  file: File;
  preview: string;
  status: ItemStatus;
  error?: string;
};

type UploadResult =
  | {
      ok: true;
      id: string;
      name: string;
      fileName?: string | null;
      webViewLink?: string | null;
    }
  | { ok: false; id: string; name: string; error: string };

export function DocumentationUploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [items, setItems] = useState<PickedFile[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [results, setResults] = useState<UploadResult[]>([]);

  // Revoke object URL saat unmount — pakai ref supaya tidak revoke tiap render.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(
    () => () => {
      itemsRef.current.forEach((i) => URL.revokeObjectURL(i.preview));
    },
    [],
  );

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setLocalError(null);
    setResults([]);

    const slots = MAX_FILES - items.length;
    if (slots <= 0) {
      setLocalError(`Maksimal ${MAX_FILES} foto per unggahan.`);
      return;
    }

    const next: PickedFile[] = [];
    const rejected: string[] = [];

    for (const f of Array.from(list)) {
      if (next.length >= slots) {
        rejected.push(`${f.name}: batas ${MAX_FILES} foto per unggahan`);
        continue;
      }
      if (!ACCEPTED_TYPES.has(f.type)) {
        rejected.push(`${f.name}: format tidak didukung`);
        continue;
      }
      if (f.size > MAX_INPUT_BYTES) {
        rejected.push(`${f.name}: lebih dari 10MB`);
        continue;
      }
      next.push({
        id: crypto.randomUUID(),
        file: f,
        preview: URL.createObjectURL(f),
        status: "pending",
      });
    }

    if (rejected.length) setLocalError(rejected.join(" · "));
    if (next.length) setItems((prev) => [...prev, ...next]);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach((i) => URL.revokeObjectURL(i.preview));
    setItems([]);
    setResults([]);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3) {
      setLocalError("Judul minimal 3 karakter.");
      return;
    }
    if (items.length === 0) {
      setLocalError("Pilih minimal satu foto.");
      return;
    }

    const targets = items.slice();
    const sharedTitle = trimmedTitle.slice(0, 120);

    setBusy(true);
    setResults([]);
    setProgress({ done: 0, total: targets.length });
    setItems((prev) =>
      prev.map((i) => ({ ...i, status: "pending", error: undefined })),
    );

    const collected: UploadResult[] = new Array(targets.length);

    await runWithConcurrency(
      targets,
      UPLOAD_CONCURRENCY,
      async (item, index): Promise<void> => {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: "uploading" } : i,
          ),
        );

        let result: UploadResult;
        try {
          const compressed = await compressImage(item.file);
          if (compressed.size > MAX_COMPRESSED_BYTES) {
            throw new Error(
              `Masih ${formatSize(compressed.size)} setelah dikompres. Coba foto dengan resolusi lebih kecil.`,
            );
          }

          const formData = new FormData();
          formData.set("title", sharedTitle);
          // Tanggal otomatis dari metadata file — tidak ada input tanggal.
          formData.set("date", formatDateInput(item.file.lastModified));
          formData.set("file", compressed);

          const state = await uploadDocumentationAction(
            INITIAL_DOCUMENTATION_UPLOAD_STATE,
            formData,
          );

          if (state.ok) {
            result = {
              ok: true,
              id: item.id,
              name: item.file.name,
              fileName: state.fileName,
              webViewLink: state.webViewLink,
            };
          } else {
            const errMsg = state.error ?? "Gagal mengunggah.";
            result = {
              ok: false,
              id: item.id,
              name: item.file.name,
              error: errMsg,
            };
            setItems((prev) =>
              prev.map((i) =>
                i.id === item.id ? { ...i, status: "error", error: errMsg } : i,
              ),
            );
          }
        } catch (err) {
          const errMsg =
            err instanceof Error ? err.message : "Foto tidak bisa diproses.";
          result = {
            ok: false,
            id: item.id,
            name: item.file.name,
            error: errMsg,
          };
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, status: "error", error: errMsg } : i,
            ),
          );
        }

        collected[index] = result;
        setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
      },
    );

    // Buang yang sukses; sisakan yang gagal untuk retry.
    const successIds = new Set(collected.filter((r) => r?.ok).map((r) => r.id));
    setItems((prev) => {
      prev.forEach((i) => {
        if (successIds.has(i.id)) URL.revokeObjectURL(i.preview);
      });
      return prev.filter((i) => !successIds.has(i.id));
    });

    setResults(collected.filter(Boolean));
    setProgress(null);
    setBusy(false);
  };

  const successCount = results.filter((r) => r.ok).length;
  const failCount = results.length - successCount;
  const uploadingCount = items.filter((i) => i.status === "uploading").length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Judul — wajib, satu untuk semua foto dalam batch ini */}
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-semibold text-text">
          Judul / Keterangan Momen <span className="text-danger">*</span>
        </label>
        <Input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={busy}
          placeholder="Contoh: Keseruan Mabar Weekend di Gor..."
        />
        <p className="text-xs text-text-muted">
          Judul ini dipakai untuk semua foto yang kamu pilih. Tanggal diambil
          otomatis dari metadata file (last modified).
        </p>
      </div>

      {/* File */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-text">
            File Foto <span className="text-danger">*</span>
          </span>
          {items.length > 0 && !busy ? (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-xs text-text-muted transition hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus semua
            </button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <label
            htmlFor="file"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center transition duration-150 ease-brand hover:border-primary/50 hover:bg-surface-hover"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-primary/10 text-primary">
              <UploadCloud className="h-6 w-6" />
            </span>
            <span className="mt-4 text-sm font-semibold text-text">
              Klik untuk memilih foto
            </span>
            <span className="mt-1 text-xs text-text-muted">
              Bisa pilih sampai {MAX_FILES} sekaligus · JPG, PNG, atau WebP ·
              maks 10MB/foto (otomatis dikompres)
            </span>
          </label>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col overflow-hidden rounded-xl border bg-surface ${
                  item.status === "error" ? "border-danger/60" : "border-border"
                }`}
              >
                <div className="relative">
                  {/* Blob preview tidak lewat optimizer Next. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    loading="lazy"
                    decoding="async"
                    className="h-28 w-full object-cover"
                  />

                  {item.status === "uploading" ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={busy}
                    aria-label={`Hapus ${item.file.name}`}
                    className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-pill bg-black/60 text-white transition hover:bg-black/80 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex flex-col gap-0.5 px-2 py-1.5">
                  <p className="truncate text-[11px] text-text-muted">
                    {item.file.name} · {formatSize(item.file.size)}
                  </p>
                  {item.status === "error" && item.error ? (
                    <p className="line-clamp-2 text-[10px] text-danger">
                      {item.error}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}

            {items.length < MAX_FILES ? (
              <label
                htmlFor="file"
                className="flex min-h-[7rem] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-4 text-center transition duration-150 ease-brand hover:border-primary/50 hover:bg-surface-hover"
              >
                <UploadCloud className="h-6 w-6 text-primary" />
                <span className="mt-2 text-xs font-semibold text-text">
                  Tambah foto
                </span>
                <span className="mt-0.5 text-[11px] text-text-muted">
                  {items.length}/{MAX_FILES}
                </span>
              </label>
            ) : null}
          </div>
        )}

        <input
          ref={inputRef}
          id="file"
          name="file"
          type="file"
          accept={ACCEPTED}
          multiple
          onChange={handleFileChange}
          disabled={busy}
          className="sr-only"
        />
      </div>

      {localError ? (
        <p role="alert" className="text-sm text-danger">
          {localError}
        </p>
      ) : null}

      {progress ? (
        <div className="flex flex-col gap-1.5">
          <p
            role="status"
            className="flex items-center text-sm text-text-muted"
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses {progress.done}/{progress.total}
            {uploadingCount > 1 ? ` · ${uploadingCount} paralel` : ""}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface">
            <div
              className="h-full bg-primary transition-[width] duration-200"
              style={{
                width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      {results.length > 0 ? (
        <ul className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 text-sm">
          {results.map((r) => (
            <li key={r.id} className="flex items-start gap-2">
              {r.ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-live" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              )}
              <span className="min-w-0 flex-1 break-words">
                <span className="font-medium text-text">{r.name}</span>
                {r.ok ? (
                  <span className="text-text-muted">
                    {" — berhasil diunggah"}
                    {r.webViewLink ? (
                      <>
                        {" · "}
                        <a
                          href={r.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          Buka di Drive
                        </a>
                      </>
                    ) : null}
                  </span>
                ) : (
                  <span className="text-danger"> — {r.error}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {successCount > 0 ? (
        <p role="status" className="text-sm text-live">
          {successCount} foto berhasil diunggah dengan judul &quot;
          {title.trim()}
          &quot; ·{" "}
          <Link href="/dokumentasi" className="underline">
            Lihat galeri
          </Link>
        </p>
      ) : null}

      {failCount > 0 ? (
        <p className="text-sm text-text-muted">
          {failCount} foto gagal. Foto yang gagal masih ada di daftar — tekan
          Unggah untuk mencoba lagi.
        </p>
      ) : null}

      <div className="mt-2 flex items-center justify-end gap-3">
        <Link
          href="/dokumentasi"
          className="px-5 py-2.5 text-sm font-semibold text-text-muted transition duration-150 ease-brand hover:text-text"
        >
          Batal
        </Link>
        <Button
          type="submit"
          disabled={busy || items.length === 0 || title.trim().length < 3}
        >
          {busy
            ? "Mengunggah..."
            : items.length > 1
              ? `Unggah ${items.length} Foto`
              : "Unggah Dokumentasi"}
        </Button>
      </div>
    </form>
  );
}
