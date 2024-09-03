import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { availability } from "../db/schema";
import type { NewAvailability } from "../types";
import { getParticipantsByEvent } from "./participants";

export async function insertAvailabilities(
    NewAvailabilities: NewAvailability[],
) {
    return await db
        .insert(availability)
        .values(NewAvailabilities)
        .returning();
}

export async function insertAvailability(
    availabilitySlot: NewAvailability,
) {
    return await db
        .insert(availability)
        .values(availabilitySlot)
        .returning();
}

export async function removeAvailability(slotId: number) {
    return await db
        .delete(availability)
        .where(eq(availability.id, slotId));
}

export async function getAvailabilitiesByDay(dayId: number) {
    return await db.query.availability.findMany({
        where: (model, { eq }) => eq(model.dayId, dayId),
    });
}

export async function getAvailabilitiesByParticipant(participantId: number) {
    return await db.query.availability.findMany({
        where: (model, { eq }) => eq(model.participantId, participantId),
    });
}

export async function getAvailabilitiesByEvent(eventId: number) {
    const participants = await getParticipantsByEvent(eventId);
    const participantIds = participants.map((p) => p.id).concat([-1]);

    return await db.select().from(availability).where(
        inArray(availability.participantId, participantIds),
    );
}

export async function getAvailability(
    participantId: number,
    dayId: number,
    startTime: string,
    endTime: string,
) {
    const res = await db.select().from(availability).where(
        and(
            eq(availability.participantId, participantId),
            eq(availability.dayId, dayId),
            eq(availability.startTime, startTime),
            eq(availability.endTime, endTime),
        ),
    )

    if (res.length === 0) {
        return undefined;
    }

    return res[0];
}