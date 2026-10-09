"use client";

import { Music, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

/** Lagu latar halaman publik (public/audio). */
const TRACK_SRC = "/audio/haha-hihi.mp3";

/** Kunci localStorage untuk mengingat preferensi antar kunjungan. */
const STORAGE_KEY = "ngabinton:music";

/** Volume default — cukup sebagai latar, tidak menutupi konten. */
const VOLUME = 0.45;

/** Interaksi pertama yang dianggap "izin" untuk mulai memutar. */
const RESUME_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

/**
 * Tombol pemutar lagu di pojok kiri bawah halaman publik.
 *
 * Ditempatkan di layout `(public)` sehingga elemen `<audio>` tidak remount
 * saat pindah halaman (beranda → arsip → halaman event) dan lagu tetap
 * berjalan.
 *
 * Autoplay bersuara diblokir browser, jadi urutannya:
 * 1. coba `play()` langsung saat mount — berhasil bila browser mengizinkan;
 * 2. bila ditolak, mulai pada interaksi pertama pengguna di halaman.
 * Pemilihan terakhir disimpan di `localStorage`: kalau pengguna mematikan
 * lagu, tidak akan diputar otomatis lagi.
 */
export function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  /** Pengguna pernah mematikan lagu → jangan pernah auto-start. */
  const stoppedByUser = useRef(false);
  const [playing, setPlaying] = useState(false);
  /** Baru render setelah mount agar tidak ada mismatch SSR. */
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = VOLUME;
    setReady(true);

    try {
      stoppedByUser.current = window.localStorage.getItem(STORAGE_KEY) === "off";
    } catch {
      // localStorage bisa diblokir (private mode) — abaikan.
    }

    let cancelled = false;

    const tryPlay = () =>
      audio
        .play()
        .then(() => {
          if (!cancelled) setPlaying(true);
          return true;
        })
        .catch(() => false);

    const onFirstInteraction = (event: Event) => {
      // Klik pada tombol ditangani oleh `toggle()`, jangan dobel.
      if (buttonRef.current?.contains(event.target as Node)) return;
      void tryPlay().then((played) => {
        if (played) cleanup();
      });
    };

    const cleanup = () =>
      RESUME_EVENTS.forEach((name) => window.removeEventListener(name, onFirstInteraction));

    if (stoppedByUser.current) {
      // tidak ada yang perlu dilakukan — biarkan tombol menunggu klik.
    } else {
      void tryPlay().then((played) => {
        if (played || cancelled) return;
        RESUME_EVENTS.forEach((name) =>
          window.addEventListener(name, onFirstInteraction, { passive: true }),
        );
      });
    }

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      stoppedByUser.current = false;
      audio
        .play()
        .then(() => {
          setPlaying(true);
          try {
            window.localStorage.setItem(STORAGE_KEY, "on");
          } catch {
            // abaikan
          }
        })
        .catch(() => setPlaying(false));
    } else {
      stoppedByUser.current = true;
      audio.pause();
      setPlaying(false);
      try {
        window.localStorage.setItem(STORAGE_KEY, "off");
      } catch {
        // abaikan
      }
    }
  }, []);

  const label = playing ? "Matikan lagu" : "Putar lagu";

  return (
    <>
      <audio ref={audioRef} src={TRACK_SRC} loop preload="none" />

      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-pressed={playing}
        title={label}
        className={cn(
          "fixed bottom-4 left-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-pill shadow-card transition duration-150 ease-brand",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          playing
            ? "bg-primary text-on-primary hover:bg-primary/90"
            : "bg-surface text-text-muted hover:bg-surface-hover hover:text-text",
          ready ? "opacity-100" : "opacity-0",
        )}
      >
        {playing ? (
          <Music className="h-5 w-5 animate-pulse" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
        <span className="sr-only">{label}</span>
      </button>
    </>
  );
}
