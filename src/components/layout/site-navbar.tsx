"use client";

import { Navbar } from "@/components/layout/navbar";
import { useViewerSession } from "@/components/layout/session-provider";

/**
 * Navbar publik dengan status login dari client, supaya layout publik tidak
 * membaca cookie dan halaman publik tetap bisa di-cache (ISR).
 */
export function SiteNavbar() {
  const { user, panelHref } = useViewerSession();
  return <Navbar user={user} panelHref={panelHref} />;
}
