"use client";

import { ChevronDown, LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { logoutAction } from "@/actions/auth";
import { Container } from "@/components/layout/container";
import { BrandLogo } from "@/components/layout/brand-logo";
import { notifySessionChanged } from "@/components/layout/session-provider";
import { MemberAvatar } from "@/components/member/member-avatar";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils/cn";

/** Satu item menu; `children` membuat submenu (dropdown di desktop, nested di sheet). */
type NavLink = {
  label: string;
  href: string;
  children?: readonly { label: string; href: string }[];
};

/** Menu utama (ROUTES.md §9.1, CONTENT.md §2.1). */
const NAV_LINKS: readonly NavLink[] = [
  { label: "Event", href: "/#events" },
  { label: "Pang-Giatna Ngabinton", href: "/leaderboard" },
  { label: "Mainan", href: "/mainan" },
  {
    label: "Arsip",
    href: "/arsip",
    children: [
      { label: "Arsip Event", href: "/arsip" },
      { label: "Arsip Mabar", href: "/sesi" },
      { label: "Arsip Dokumentasi", href: "/dokumentasi" },
    ],
  },
  { label: "Tentang", href: "/tentang" },
  { label: "Kontak", href: "/kontak" },
];

/** Ambang scroll untuk berubah solid (DESIGN.md §7.1). */
const SCROLL_THRESHOLD = 40;

export type NavbarUser = {
  displayName: string;
  nickname: string | null;
  avatarKey: string | null;
  avatarUrl: string | null;
  role: "admin" | "superadmin" | "member";
};

export type NavbarProps = {
  variant?: "public" | "minimal";
  /** Latar transparan saat di atas, solid setelah discroll (default true). */
  transparentOnTop?: boolean;
  /** User yang sedang login (dari layout server), `null` kalau pengunjung. */
  user?: NavbarUser | null;
  /** Tautan panel tugas (admin / anggota yang diberi akses menu), `null` bila tidak berhak. */
  panelHref?: string | null;
};

/** Halaman mendarat sesuai role. */
function homeHref(role: NavbarUser["role"]): string {
  return role === "member" ? "/member" : "/admin";
}

export function Navbar({
  variant = "public",
  transparentOnTop = true,
  user = null,
  panelHref = null,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !transparentOnTop || scrolled;
  const showMenu = variant === "public";
  const label = user?.nickname?.trim() || user?.displayName || "";
  const panelLabel = user?.role === "member" ? "Panel Staf" : "Panel Admin";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition duration-[250ms] ease-brand",
        solid ? "bg-background-elevated shadow-card" : "bg-transparent",
      )}
    >
      <Container
        size="full"
        className="flex h-16 items-center justify-between gap-4"
      >
        <Link
          href="/"
          aria-label="NGABINTON — Beranda"
          className="flex items-center"
        >
          <BrandLogo decorative priority className="h-7 w-auto" />
        </Link>

        {showMenu ? (
          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-8 md:flex"
          >
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.label} className="group relative">
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1 whitespace-nowrap text-sm text-text-muted transition duration-150 ease-brand hover:text-text"
                  >
                    {link.label}
                    <ChevronDown aria-hidden className="h-4 w-4" />
                  </Link>
                  <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition duration-150 ease-brand group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <ul className="min-w-[11rem] rounded-md border border-border bg-background-elevated p-2 shadow-card">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block whitespace-nowrap rounded-sm px-3 py-2 text-sm text-text-muted transition duration-150 ease-brand hover:bg-surface-hover hover:text-text"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap text-sm text-text-muted transition duration-150 ease-brand hover:text-text"
                >
                  {link.label}
                </Link>
              ),
            )}
            {panelHref ? (
              <Link
                href={panelHref}
                className="whitespace-nowrap text-sm font-semibold text-primary transition duration-150 ease-brand hover:text-text"
              >
                {panelLabel}
              </Link>
            ) : null}
          </nav>
        ) : null}

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href={homeHref(user.role)}
                className="flex items-center gap-2 rounded-pill pr-2 transition duration-150 ease-brand hover:opacity-90"
                aria-label={`Buka area ${user.role === "member" ? "anggota" : "admin"}`}
              >
                <MemberAvatar
                  name={label}
                  avatarKey={user.avatarKey}
                  avatarUrl={user.avatarUrl}
                  size="sm"
                />
                <span className="hidden max-w-[10rem] truncate text-sm text-text-muted md:inline">
                  {label}
                </span>
              </Link>
              <form
                action={logoutAction}
                className="hidden md:block"
                onSubmit={() => notifySessionChanged()}
              >
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-text-muted transition duration-150 ease-brand hover:text-text"
                >
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                aria-label="Masuk"
                className="inline-flex h-11 w-11 items-center justify-center rounded-pill text-text-muted transition duration-150 ease-brand hover:text-text md:hidden"
              >
                <LogIn className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="hidden px-4 py-2 text-sm text-text-muted transition duration-150 ease-brand hover:text-text md:inline-flex"
              >
                Masuk
              </Link>
            </>
          )}

          {showMenu ? (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Buka menu"
              aria-expanded={menuOpen}
              className="inline-flex h-11 w-11 items-center justify-center rounded-pill text-text transition duration-150 ease-brand hover:bg-surface-hover md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          ) : null}
        </div>
      </Container>

      {showMenu ? (
        <Sheet
          open={menuOpen}
          onOpenChange={setMenuOpen}
          side="top"
          label="Menu"
        >
          <div className="flex h-16 items-center justify-between px-4">
            <BrandLogo decorative className="h-7 w-auto" />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Tutup menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-pill text-text transition duration-150 ease-brand hover:bg-surface-hover"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav
            aria-label="Navigasi mobile"
            className="flex flex-col gap-2 px-4 pb-8"
          >
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.label} className="flex flex-col gap-1">
                  <p className="px-4 pt-3 text-xs uppercase tracking-[0.04em] text-text-muted">
                    {link.label}
                  </p>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-md px-4 py-3 ps-6 text-lg text-text-secondary transition duration-150 ease-brand hover:bg-surface-hover hover:text-text"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-4 py-3 text-lg text-text-secondary transition duration-150 ease-brand hover:bg-surface-hover hover:text-text"
                >
                  {link.label}
                </Link>
              ),
            )}
            {user ? (
              <>
                <Link
                  href={homeHref(user.role)}
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 flex items-center gap-3 rounded-md px-4 py-3 text-lg text-text-secondary transition duration-150 ease-brand hover:bg-surface-hover"
                >
                  <MemberAvatar
                    name={label}
                    avatarKey={user.avatarKey}
                    avatarUrl={user.avatarUrl}
                    size="sm"
                  />
                  {user.role === "member" ? "Area Anggota" : "Dashboard"}
                </Link>
                {panelHref ? (
                  <Link
                    href={panelHref}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-4 py-3 text-lg font-semibold text-primary transition duration-150 ease-brand hover:bg-surface-hover"
                  >
                    {panelLabel}
                  </Link>
                ) : null}
                <form
                  action={logoutAction}
                  onSubmit={() => notifySessionChanged()}
                >
                  <button
                    type="submit"
                    className="w-full rounded-md border border-border-strong px-4 py-3 text-center font-semibold text-text"
                  >
                    Keluar
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-md bg-primary px-4 py-3 text-center font-semibold text-on-primary"
              >
                Masuk
              </Link>
            )}
          </nav>
        </Sheet>
      ) : null}
    </header>
  );
}
