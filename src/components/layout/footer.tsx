import { Camera, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";

/** Navigasi footer — CONTENT.md §2.2. */
const NAV_LINKS = [
  { label: "Event Mendatang", href: "/#events" },
  { label: "Arsip Event", href: "/arsip" },
  { label: "Tentang Kami", href: "/tentang" },
];

/** Sosial — tautan masih PLACEHOLDER, ganti sebelum produksi (CONTENT.md §8).
 *  Catatan: Lucide v1 tidak lagi menyediakan icon brand (Instagram dll) → pakai icon generik. */
const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/ngabinton", icon: Camera },
  { label: "WhatsApp", href: "https://wa.me/62800000000", icon: MessageCircle },
  { label: "Email", href: "mailto:hello@ngabinton.id", icon: Mail },
];

/** Footer publik (selalu varian cinema) — COMPONENTS.md §2.3. */
export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <Container size="full" className="py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl text-text">NGABINTON</p>
            <p className="mt-3 max-w-xs text-sm text-text-muted">Ngaji, ngobrol, badminton.</p>
            <p className="mt-1 text-sm text-text-muted">Bandung</p>
          </div>

          <nav aria-label="Navigasi footer">
            <p className="text-xs uppercase tracking-[0.04em] text-text-subtle">Navigasi</p>
            <ul className="mt-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted transition duration-150 ease-brand hover:text-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs uppercase tracking-[0.04em] text-text-subtle">Sosial</p>
            <ul className="mt-4 flex flex-col gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-text-muted transition duration-150 ease-brand hover:text-text"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-6">
          <p className="text-xs text-text-subtle">
            © 2026 NGABINTON. Dibuat sambil gabut oleh IT Palugada sembari ngantuk.
          </p>
        </div>
      </Container>
    </footer>
  );
}
