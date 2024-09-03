import { eq } from "drizzle-orm";
import { db } from "../db";
import { session } from "../db/schema";
import type { NewSession } from "../types";

export async function insertSession(
    newSession: NewSession,
) {
    const res = await db
        .insert(session)
        .values(newSession)
        .returning();
    return res[0];
}

export async function getSession(token: string) {
    const res = await db.select().from(session).where(
        eq(session.token, token),
    )

    if (res.length === 0) {
        return undefined;
    }

    return res[0];
}

export async function updateSession(
    sessionId: number,
    newSession: Partial<NewSession>,
) {
    const res = await db
        .update(session)
        .set(newSession)
        .where(eq(session.id, sessionId))
        .returning();
    return res[0];
}