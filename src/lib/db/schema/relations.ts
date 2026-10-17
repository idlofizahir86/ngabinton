/**
 * Drizzle relations lintas-tabel — SCHEMA.md §4.
 * Dipisah agar tabel tidak saling mengimpor (hindari circular import).
 */
import { relations } from "drizzle-orm";

import { userMenuAccess } from "./access";
import { achievementDefinitions } from "./achievement-definitions";
import { memberAchievements } from "./achievements";
import { eventOrganizers } from "./event-organizers";
import { events } from "./events";
import { financeEntries, financeTransfers } from "./finance";
import { matchParticipants, matches, matchSets, playSessions, sessionRsvps } from "./play";
import { users } from "./users";

export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  eventOrganizers: many(eventOrganizers),
  playSessions: many(playSessions),
  matchParticipants: many(matchParticipants),
  sessionRsvps: many(sessionRsvps),
  menuAccess: many(userMenuAccess),
  achievements: many(memberAchievements),
  financeEntries: many(financeEntries),
  financePaid: many(financeEntries, { relationName: "financePayer" }),
  financeTransfers: many(financeTransfers),
  achievementDefinitions: many(achievementDefinitions),
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
  createdByUser: one(users, { fields: [matches.createdBy], references: [users.id] }),
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

export const userMenuAccessRelations = relations(userMenuAccess, ({ one }) => ({
  user: one(users, { fields: [userMenuAccess.userId], references: [users.id] }),
}));

export const financeEntriesRelations = relations(financeEntries, ({ one }) => ({
  session: one(playSessions, {
    fields: [financeEntries.playSessionId],
    references: [playSessions.id],
  }),
  createdByUser: one(users, { fields: [financeEntries.createdBy], references: [users.id] }),
  payer: one(users, {
    fields: [financeEntries.payerUserId],
    references: [users.id],
    relationName: "financePayer",
  }),
}));

export const memberAchievementsRelations = relations(memberAchievements, ({ one }) => ({
  user: one(users, { fields: [memberAchievements.userId], references: [users.id] }),
  definition: one(achievementDefinitions, {
    fields: [memberAchievements.definitionId],
    references: [achievementDefinitions.id],
  }),
}));

export const achievementDefinitionsRelations = relations(
  achievementDefinitions,
  ({ one, many }) => ({
    createdByUser: one(users, {
      fields: [achievementDefinitions.createdBy],
      references: [users.id],
    }),
    awards: many(memberAchievements),
  }),
);

export const financeTransfersRelations = relations(financeTransfers, ({ one }) => ({
  createdByUser: one(users, { fields: [financeTransfers.createdBy], references: [users.id] }),
}));

export const eventOrganizersRelations = relations(eventOrganizers, ({ one }) => ({
  event: one(events, { fields: [eventOrganizers.eventId], references: [events.id] }),
  user: one(users, { fields: [eventOrganizers.userId], references: [users.id] }),
}));
