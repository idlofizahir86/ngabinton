import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FinanceEntryForm } from "@/components/finance/finance-entry-form";
import { Container } from "@/components/layout/container";
import { getFinanceEntryById } from "@/lib/api/finance";
import { getMemberOptions, getPlaySessions } from "@/lib/api/matches";
import { requireMenu } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Ubah Transaksi — Admin NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

type PageProps = { params: Promise<{ id: string }> };

/** Ubah satu transaksi keuangan. */
export default async function AdminFinanceEditPage({ params }: PageProps) {
  await requireMenu("finance");
  const { id } = await params;
  const [entry, sessions, members] = await Promise.all([
    getFinanceEntryById(id),
    getPlaySessions(),
    getMemberOptions(),
  ]);

  if (!entry) {
    notFound();
  }

  return (
    <Container size="lg">
      <Link
        href="/admin/keuangan"
        className="text-sm text-text-muted transition hover:text-text"
      >
        ← Kembali ke keuangan
      </Link>

      <header className="mt-4">
        <p className="text-xs uppercase tracking-[0.04em] text-primary">Keuangan</p>
        <h1 className="mt-1 font-display text-4xl text-text">Ubah Transaksi</h1>
        <p className="mt-2 text-text-muted">
          Perbaiki nominal, keterangan, kategori, tanggal, atau sesi terkait.
        </p>
      </header>

      <div className="mt-8 rounded-lg border border-border bg-surface p-6 sm:p-8">
        <FinanceEntryForm
          sessions={sessions.map((session) => ({ id: session.id, title: session.title }))}
          members={members.map((member) => ({
            id: member.id,
            name: member.nickname || member.displayName,
          }))}
          entry={{
            id: entry.id,
            type: entry.type,
            amount: entry.amount,
            description: entry.description,
            category: entry.category,
            paymentMethod: entry.paymentMethod,
            payerId: entry.payerId,
            occurredAt: entry.occurredAt,
            sessionId: entry.sessionId,
          }}
        />
      </div>
    </Container>
  );
}
