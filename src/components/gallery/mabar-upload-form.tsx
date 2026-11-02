"use client";

/**
 * Form unggah media "Mabar Seruu" (DESIGN.md §7.24).
 * Rekam langsung dari kamera (foto/video ≤15 detik) atau pilih file.
 * Semua media masuk sebagai `pending` — admin utama yang menyetujui.
 */
import { Camera, Loader2, RotateCcw, SwitchCamera, Upload, Video } from "lucide-react";
import { useState } from "react";

import { uploadMabarMedia } from "@/lib/media/upload-mabar-media";
import { useMediaDraft, type MediaMode } from "@/lib/media/use-media-draft";
import { cn } from "@/lib/utils/cn";
import { MABAR_VIDEO_MAX_SECONDS } from "@/lib/validators/mabar-seruu";

export type MabarSessionOption = { id: string; title: string; playedAtLabel: string };

export function MabarUploadForm({ sessions }: { sessions: MabarSessionOption[] }) {
  const [mode, setMode] = useState<MediaMode>("photo");
  const {
    draft,
    error: mediaError,
    cameraOn,
    recording,
    elapsed,
    videoRef,
    startCamera,
    stopCamera,
    switchCamera,
    resetDraft,
    capturePhoto,
    startRecording,
    stopRecording,
    pickFile,
  } = useMediaDraft(mode);
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? "");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const error = uploadError ?? mediaError;

  async function handleSubmit() {
    if (!draft) return;
    setBusy(true);
    setUploadError(null);
    setNotice(null);
    try {
      await uploadMabarMedia({ draft, sessionId, caption });
      resetDraft();
      setCaption("");
      setNotice("Momen terkirim! Menunggu persetujuan admin utama sebelum tayang.");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {(["photo", "video"] as const).map((option) => (
          <button
            key={option}
            type="button"
            disabled={recording || busy}
            onClick={() => {
              setMode(option);
              resetDraft();
              stopCamera();
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-pill px-4 py-1.5 text-sm font-semibold transition",
              mode === option
                ? "bg-primary text-on-primary"
                : "border border-border text-text-muted hover:bg-surface-hover hover:text-text",
            )}
          >
            {option === "photo" ? (
              <Camera className="h-4 w-4" aria-hidden />
            ) : (
              <Video className="h-4 w-4" aria-hidden />
            )}
            {option === "photo" ? "Foto" : `Video (maks ${MABAR_VIDEO_MAX_SECONDS} dtk)`}
          </button>
        ))}
      </div>

      <div className="relative aspect-[9/16] w-full max-w-sm overflow-hidden rounded-xl border border-border bg-background">
        {draft ? (
          draft.kind === "video" ? (
            <video
              src={draft.previewUrl}
              className="h-full w-full object-contain"
              controls
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- preview blob lokal
            <img
              src={draft.previewUrl}
              alt="Pratinjau momen"
              className="h-full w-full object-contain"
            />
          )
        ) : (
          <>
            <video
              ref={videoRef}
              className={cn("h-full w-full object-cover", !cameraOn && "hidden")}
              playsInline
              muted
            />
            {!cameraOn ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-sm text-text-muted">
                  Rekam langsung dari kamera, atau pilih file dari galeri.
                </p>
                <button
                  type="button"
                  onClick={() => void startCamera()}
                  className="inline-flex items-center gap-2 rounded-pill bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
                >
                  <Camera className="h-4 w-4" aria-hidden />
                  Buka kamera
                </button>
                <label className="cursor-pointer text-xs text-text-muted underline">
                  Unggah dari galeri
                  <input
                    type="file"
                    accept={mode === "photo" ? "image/*" : "video/*"}
                    className="sr-only"
                    onChange={(event) => void pickFile(event.target.files?.[0])}
                  />
                </label>
              </div>
            ) : null}
          </>
        )}

        {recording ? (
          <div className="absolute inset-x-3 top-3 flex items-center justify-between rounded-pill bg-background/70 px-3 py-1.5">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-danger">
              <span className="h-2 w-2 rounded-pill bg-danger" aria-hidden />
              Merekam {elapsed.toFixed(1)}s
            </span>
            <span className="text-[11px] text-text-muted">
              maks {MABAR_VIDEO_MAX_SECONDS}s
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {draft ? (
          <button
            type="button"
            onClick={() => {
              resetDraft();
              void startCamera();
            }}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Ulangi
          </button>
        ) : cameraOn ? (
          <>
            {mode === "video" ? (
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                className={cn(
                  "inline-flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold text-on-primary",
                  recording ? "bg-danger" : "bg-primary",
                )}
              >
                <Video className="h-4 w-4" aria-hidden />
                {recording ? "Stop" : "Mulai rekam"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void capturePhoto()}
                className="inline-flex items-center gap-2 rounded-pill bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
              >
                <Camera className="h-4 w-4" aria-hidden />
                Jepret
              </button>
            )}
            <button
              type="button"
              disabled={recording}
              onClick={() => {
                switchCamera();
                setTimeout(() => void startCamera(), 0);
              }}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-text-muted transition hover:bg-surface-hover hover:text-text"
            >
              <SwitchCamera className="h-4 w-4" aria-hidden />
              Ganti kamera
            </button>
            <button
              type="button"
              disabled={recording}
              onClick={stopCamera}
              className="text-sm text-text-muted underline"
            >
              Tutup kamera
            </button>
          </>
        ) : null}
      </div>

      {draft ? (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-text">Sesi mabar</span>
            <select
              value={sessionId}
              onChange={(event) => setSessionId(event.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-focus"
            >
              <option value="">Tanpa sesi</option>
              {sessions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title} · {option.playedAtLabel}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-text">Keterangan (opsional)</span>
            <input
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              maxLength={140}
              placeholder="Contoh: smash penentu Tri!"
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-subtle focus:border-primary focus:outline-none focus:shadow-focus"
            />
          </label>

          <button
            type="button"
            disabled={busy}
            onClick={() => void handleSubmit()}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="h-4 w-4" aria-hidden />
            )}
            {busy ? "Mengunggah..." : "Kirim untuk disetujui"}
          </button>
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}
      {notice ? (
        <p
          role="status"
          className="rounded-md border border-live/40 bg-live/10 px-4 py-3 text-sm text-live"
        >
          {notice}
        </p>
      ) : null}
    </div>
  );
}
