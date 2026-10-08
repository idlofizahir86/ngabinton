"use client";

import { LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils/cn";

/** Menu utama (ROUTES.md §9.1, CONTENT.md §2.1). */
const NAV_LINKS = [
  { label: "Event", href: "/#events" },
  { label: "Arsip", href: "/arsip" },
  { label: "Tentang", href: "/tentang" },
  { label: "Kontak", href: "/kontak" },
] as const;

/** Ambang scroll untuk berubah solid (DESIGN.md §7.1). */
const SCROLL_THRESHOLD = 40;

export type NavbarProps = {
  variant?: "public" | "minimal";
  /** Latar transparan saat di atas, solid setelah discroll (default true). */
  transparentOnTop?: boolean;
};

export function Navbar({ variant = "public", transparentOnTop = true }: NavbarProps) {
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

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition duration-[250ms] ease-brand",
        solid ? "bg-background-elevated shadow-card" : "bg-transparent",
      )}
    >
      <Container size="full" className="flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="NGABINTON — Beranda" className="font-display text-2xl text-text">
          NGABINTON
        </Link>

        {showMenu ? (
          <nav aria-label="Navigasi utama" className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-text-muted transition duration-150 ease-brand hover:text-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="flex items-center gap-2">
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
        <Sheet open={menuOpen} onOpenChange={setMenuOpen} side="top" label="Menu">
          <div className="flex h-16 items-center justify-between px-4">
            <span className="font-display text-2xl text-text">NGABINTON</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Tutup menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-pill text-text transition duration-150 ease-brand hover:bg-surface-hover"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav aria-label="Navigasi mobile" className="flex flex-col gap-2 px-4 pb-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-4 py-3 text-lg text-text-secondary transition duration-150 ease-brand hover:bg-surface-hover hover:text-text"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-md bg-primary px-4 py-3 text-center font-semibold text-on-primary"
            >
              Masuk
            </Link>
          </nav>
        </Sheet>
      ) : null}
    </header>
  );
}
