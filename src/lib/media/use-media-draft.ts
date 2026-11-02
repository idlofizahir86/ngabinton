"use client";

/**
 * State & aksi capture media Mabar Seruu (kamera, rekam 15 detik, kompres foto).
 * Dipisah dari komponen form agar tiap file tetap ≤ 300 baris (AGENTS.md §3.2).
 */
import { useCallback, useEffect, useRef, useState } from "react";

import {
  capturePhotoFromVideo,
  compressPhotoFile,
  createVideoPoster,
  pickRecorderMimeType,
  readVideoMeta,
} from "@/lib/media/capture";
import { MABAR_VIDEO_MAX_SECONDS } from "@/lib/validators/mabar-seruu";

export type MediaMode = "photo" | "video";

export type MediaDraft = {
  kind: MediaMode;
  blob: Blob;
  mimeType: string;
  posterBlob: Blob | null;
  previewUrl: string;
  width: number;
  height: number;
  durationSeconds: number | null;
};

export function useMediaDraft(mode: MediaMode) {
  const [draft, setDraft] = useState<MediaDraft | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
    setRecording(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: mode === "video",
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraOn(true);
    } catch {
      setError(
        "Kamera tidak bisa dibuka. Izinkan akses kamera, atau unggah file dari galeri.",
      );
    }
  }, [facing, mode]);

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacing((value) => (value === "environment" ? "user" : "environment"));
  }, [stopCamera]);

  const resetDraft = useCallback(() => {
    setDraft((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
    setError(null);
  }, []);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    const blob = await capturePhotoFromVideo(video);
    if (!blob) {
      setError("Gagal mengambil foto. Coba lagi.");
      return;
    }
    stopCamera();
    setDraft({
      kind: "photo",
      blob,
      mimeType: blob.type,
      posterBlob: null,
      previewUrl: URL.createObjectURL(blob),
      width: 0,
      height: 0,
      durationSeconds: null,
    });
  }, [stopCamera]);

  const stopRecording = useCallback(() => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setRecording(false);
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || typeof MediaRecorder === "undefined") {
      setError("Browser ini belum mendukung rekam video di halaman. Unggah file dari galeri.");
      return;
    }
    const mimeType = pickRecorderMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = async () => {
      const type = recorder.mimeType || "video/webm";
      const blob = new Blob(chunksRef.current, { type });
      const meta = await readVideoMeta(blob);
      const poster = await createVideoPoster(blob);
      stopCamera();
      setDraft({
        kind: "video",
        blob,
        mimeType: type,
        posterBlob: poster,
        previewUrl: URL.createObjectURL(blob),
        width: meta.width,
        height: meta.height,
        durationSeconds: meta.duration,
      });
    };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
    setElapsed(0);
    const startedAt = Date.now();
    tickRef.current = window.setInterval(() => {
      const seconds = (Date.now() - startedAt) / 1000;
      setElapsed(seconds);
      if (seconds >= MABAR_VIDEO_MAX_SECONDS) stopRecording();
    }, 100);
  }, [stopCamera, stopRecording]);

  const pickFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    setError(null);

    if (mode === "photo") {
      const blob = await compressPhotoFile(file);
      if (!blob) {
        setError("Foto tidak bisa diproses. Coba file lain.");
        return;
      }
      setDraft({
        kind: "photo",
        blob,
        mimeType: blob.type,
        posterBlob: null,
        previewUrl: URL.createObjectURL(blob),
        width: 0,
        height: 0,
        durationSeconds: null,
      });
      return;
    }

    const meta = await readVideoMeta(file);
    if (meta.duration > MABAR_VIDEO_MAX_SECONDS + 0.5) {
      setError(`Video maksimal ${MABAR_VIDEO_MAX_SECONDS} detik. Pilih video yang lebih pendek.`);
      return;
    }
    const poster = await createVideoPoster(file);
    setDraft({
      kind: "video",
      blob: file,
      mimeType: file.type || "video/mp4",
      posterBlob: poster,
      previewUrl: URL.createObjectURL(file),
      width: meta.width,
      height: meta.height,
      durationSeconds: meta.duration,
    });
  }, [mode]);

  return {
    draft,
    error,
    setError,
    cameraOn,
    recording,
    elapsed,
    facing,
    videoRef,
    startCamera,
    stopCamera,
    switchCamera,
    resetDraft,
    capturePhoto,
    startRecording,
    stopRecording,
    pickFile,
    setDraft,
  };
}
