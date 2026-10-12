/**
 * Tipe domain anggota club & permainan.
 * Diturunkan dari schema Drizzle (single source of truth) — AGENTS.md §3.2.
 */
import type { matchParticipants, matches, matchSets, playSessions, users } from "@/lib/db/schema";

export type User = typeof users.$inferSelect;

/** Anggota tanpa data sensitif (`passwordHash`) — aman untuk client. */
export type PublicMember = {
  id: number;
  username: string;
  displayName: string;
  nickname: string | null;
  waNumber: string | null;
  avatarKey: string | null;
  avatarUrl: string | null;
  exp: number;
  role: "admin" | "superadmin" | "member";
};

/** Ringkasan data anggota untuk keperluan auth. */
export type SessionUser = {
  id: number;
  username: string;
  displayName: string;
  nickname: string | null;
  avatarKey: string | null;
  avatarUrl: string | null;
  role: "admin" | "superadmin" | "member";
};

export type PlaySession = typeof playSessions.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type MatchParticipant = typeof matchParticipants.$inferSelect;
export type MatchSet = typeof matchSets.$inferSelect;
