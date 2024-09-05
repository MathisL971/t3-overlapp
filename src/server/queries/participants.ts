import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { participant } from "../db/schema";

type InsertParticipant = typeof participant.$inferInsert;

export async function getEventParticipantByEventAndUsername(
  eventId: number,
  username: string,
) {
  return await db.query.participant.findFirst({
    where: and(
      eq(participant.eventId, eventId),
      eq(participant.username, username),
    ),
  });
}

export async function getParticipantById(participantId: number) {
  return await db.query.participant.findFirst({
    where: eq(participant.id, participantId),
  });
}

export async function getParticipantsByEvent(eventId: number) {
  return await db.query.participant.findMany({
    where: eq(participant.eventId, eventId),
  });
}

export async function insertEventParticipant(
  newParticipant: InsertParticipant,
) {
  const res = await db.insert(participant).values(newParticipant).returning();
  return res[0];
}
