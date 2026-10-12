import { LoadingOverlay } from "@/components/layout/loading-overlay";

/**
 * Suspense fallback global — overlay "NGABINTON" (raket & kok saling tepok)
 * tampil saat pindah ke halaman yang butuh data server.
 */
export default function Loading() {
  return <LoadingOverlay />;
}
