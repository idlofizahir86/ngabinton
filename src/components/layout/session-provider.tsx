"use client";

import { createContext, useContext, useEffect, useState } from "react";

import type { NavbarUser } from "@/components/layout/navbar";

export type ViewerSession = {
  userId: number | null;
  user: NavbarUser | null;
  panelHref: string | null;
};

/** Tampilan default sebelum status login diketahui (pengunjung). */
const ANONYMOUS: ViewerSession = { userId: null, user: null, panelHref: null };

/** Dedupe singkat: cukup untuk satu kali mount, tetap segar saat navigasi berikutnya. */
const CACHE_TTL_MS = 5_000;

let cached: { at: number; promise: Promise<ViewerSession> } | null = null;

/** Ambil status login dari `/api/session` (dipakai beberapa komponen sekaligus). */
export function loadViewerSession(): Promise<ViewerSession> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_TTL_MS) return cached.promise;

  const promise = fetch("/api/session", { cache: "no-store" })
    .then((response) => (response.ok ? (response.json() as Promise<ViewerSession>) : ANONYMOUS))
    .catch(() => ANONYMOUS);

  cached = { at: now, promise };
  return promise;
}

/** Paksa muat ulang status login (mis. setelah logout). */
export function resetViewerSession(): void {
  cached = null;
}

/** Event global dari `<Navbar />` saat logout diklik. */
const SESSION_CHANGED_EVENT = "ngabinton:session-changed";

export function notifySessionChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
  }
}

const SessionContext = createContext<ViewerSession>(ANONYMOUS);

/**
 * Menyediakan status login ke navbar & kartu RSVP tanpa membuat layout publik
 * bergantung pada cookie, sehingga halaman publik bisa di-render statis (ISR).
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ViewerSession>(ANONYMOUS);

  useEffect(() => {
    let active = true;
    loadViewerSession().then((value) => {
      if (active) setSession(value);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onSessionChanged = () => {
      resetViewerSession();
      setSession(ANONYMOUS);
    };
    window.addEventListener(SESSION_CHANGED_EVENT, onSessionChanged);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, onSessionChanged);
  }, []);

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

/** Status login viewer saat ini (`ANONYMOUS` sampai data datang). */
export function useViewerSession(): ViewerSession {
  return useContext(SessionContext);
}
