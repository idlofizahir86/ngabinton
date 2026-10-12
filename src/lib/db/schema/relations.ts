/**
 * Drizzle relations lintas-tabel — SCHEMA.md §4.
 * Dipisah agar tabel tidak saling mengimpor (hindari circular import).
 */
import { relations } from "drizzle-orm";

import { events } from "./events";
import { matchParticipants, matches, matchSets, playSessions, sessionRsvps } from "./play";
import { users } from "./users";

export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  playSessions: many(playSessions),
  matchParticipants: many(matchParticipants),
  sessionRsvps: many(sessionRsvps),
}));

export const playSessionsRelations = relations(playSessions, ({ one, many }) => ({
  matches: many(matches),
  rsvps: many(sessionRsvps),
  createdByUser: one(users, { fields: [playSessions.createdBy], references: [users.id] }),
}));

export const sessionRsvpsRelations = relations(sessionRsvps, ({ one }) => ({
  session: one(playSessions, { fields: [sessionRsvps.sessionId], references: [playSessions.id] }),
  user: one(users, { fields: [sessionRsvps.userId], references: [users.id] }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  session: one(playSessions, { fields: [matches.sessionId], references: [playSessions.id] }),
  participants: many(matchParticipants),
  sets: many(matchSets),
}));

export const matchParticipantsRelations = relations(matchParticipants, ({ one }) => ({
  match: one(matches, { fields: [matchParticipants.matchId], references: [matches.id] }),
  user: one(users, { fields: [matchParticipants.userId], references: [users.id] }),
}));

export const matchSetsRelations = relations(matchSets, ({ one }) => ({
  match: one(matches, { fields: [matchSets.matchId], references: [matches.id] }),
}));
