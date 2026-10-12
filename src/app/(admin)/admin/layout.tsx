import Link from "next/link";

import { logoutAction } from "@/actions/auth";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Container } from "@/components/layout/container";
import { getCurrentUser, requireAdmin } from "@/lib/auth/guards";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Sesi Bermain", href: "/admin/sesi" },
  { label: "Anggota", href: "/admin/anggota" },
] as const;

/** Layout area admin — hanya pengurus (RULES.md §5). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background-elevated">
        <Container size="xl" className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" aria-label="NGABINTON — Admin">
              <BrandLogo decorative priority className="h-6 w-auto" />
            </Link>
            <nav aria-label="Navigasi admin" className="hidden items-center gap-6 md:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-text-muted transition hover:text-text"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-text-muted sm:inline">
              {user?.displayName ?? "Pengurus"}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-border-strong px-3 py-1.5 text-sm text-text transition hover:bg-surface-hover"
              >
                Keluar
              </button>
            </form>
          </div>
        </Container>

        <Container size="xl" className="flex gap-4 pb-3 md:hidden">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-text-muted hover:text-text">
              {item.label}
            </Link>
          ))}
        </Container>
      </header>

      <main className="flex-1 py-8">{children}</main>
    </div>
  );
}
