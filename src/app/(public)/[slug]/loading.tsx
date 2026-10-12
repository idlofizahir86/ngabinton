import { LoadingOverlay } from "@/components/layout/loading-overlay";

/**
 * Suspense boundary halaman event `/[slug]` (paling lambat: query relasi lengkap).
 * Ditaruh langsung di segmen ini agar overlay tampil saat navigasi dari landing.
 */
export default function EventLoading() {
  return <LoadingOverlay />;
}
