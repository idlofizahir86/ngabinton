import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/actions/auth";
import { AdminNavLinks, visibleAdminNav } from "@/components/admin/admin-nav";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Container } from "@/components/layout/container";
import { getCurrentUser, getUserMenus, isAdminRole, requireUser } from "@/lib/auth/guards";

/** Layout area pengurus & staf yang diberi akses menu (RULES.md §5.5). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const user = await getCurrentUser();

  if (!user) {
    redirect("/member");
  }

  const menus = await getUserMenus(user);
  const isAdmin = isAdminRole(user.role);

  if (!isAdmin && menus.length === 0) {
    redirect("/member");
  }

  const navItems = visibleAdminNav(menus, isAdmin);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background-elevated">
        <Container size="xl" className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" aria-label="NGABINTON — Admin">
              <BrandLogo decorative priority className="h-6 w-auto" />
            </Link>
            <nav aria-label="Navigasi admin" className="hidden items-center gap-6 md:flex">
              <AdminNavLinks items={navItems} />
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-text-muted sm:inline">
              {user.nickname || user.displayName}
              {isAdmin ? "" : " · Staf"}
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

        <Container size="xl" className="flex gap-4 overflow-x-auto pb-3 md:hidden">
          <AdminNavLinks items={navItems} />
        </Container>
      </header>

      <main className="flex-1 py-8">{children}</main>
    </div>
  );
}
