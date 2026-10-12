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

export const INITIAL_SESSION_STATE: SessionFormState = { error: null };
export const INITIAL_MATCH_STATE: MatchFormState = { error: null, ok: false };
export const INITIAL_PROFILE_STATE: ProfileState = { error: null, ok: false };
export const INITIAL_CONVERT_STATE: ConvertGuestState = { error: null, ok: false };
export const INITIAL_AVATAR_STATE: AvatarState = { error: null, ok: false };
