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

/**
 * Tombol pemutar lagu di pojok kiri bawah halaman publik.
 *
 * Ditempatkan di layout `(public)` sehingga elemen `<audio>` tidak remount
 * saat pindah halaman (beranda → arsip → halaman event) dan lagu tetap
 * berjalan. Autoplay dibatasi browser, jadi pemutaran pertama selalu
 * menunggu klik pengguna; preferensi klik terakhir disimpan agar kunjungan
 * berikutnya dicoba diputar otomatis.
 */
export function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  /** Baru render setelah mount agar tidak ada mismatch SSR. */
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = VOLUME;
    setReady(true);

    let wanted = false;
    try {
      wanted = window.localStorage.getItem(STORAGE_KEY) === "on";
    } catch {
      // localStorage bisa diblokir (private mode) — abaikan.
    }
    if (!wanted) return;

    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
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
