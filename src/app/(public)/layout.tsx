import { Footer } from "@/components/layout/footer";
import { MusicToggle } from "@/components/layout/music-toggle";
import { Navbar } from "@/components/layout/navbar";

/** Layout halaman publik — bungkus Navbar + Footer (ROUTES.md §1.1). */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <MusicToggle />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
