import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { SessionEditForm } from "@/components/match/session-edit-form";
import { getPlaySessionById } from "@/lib/api/matches";
import { requireMenu } from "@/lib/auth/guards";
import { toDateTimeLocalWib } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Edit Sesi — Admin NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

type PageProps = { params: Promise<{ id: string }> };

/** Halaman edit data sesi bermain. */
export default async function AdminSessionEditPage({ params }: PageProps) {
  await requireMenu("matches");
  const { id } = await params;
  const session = await getPlaySessionById(id);

  if (!session) {
    notFound();
  }

  return (
    <Container size="lg">
      <Link
        href={`/admin/sesi/${session.id}`}
        className="text-sm text-text-muted transition hover:text-text"
      >
        ← Kembali ke sesi
      </Link>

      <header className="mt-4">
        <p className="text-xs uppercase tracking-[0.04em] text-primary">Admin</p>
        <h1 className="mt-1 font-display text-4xl text-text">Edit Sesi</h1>
        <p className="mt-2 text-text-muted">
          Ubah judul, jadwal, lokasi, atau catatan sesi. Game yang sudah dicatat tidak terpengaruh.
        </p>
      </header>

      <div className="mt-8 rounded-lg border border-border bg-surface p-6 sm:p-8">
        <SessionEditForm
          initial={{
            id: session.id,
            title: session.title,
            location: session.location ?? "",
            playedAt: toDateTimeLocalWib(session.playedAt),
            endedAt: session.endedAt ? toDateTimeLocalWib(session.endedAt) : "",
            notes: session.notes ?? "",
          }}
        />
      </div>
    </Container>
  );
}
