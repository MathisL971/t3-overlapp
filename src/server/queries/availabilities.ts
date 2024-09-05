import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { availability } from "../db/schema";
import { getParticipantsByEvent } from "./participants";

type InsertAvailability = typeof availability.$inferInsert;

export async function insertAvailabilities(
  NewAvailabilities: InsertAvailability[],
) {
  return await db.insert(availability).values(NewAvailabilities).returning();
}

export async function insertAvailability(availabilitySlot: InsertAvailability) {
  return await db.insert(availability).values(availabilitySlot).returning();
}

export async function removeAvailability(slotId: number) {
  return await db.delete(availability).where(eq(availability.id, slotId));
}

export async function getAvailabilitiesByDay(dayId: number) {
  return await db.query.availability.findMany({
    where: eq(availability.dayId, dayId),
  });
}

export async function getAvailabilitiesByParticipant(participantId: number) {
  return await db.query.availability.findMany({
    where: eq(availability.participantId, participantId),
  });
}

export async function getAvailabilitiesByEvent(eventId: number) {
  const participants = await getParticipantsByEvent(eventId);
  const participantIds = participants.map((p) => p.id).concat([-1]);

  return await db.query.availability.findMany({
    where: inArray(availability.participantId, participantIds),
  });
}

export async function getAvailability(
  participantId: number,
  dayId: number,
  startTime: string,
  endTime: string,
) {
  return await db.query.availability.findFirst({
    where: and(
      eq(availability.participantId, participantId),
      eq(availability.dayId, dayId),
      eq(availability.startTime, startTime),
      eq(availability.endTime, endTime),
    ),
  });
}
