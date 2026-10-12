"use client";

import { Music, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

/** Lagu latar halaman publik (public/audio). */
const TRACK_SRC = "/audio/haha-hihi.mp3";

/** Kunci localStorage untuk mengingat preferensi antar kunjungan. */
const STORAGE_KEY = "ngabinton:music";

/** Nilai yang disimpan. */
const PREF_ON = "on";
const PREF_OFF = "off";

/** Volume default — cukup sebagai latar, tidak menutupi konten. */
const VOLUME = 0.45;

/** Interaksi pertama yang dianggap "izin" untuk mulai memutar. */
const RESUME_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

/** Baca preferensi tersimpan. `null` = belum pernah memilih. */
function readPreference(): typeof PREF_ON | typeof PREF_OFF | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === PREF_ON) return PREF_ON;
    if (value === PREF_OFF) return PREF_OFF;
  } catch {
    // localStorage bisa diblokir (private mode) — anggap belum memilih.
  }
  return null;
}

/** Simpan preferensi; abaikan bila localStorage tidak tersedia. */
function writePreference(value: typeof PREF_ON | typeof PREF_OFF) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // abaikan
  }
}

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
 *
 * Preferensi disimpan di `localStorage` (`ngabinton:music`):
 * - `off` → tidak pernah auto-start (termasuk setelah scroll/klik);
 * - `on`  → boleh auto-start.
 * Saat pengguna menekan tombol untuk mematikan, listener auto-resume **dilepas**
 * supaya lagu tidak menyala sendiri lagi di sesi itu.
 */
export function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  /** Pengguna pernah mematikan lagu → jangan pernah auto-start. */
  const stoppedByUser = useRef(false);
  /** Melepas listener interaksi pertama (dipanggil saat mute / setelah berhasil play). */
  const detachResume = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  /** Baru render setelah mount agar tidak ada mismatch SSR. */
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = VOLUME;
    setReady(true);
    stoppedByUser.current = readPreference() === PREF_OFF;

    let cancelled = false;

    const attemptPlay = () => audio.play().then(() => true).catch(() => false);

    const onFirstInteraction = (event: Event) => {
      // Hormati preferensi "off" — jangan nyalakan lagi setelah di-mute.
      if (stoppedByUser.current) return;
      // Klik tombol ditangani `toggle()`, jangan dobel.
      if (buttonRef.current?.contains(event.target as Node)) return;

      void attemptPlay().then((played) => {
        if (cancelled || !played) return;
        setPlaying(true);
        detachResume.current();
      });
    };

    detachResume.current = () => {
      RESUME_EVENTS.forEach((name) => window.removeEventListener(name, onFirstInteraction));
    };

    if (!stoppedByUser.current) {
      void attemptPlay().then((played) => {
        if (cancelled) return;
        if (played) {
          setPlaying(true);
          return;
        }
        RESUME_EVENTS.forEach((name) =>
          window.addEventListener(name, onFirstInteraction, { passive: true }),
        );
      });
    }

    return () => {
      cancelled = true;
      detachResume.current();
      detachResume.current = () => {};
    };
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      writePreference(PREF_ON);
      stoppedByUser.current = false;
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      stoppedByUser.current = true;
      audio.pause();
      setPlaying(false);
      writePreference(PREF_OFF);
      // Lepas listener auto-resume supaya scroll/klik tidak memutar ulang.
      detachResume.current();
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
