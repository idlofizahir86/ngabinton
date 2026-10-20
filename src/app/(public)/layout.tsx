import { Footer } from "@/components/layout/footer";
import { MusicToggle } from "@/components/layout/music-toggle";
import { SessionProvider } from "@/components/layout/session-provider";
import { SiteNavbar } from "@/components/layout/site-navbar";

/**
 * Layout halaman publik — bungkus Navbar + Footer (ROUTES.md §1.1).
 *
 * Sengaja **tidak** membaca cookie: status login diambil client lewat
 * `<SessionProvider />` supaya halaman publik (`/`, `/arsip`, `/[slug]`) bisa
 * di-cache ISR. Halaman ber-auth (`/member*`) tetap dinamis lewat `requireUser`.
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <SiteNavbar />
      <MusicToggle />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </SessionProvider>
  );
}
