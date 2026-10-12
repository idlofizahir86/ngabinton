import { BrandLogo } from "@/components/layout/brand-logo";

/**
 * Loading overlay "NGABINTON" — logo + raket & kok saling tepok.
 * Dipakai sebagai Suspense fallback (`app/loading.tsx`) saat pindah halaman
 * yang butuh data server (COMPONENTS.md §2.7).
 */
export type LoadingOverlayProps = {
  label?: string;
};

/** Raket badminton (garis, monokrom — bukan ilustrasi/clipart). */
function Racket({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <ellipse cx="32" cy="22" rx="13" ry="17" strokeWidth="4" />
      <path
        d="M24 9v25M28.5 5v34M35.5 5v34M40 9v25M20 16h24M20 22h24M20 28h24"
        strokeWidth="1.2"
        opacity="0.4"
      />
      <path d="M32 39v17" strokeWidth="5" />
    </svg>
  );
}

/** Kok (shuttlecock) — kepala + bulu. */
function Shuttlecock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 40" fill="none" stroke="currentColor" className={className} aria-hidden>
      <path
        d="M10 24 4 6M16 24V4M22 24l6-18"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path d="M4 6Q16-3 28 6" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <circle cx="16" cy="29" r="6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LoadingOverlay({ label = "Memuat..." }: LoadingOverlayProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-10 bg-background px-6"
    >
      <BrandLogo decorative className="h-9 w-auto" />

      <div className="flex items-center gap-8" aria-hidden>
        <span className="-scale-x-100">
          <Racket className="ngbt-paddle-left h-12 w-12 text-text-secondary" />
        </span>
        <Shuttlecock className="ngbt-fly h-9 w-9 text-primary" />
        <Racket className="ngbt-paddle-right h-12 w-12 text-text-secondary" />
      </div>

      <p className="text-xs uppercase tracking-[0.25em] text-text-muted">{label}</p>
    </div>
  );
}
