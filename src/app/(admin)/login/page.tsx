import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Masuk Admin — NGABINTON",
  robots: { index: false },
};

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

/** Halaman login admin — ROUTES.md §1.1 & CONTENT.md §5.1. */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect: redirectTo } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center py-16">
      <Container size="sm">
        <div className="rounded-lg border border-border bg-surface p-8 shadow-card">
          <h1 className="text-3xl font-bold text-text">Masuk Admin</h1>
          <p className="mt-2 text-sm text-text-muted">Khusus pengurus NGABINTON.</p>

          <div className="mt-8">
            <LoginForm redirectTo={redirectTo} />
          </div>
        </div>
      </Container>
    </main>
  );
}
