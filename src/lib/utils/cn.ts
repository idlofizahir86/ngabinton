/**
 * Helper gabung className. Versi ringan tanpa dependency
 * (jika nanti perlu merge Tailwind yang konflik, bisa upgrade ke clsx + tailwind-merge).
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
