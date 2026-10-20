"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Error boundary terakhir — dipakai bila root layout sendiri gagal.
 * Styling inline karena `globals.css` belum tentu termuat di titik ini.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141414",
          color: "#f5f5f5",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 460, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.04em", color: "#ef4444" }}>
            GANGGUAN
          </p>
          <h1 style={{ margin: "8px 0 0", fontSize: 28 }}>Aplikasi gagal dimuat</h1>
          <p style={{ margin: "12px 0 0", fontSize: 14, color: "#a3a3a3" }}>
            Koneksi ke server sedang lambat atau terputus. Coba muat ulang halaman ini.
          </p>
          {error.digest ? (
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#737373" }}>
              Kode kesalahan: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "#e50914",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
