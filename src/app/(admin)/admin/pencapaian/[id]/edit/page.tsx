import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AchievementDefinitionForm } from "@/components/admin/achievement-definition-form";
import { Container } from "@/components/layout/container";
import { getAchievementDefinition } from "@/lib/api/achievement-definitions";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Ubah Badge — Admin NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

type PageProps = { params: Promise<{ id: string }> };

/** Ubah definisi badge kustom. */
export default async function AdminAchievementEditPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const definition = await getAchievementDefinition(id);

  if (!definition) {
    notFound();
  }

  return (
    <Container size="lg">
      <Link
        href="/admin/pencapaian"
        className="text-sm text-text-muted transition hover:text-text"
      >
        ← Kembali ke pencapaian
      </Link>

      <header className="mt-4">
        <p className="text-xs uppercase tracking-[0.04em] text-primary">Pencapaian</p>
        <h1 className="mt-1 font-display text-4xl text-text">Ubah Badge</h1>
        <p className="mt-2 text-text-muted">
          Perbarui nama, deskripsi, ikon, atau warna. Badge yang sudah diberikan tetap memakai
          snapshot tampilan lamanya.
        </p>
      </header>

      <div className="mt-8 rounded-lg border border-border bg-surface p-6 sm:p-8">
        <AchievementDefinitionForm
          definition={{
            id: definition.id,
            code: definition.code,
            name: definition.name,
            description: definition.description,
            icon: definition.icon,
            tone: definition.tone,
          }}
        />
      </div>
    </Container>
  );
}
