import { db } from "../db";
import { day } from "../db/schema";

type InsertDay = typeof day.$inferInsert;

export async function insertDays(newEventDays: InsertDay[]) {
  return await db.insert(day).values(newEventDays).returning();
}

export async function getEventDays(eventId: number) {
  return await db.query.day.findMany({
    where: (model, { eq }) => eq(model.eventId, eventId),
  });
}
