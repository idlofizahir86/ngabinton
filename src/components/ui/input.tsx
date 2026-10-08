import { cn } from "@/lib/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** Input (varian cinema) — COMPONENTS.md §7.1 & DESIGN.md §7.17. */
export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text",
        "placeholder:text-text-muted",
        "transition duration-150 ease-brand",
        "focus:border-primary focus:outline-none focus:shadow-focus",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
