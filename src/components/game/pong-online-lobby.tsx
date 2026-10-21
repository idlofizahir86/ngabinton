"use client";

import { Check, Copy, Loader2, LogIn, RefreshCw, Users, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useViewerSession } from "@/components/layout/session-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export type PongOnlineLobbyProps = {
  roomCode: string | null;
  role: "host" | "guest" | null;
};

const CODE_PATTERN = /^[A-Z0-9]{4,12}$/;

/** Panel buat/gabung room Pong online (kode dibagikan ke teman). */
export function PongOnlineLobby({ roomCode, role }: PongOnlineLobbyProps) {
  const router = useRouter();
  const { user } = useViewerSession();
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeRoom = roomCode && role ? { roomCode, role } : null;

  async function createRoom() {
    setBusy("create");
    setError(null);
    try {
      const response = await fetch("/api/mainan/pong/rooms", { method: "POST" });
      const data: { ok?: boolean; code?: string } = await response.json();
      if (!response.ok || !data.ok || !data.code) throw new Error("Gagal membuat room.");
      router.replace(`/mainan/pong-ngabinton?room=${data.code}&role=host`);
    } catch {
      setError("Room gagal dibuat. Coba lagi.");
      setBusy(null);
    }
  }

  async function joinRoom() {
    const code = joinCode.trim().toUpperCase();
    if (!CODE_PATTERN.test(code)) {
      setError("Kode room terdiri dari 4–12 huruf/angka.");
      return;
    }
    setBusy("join");
    setError(null);
    try {
      const response = await fetch(`/api/mainan/pong/rooms/${code}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "join" }),
      });
      const data: { ok?: boolean; reason?: string } = await response.json();
      if (response.status === 404 || data.reason === "not_found") {
        setError("Kode room tidak ditemukan atau sudah kedaluwarsa.");
        setBusy(null);
        return;
      }
      if (!response.ok || !data.ok) throw new Error("Gagal bergabung.");
      router.replace(`/mainan/pong-ngabinton?room=${code}&role=guest`);
    } catch {
      setError("Gagal bergabung ke room. Coba lagi.");
      setBusy(null);
    }
  }

  async function copyCode() {
    if (!activeRoom) return;
    try {
      await navigator.clipboard.writeText(activeRoom.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Tidak bisa menyalin otomatis. Salin kodenya secara manual.");
    }
  }

  return (
    <section className="mx-auto w-full max-w-[460px] rounded-xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl text-text">
            <Users aria-hidden className="h-4 w-4 text-primary" />
            Tanding Online
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {activeRoom
              ? activeRoom.role === "host"
                ? "Bagikan kode ini ke temanmu. Pertandingan dimulai otomatis saat dia bergabung."
                : "Kamu masuk sebagai tamu. Tunggu host memulai pertandingan."
              : "Buat room lalu kirim kodenya, atau masukkan kode dari temanmu."}
          </p>
        </div>
        {activeRoom ? (
          <button
            type="button"
            onClick={() => router.replace("/mainan/pong-ngabinton")}
            aria-label="Keluar room"
            className="rounded-md p-1.5 text-text-subtle transition hover:bg-surface-hover hover:text-text"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {activeRoom ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background-elevated px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-subtle">
                Kode Room
              </p>
              <p className="font-mono text-2xl font-bold tracking-[0.28em] text-text">
                {activeRoom.roomCode}
              </p>
            </div>
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold text-text-muted transition hover:bg-surface-hover hover:text-text"
            >
              {copied ? (
                <Check aria-hidden className="h-3.5 w-3.5 text-live" />
              ) : (
                <Copy aria-hidden className="h-3.5 w-3.5" />
              )}
              {copied ? "Tersalin" : "Salin"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw aria-hidden className="h-4 w-4" />
              Muat ulang koneksi
            </Button>
            <p className="text-xs text-text-subtle">
              Room berlaku 30 menit.
            </p>
          </div>
          {!user ? (
            <p className="flex items-start gap-2 rounded-md border border-border bg-background-elevated px-3 py-2 text-xs text-text-muted">
              <LogIn aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              <span>
                Main tetap bisa tanpa login, tapi tanding baru masuk Riwayat Tanding
                setelah kamu{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  masuk
                </Link>
                .
              </span>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <Button variant="primary" size="sm" onClick={createRoom} disabled={busy !== null}>
            {busy === "create" ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Users aria-hidden className="h-4 w-4" />
            )}
            Buat Room
          </Button>
          <div className="flex items-center gap-2">
            <Input
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              placeholder="Kode dari teman"
              maxLength={12}
              inputMode="text"
              autoComplete="off"
              aria-label="Kode room"
              className="py-2 text-sm uppercase tracking-[0.2em]"
            />
            <Button variant="ghost" size="sm" onClick={joinRoom} disabled={busy !== null}>
              {busy === "join" ? (
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              ) : null}
              Gabung
            </Button>
          </div>
        </div>
      )}

      <p
        className={cn(
          "mt-3 text-xs",
          error ? "text-danger" : "text-text-subtle",
        )}
        role={error ? "alert" : undefined}
      >
        {error ??
          "Disarankan memakai jaringan yang sama atau koneksi stabil. Kamu dan teman bermain langsung (peer-to-peer)."}
      </p>
    </section>
  );
}
