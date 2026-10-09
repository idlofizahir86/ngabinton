import Image from "next/image";

/**
 * Wordmark NGABINTON versi **putih** — dipakai di latar gelap (`BRAND.md` §3.3:
 * "Di background gelap → logo putih"). Navbar & footer selalu gelap (DESIGN.md §2).
 */
export const BRAND_LOGO_URL = "/brand/logo-dark.svg";

export type BrandLogoProps = {
  className?: string;
  /** `true` kalau di dalam elemen yang sudah punya label sendiri (mis. `<Link aria-label>`). */
  decorative?: boolean;
  priority?: boolean;
};

/**
 * Logo brand — COMPONENTS.md §2.6.
 * `unoptimized` karena `next/image` tidak memproses SVG tanpa `dangerouslyAllowSVG`.
 */
export function BrandLogo({ className, decorative = false, priority }: BrandLogoProps) {
  return (
    <Image
      src={BRAND_LOGO_URL}
      alt={decorative ? "" : "NGABINTON"}
      width={301}
      height={59}
      priority={priority}
      unoptimized
      className={className}
    />
  );
}
