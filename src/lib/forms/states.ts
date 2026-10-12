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
export const INITIAL_MEMBER_FORM_STATE: MemberFormState = { error: null, ok: false };
export const INITIAL_RESET_PASSWORD_STATE: ResetPasswordState = {
  error: null,
  ok: false,
  password: null,
};
export const INITIAL_CONVERT_ALL_STATE: ConvertAllState = {
  error: null,
  ok: false,
  created: [],
  linked: [],
};
