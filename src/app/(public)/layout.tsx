import { Footer } from "@/components/layout/footer";
import { MusicToggle } from "@/components/layout/music-toggle";
import { Navbar } from "@/components/layout/navbar";
import { getCurrentUser } from "@/lib/auth/guards";

/** Layout halaman publik — bungkus Navbar + Footer (ROUTES.md §1.1). */
export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <>
      <Navbar
        user={
          user
            ? {
                displayName: user.displayName,
                nickname: user.nickname,
                avatarKey: user.avatarKey,
                avatarUrl: user.avatarUrl,
                role: user.role,
              }
            : null
        }
      />
      <MusicToggle />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
