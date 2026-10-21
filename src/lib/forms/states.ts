/**
 * State form bersama untuk `useActionState`.
 *
 * Dipisah dari file Server Action karena file `"use server"` hanya boleh
 * meng-export fungsi async (bukan objek konstanta).
 */
export type LoginState = { error: string | null };

export type SessionFormState = { error: string | null };
export type MatchFormState = { error: string | null; ok: boolean };
export type ProfileState = { error: string | null; ok: boolean };
export type ConvertGuestState = { error: string | null; ok: boolean };
export type AvatarState = { error: string | null; ok: boolean };
/** Form admin: tambah/edit anggota. */
export type MemberFormState = { error: string | null; ok: boolean };
/** Reset password anggota — `password` diisi password default hasil reset. */
export type ResetPasswordState = { error: string | null; ok: boolean; password: string | null };
/** Assign menu akses ke user (RULES.md §5.5). */
export type AccessFormState = { error: string | null; ok: boolean };
/** Form transaksi keuangan. */
export type FinanceFormState = { error: string | null; ok: boolean };
/** Form pindah dana Cash ↔ Rekening Bank. */
export type FinanceTransferState = { error: string | null; ok: boolean };
/** Form definisi badge kustom (admin). */
export type DefinitionFormState = { error: string | null; ok: boolean };
/** Form pemberian badge kustom ke anggota. */
export type AwardFormState = { error: string | null; ok: boolean; duplicate: boolean };
/** Form assign EO event. */
export type OrganizerFormState = { error: string | null; ok: boolean };
/** Upload foto dokumentasi ke Google Drive. */
export type DocumentationUploadState = {
  error: string | null;
  ok: boolean;
  fileName: string | null;
  webViewLink: string | null;
};
/** Input massal iuran sesi — melaporkan berapa yang dibuat & dilewati. */
export type BulkDuesState = {
  error: string | null;
  ok: boolean;
  created: number;
  skipped: number;
};
/** Konversi semua BaturanNgabinton — `created`/`linked` melaporkan hasilnya. */
export type ConvertAllState = {
  error: string | null;
  ok: boolean;
  created: string[];
  linked: string[];
};

export const INITIAL_SESSION_STATE: SessionFormState = { error: null };
export const INITIAL_MATCH_STATE: MatchFormState = { error: null, ok: false };
export const INITIAL_PROFILE_STATE: ProfileState = { error: null, ok: false };
export const INITIAL_CONVERT_STATE: ConvertGuestState = { error: null, ok: false };
export const INITIAL_AVATAR_STATE: AvatarState = { error: null, ok: false };
export const INITIAL_DOCUMENTATION_UPLOAD_STATE: DocumentationUploadState = {
  error: null,
  ok: false,
  fileName: null,
  webViewLink: null,
};
export const INITIAL_MEMBER_FORM_STATE: MemberFormState = { error: null, ok: false };
export const INITIAL_RESET_PASSWORD_STATE: ResetPasswordState = {
  error: null,
  ok: false,
  password: null,
};
export const INITIAL_ACCESS_STATE: AccessFormState = { error: null, ok: false };
export const INITIAL_FINANCE_STATE: FinanceFormState = { error: null, ok: false };
export const INITIAL_TRANSFER_STATE: FinanceTransferState = { error: null, ok: false };
export const INITIAL_DEFINITION_STATE: DefinitionFormState = { error: null, ok: false };
export const INITIAL_AWARD_STATE: AwardFormState = {
  error: null,
  ok: false,
  duplicate: false,
};
export const INITIAL_ORGANIZER_STATE: OrganizerFormState = { error: null, ok: false };
export const INITIAL_BULK_DUES_STATE: BulkDuesState = {
  error: null,
  ok: false,
  created: 0,
  skipped: 0,
};
export const INITIAL_CONVERT_ALL_STATE: ConvertAllState = {
  error: null,
  ok: false,
  created: [],
  linked: [],
};
