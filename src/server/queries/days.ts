import { db } from "../db";
import { day } from "../db/schema";
import type { NewEventDay } from "../types";

export async function insertDays(newEventDays: NewEventDay[]) {
    return await db.insert(day).values(newEventDays).returning();
}

export async function getEventDays(eventId: number) {
    return await db.query.day.findMany({
        where: (model, { eq }) => eq(model.eventId, eventId),
    });
}