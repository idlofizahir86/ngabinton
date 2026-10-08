import { cn } from "@/lib/utils/cn";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

const MAX_WIDTH: Record<ContainerSize, string> = {
  sm: "max-w-[480px]",
  md: "max-w-[720px]",
  lg: "max-w-[1024px]",
  xl: "max-w-[1280px]",
  full: "max-w-[1600px]",
};

export type ContainerProps = {
  children: React.ReactNode;
  size?: ContainerSize;
  as?: "div" | "section" | "article";
  className?: string;
};

/** Wrapper max-width + padding horizontal responsif — COMPONENTS.md §2.1. */
export function Container({ children, size = "lg", as = "div", className }: ContainerProps) {
  const Tag = as;
  return (
    <Tag className={cn("mx-auto w-full px-4 sm:px-6 lg:px-16", MAX_WIDTH[size], className)}>
      {children}
    </Tag>
  );
}
