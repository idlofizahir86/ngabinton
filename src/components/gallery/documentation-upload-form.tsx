"use client";

import Link from "next/link";
import { UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState, useActionState } from "react";

import { uploadDocumentationAction } from "@/actions/documentation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INITIAL_DOCUMENTATION_UPLOAD_STATE } from "@/lib/forms/states";

const MAX_INPUT_BYTES = 10 * 1024 * 1024;
/** Setelah kompresi; di bawah batas body Vercel (4.5MB). */
const MAX_COMPRESSED_BYTES = 3.5 * 1024 * 1024;
const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 0.85;

const ACCEPTED = "image/jpeg,image/png,image/webp";

/**
 * Kompres + resize di browser supaya payload tetap di bawah batas body
 * serverless Vercel (4.5MB), apa pun ukuran file aslinya.
 */
async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
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

export function DocumentationUploadForm() {
  const [state, formAction, isPending] = useActionState(
    uploadDocumentationAction,
    INITIAL_DOCUMENTATION_UPLOAD_STATE,
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Setelah sukses, kosongkan pilihan file supaya form siap dipakai lagi.
  useEffect(() => {
    if (!state.ok) return;
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [state.ok, state.fileName]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    const picked = event.target.files?.[0] ?? null;
    if (!picked) {
      setFile(null);
      return;
    }
    if (picked.size > MAX_INPUT_BYTES) {
      setLocalError("Ukuran foto maksimal 10MB.");
      event.target.value = "";
      setFile(null);
      return;
    }
    setFile(picked);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    const form = event.currentTarget;
    if (!file) {
      setLocalError("Pilih file foto dulu.");
      return;
    }

    const formData = new FormData(form);
    formData.delete("file");

    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      if (compressed.size > MAX_COMPRESSED_BYTES) {
        setLocalError(
          `Foto masih ${formatSize(compressed.size)} setelah dikompres. Coba foto dengan resolusi lebih kecil.`,
        );
        return;
      }
      formData.set("file", compressed);
      formAction(formData);
    } catch {
      setLocalError("Foto tidak bisa diproses di browser. Coba file JPG/PNG lain.");
    } finally {
      setCompressing(false);
    }
  };

  const busy = isPending || compressing;
  const error = localError ?? state.error;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Judul / Keterangan */}
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
          disabled={busy}
          placeholder="Contoh: Keseruan Mabar Weekend di Gor..."
        />
      </div>

      {/* Tanggal */}
      <div className="flex flex-col gap-2">
        <label htmlFor="date" className="text-sm font-semibold text-text">
          Tanggal Kegiatan
        </label>
        <Input id="date" name="date" type="date" disabled={busy} />
      </div>

      {/* Dropzone */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-text">
          File Foto <span className="text-danger">*</span>
        </span>

        {preview ? (
          <div className="relative overflow-hidden rounded-xl border border-border bg-surface">
            {/* Blob preview tidak lewat optimizer Next. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Pratinjau foto"
              className="max-h-80 w-full object-contain"
            />
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              disabled={busy}
              aria-label="Hapus pilihan foto"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-pill bg-black/60 text-white transition hover:bg-black/80 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="border-t border-border px-4 py-2 text-xs text-text-muted">
              {file?.name} · {file ? formatSize(file.size) : ""}
            </p>
          </div>
        ) : (
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
              JPG, PNG, atau WebP · maks 10MB (otomatis dikompres)
            </span>
          </label>
        )}

        <input
          ref={inputRef}
          id="file"
          name="file"
          type="file"
          accept={ACCEPTED}
          onChange={handleFileChange}
          disabled={busy}
          className="sr-only"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      {state.ok ? (
        <p role="status" className="text-sm text-live">
          Berhasil diunggah: {state.fileName}
          {state.webViewLink ? (
            <>
              {" · "}
              <a
                href={state.webViewLink}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Buka di Drive
              </a>
            </>
          ) : null}
          {" · "}
          <Link href="/dokumentasi" className="underline">
            Lihat galeri
          </Link>
        </p>
      ) : null}

      <div className="mt-2 flex items-center justify-end gap-3">
        <Link
          href="/dokumentasi"
          className="px-5 py-2.5 text-sm font-semibold text-text-muted transition duration-150 ease-brand hover:text-text"
        >
          Batal
        </Link>
        <Button type="submit" disabled={busy || !file}>
          {busy ? "Mengunggah..." : "Unggah Dokumentasi"}
        </Button>
      </div>
    </form>
  );
}
