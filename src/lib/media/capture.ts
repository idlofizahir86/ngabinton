/**
 * Helper capture media di browser (client-only) — RULES.md §19.
 * Tanpa library tambahan: kamera pakai `getUserMedia`, rekam pakai
 * `MediaRecorder`, kompres foto & poster pakai `<canvas>`.
 */
import { MABAR_VIDEO_MAX_SECONDS } from "@/lib/validators/mabar-seruu";

export const MABAR_RECORD_LIMIT_MS = MABAR_VIDEO_MAX_SECONDS * 1000;

/** MIME rekaman yang didukung browser (mp4 lebih dulu agar aman di iOS). */
export function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

/** Ambil frame dari elemen `<video>` yang sedang menampilkan kamera. */
export async function capturePhotoFromVideo(
  video: HTMLVideoElement,
  maxSize = 1600,
): Promise<Blob | null> {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return null;

  const scale = Math.min(1, maxSize / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const webp = await canvasToBlob(canvas, "image/webp", 0.82);
  return webp ?? canvasToBlob(canvas, "image/jpeg", 0.85);
}

function drawScaled(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  maxSize: number,
): HTMLCanvasElement | null {
  const scale = Math.min(1, maxSize / Math.max(sourceWidth || 1, sourceHeight || 1));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round((sourceWidth || 720) * scale));
  canvas.height = Math.max(1, Math.round((sourceHeight || 1280) * scale));
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Kompres file foto pilihan pengguna (fallback tanpa kamera). */
export async function compressPhotoFile(file: File, maxSize = 1600): Promise<Blob | null> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Foto tidak bisa dibaca."));
    });
    const canvas = drawScaled(image, image.width, image.height, maxSize);
    if (!canvas) return null;
    const webp = await canvasToBlob(canvas, "image/webp", 0.82);
    return webp ?? canvasToBlob(canvas, "image/jpeg", 0.85);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Poster pembuka video: frame sekitar 0,2 detik. */
export async function createVideoPoster(blob: Blob, maxSize = 720): Promise<Blob | null> {
  const url = URL.createObjectURL(blob);
  try {
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("Video tidak bisa dibaca."));
    });
    video.currentTime = Math.min(0.2, (video.duration || 1) / 2);
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });

    const canvas = drawScaled(video, video.videoWidth, video.videoHeight, maxSize);
    if (!canvas) return null;
    return await canvasToBlob(canvas, "image/webp", 0.8);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export type VideoMeta = { width: number; height: number; duration: number };

/** Durasi & dimensi video — dipakai memvalidasi batas 15 detik. */
export async function readVideoMeta(blob: Blob): Promise<VideoMeta> {
  const url = URL.createObjectURL(blob);
  try {
    const video = document.createElement("video");
    video.src = url;
    video.preload = "metadata";
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Video tidak bisa dibaca."));
    });
    return {
      width: video.videoWidth,
      height: video.videoHeight,
      duration: Number.isFinite(video.duration) ? video.duration : 0,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
