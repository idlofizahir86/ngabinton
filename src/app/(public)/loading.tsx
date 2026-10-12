import { LoadingOverlay } from "@/components/layout/loading-overlay";

/**
 * Suspense boundary untuk seluruh halaman publik (landing, `/[slug]`, arsip, leaderboard, member).
 * Wajib di level group `(public)` supaya navigasi antar-halaman menampilkan overlay
 * (boundary di root terlalu tinggi → halaman lama tetap tampil sampai data siap).
 */
export default function PublicLoading() {
  return <LoadingOverlay />;
}
