import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { participant } from "../db/schema";
import type { NewParticipant } from "../types";

export async function getEventParticipantByEventAndUsername(eventId: number, username: string) {
    const res = await db
        .select()
        .from(participant)
        .where(
            and(
                eq(participant.eventId, eventId),
                eq(participant.username, username),
            ),
        );

    if (res.length === 0) {
        return undefined;
    }

    return res[0];
}

export async function getParticipantById(participantId: number) {
    const res = await db.select().from(participant).where(eq(participant.id, participantId))
    if (res.length === 0) {
        return undefined;
    }
    return res[0];
}

export async function getParticipantsByEvent(eventId: number) {
    return await db.query.participant.findMany({
        where: (model, { eq }) => eq(model.eventId, eventId),
    });
}

export async function insertEventParticipant(
    newParticipant: NewParticipant,
) {
    const res = await db
        .insert(participant)
        .values(newParticipant)
        .returning();
    return res[0];
}