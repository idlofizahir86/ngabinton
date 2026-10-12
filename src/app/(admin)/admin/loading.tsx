import { LoadingOverlay } from "@/components/layout/loading-overlay";

/** Suspense boundary untuk halaman admin (`/admin/*`). */
export default function AdminLoading() {
  return <LoadingOverlay />;
}
