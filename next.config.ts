import type { NextConfig } from "next";

/**
 * Host Supabase Storage untuk `next/image` (avatar anggota).
 * Diambil dari `SUPABASE_URL` supaya tidak perlu hardcode domain.
 */
function supabaseImageHost(): string | null {
  const url = process.env.SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const imageHost = supabaseImageHost();

const nextConfig: NextConfig = {
  // Upload avatar (maks 5MB sebelum di-resize) → naikkan batas body Server Action.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  // googleapis memakai require dinamis/stream Node — jangan di-bundle oleh Turbopack.
  serverExternalPackages: ["googleapis"],
  images: {
    remotePatterns: imageHost
      ? [
          {
            protocol: "https",
            hostname: imageHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
