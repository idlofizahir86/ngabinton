import { cn } from "@/lib/utils/cn";

/** Variant tombol — COMPONENTS.md §7.2. `story-*` untuk latar terang (DESIGN.md §7.16). */
export type ButtonVariant =
  | "primary"
  | "ghost"
  | "outline"
  | "danger"
  | "story-primary"
  | "story-ghost";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition duration-150 ease-brand focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50";

export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:brightness-110 active:scale-[0.98]",
  ghost: "bg-transparent border border-border-strong text-text hover:bg-surface-hover",
  outline: "bg-transparent border border-border-strong text-text hover:bg-surface-hover",
  danger: "bg-transparent border border-danger text-danger hover:bg-danger/10",
  "story-primary": "bg-story-teal text-on-primary hover:brightness-110 active:scale-[0.98]",
  "story-ghost": "bg-transparent border border-story-border text-story-text hover:bg-story-bg-alt",
};

export const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
  icon: "h-11 w-11 p-0",
};

/** Kelas tombol — dipakai juga oleh `<Link>` yang tampil seperti tombol (mis. CTA hero). */
export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(BASE_CLASSES, BUTTON_VARIANT_CLASSES[variant], BUTTON_SIZE_CLASSES[size], className);
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}
