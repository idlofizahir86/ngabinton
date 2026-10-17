import Link from "next/link";

import type { MenuKey } from "@/lib/constants";

export type AdminNavItem = {
  label: string;
  href: string;
  menu?: MenuKey;
  adminOnly?: boolean;
};

/** Navigasi area pengurus — item difilter sesuai menu yang di-assign (RULES.md §5.5). */
export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Keuangan", href: "/admin/keuangan", menu: "finance" },
  { label: "Sesi Bermain", href: "/admin/sesi", menu: "matches" },
  { label: "Anggota", href: "/admin/anggota", menu: "members" },
  { label: "Pencapaian", href: "/admin/pencapaian", adminOnly: true },
  { label: "Akses Menu", href: "/admin/akses", adminOnly: true },
];

/** Saring item navigasi berdasarkan menu yang dimiliki user. */
export function visibleAdminNav(menus: MenuKey[], isAdmin: boolean): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => {
    if (item.adminOnly) return isAdmin;
    return !item.menu || menus.includes(item.menu);
  });
}

/** Deretan link navigasi admin (dipakai desktop & mobile). */
export function AdminNavLinks({ items }: { items: AdminNavItem[] }) {
  return (
    <>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm text-text-muted transition hover:text-text"
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}
