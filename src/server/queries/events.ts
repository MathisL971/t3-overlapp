import { eq } from "drizzle-orm";
import { db } from "../db";
import { event } from "../db/schema";

type InsertEvent = typeof event.$inferInsert;

export async function insertEvent(newEvent: InsertEvent) {
  const res = await db.insert(event).values(newEvent).returning();
  return res[0];
}

export async function getEvent(id: number) {
  return await db.query.event.findFirst({
    where: eq(event.id, id),
  });
}
