import { eq } from "drizzle-orm";
import { db } from "../db";
import { event } from "../db/schema";
import type { NewEvent } from "../types";

export async function insertEvent(newEvent: NewEvent) {
    const res = await db
        .insert(event)
        .values(newEvent)
        .returning();
    return res[0];
}

export async function getEvent(id: number) {

    const res = await db.select().from(event).where(
        eq(event.id, id),
    )

    if (res.length === 0) {
        return undefined;
    }

    return res[0];
}