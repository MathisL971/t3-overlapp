import { eq } from "drizzle-orm";
import { db } from "../db";
import { session } from "../db/schema";

type InsertSession = typeof session.$inferInsert;

export async function insertSession(newSession: InsertSession) {
  const res = await db.insert(session).values(newSession).returning();
  return res[0];
}

export async function getSession(token: string) {
  return await db.query.session.findFirst({
    where: eq(session.token, token),
  });
}

export async function updateSession(
  sessionId: number,
  newSession: Partial<InsertSession>,
) {
  const res = await db
    .update(session)
    .set(newSession)
    .where(eq(session.id, sessionId))
    .returning();
  return res[0];
}
