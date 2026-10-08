import { Footer } from "@/components/layout/footer";
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
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
