import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { AvatarPhotoForm } from "@/components/member/avatar-photo-form";
import { ProfileForm } from "@/components/member/profile-form";
import { getCurrentUser, requireUser } from "@/lib/auth/guards";
import { getAvatarPreset } from "@/lib/members/avatars";

export const metadata: Metadata = {
  title: "Edit Profil — NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

/** Halaman edit profil anggota (nama, nama punggung, no. WA, avatar). */
export default async function MemberProfilePage() {
  await requireUser();
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="pb-24 pt-28">
        <Container size="md">
          <p className="text-text-muted">Data anggota tidak ditemukan. Coba masuk ulang.</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-28">
      <Container size="md">
        <header>
          <p className="text-xs uppercase tracking-[0.04em] text-primary">Area Anggota</p>
          <h1 className="mt-1 text-3xl font-bold text-text">Edit Profil</h1>
          <p className="mt-2 text-sm text-text-muted">
            Unggah foto atau pilih avatar preset, lengkapi data, dan isi nomor WhatsApp (bisa
            dipakai untuk login).
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-6">
          <section className="rounded-lg border border-border bg-surface p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-text">Foto</h2>
            <div className="mt-4">
              <AvatarPhotoForm
                name={user.nickname || user.displayName}
                avatarKey={user.avatarKey}
                avatarUrl={user.avatarUrl}
              />
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-text">Data Anggota</h2>
            <div className="mt-4">
              <ProfileForm
                initial={{
                  displayName: user.displayName,
                  nickname: user.nickname ?? "",
                  waNumber: user.waNumber ?? "",
                  avatarKey: getAvatarPreset(user.avatarKey).key,
                }}
              />
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
