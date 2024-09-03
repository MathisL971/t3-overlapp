"use server";

import type { z } from "zod";
import type {
    NewParticipant,
    NewSession,
} from "~/server/types";
import type { ParticipantSignInFormSchema } from "../events/[id]/_components/ParticipantSignInForm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { participant, session } from "~/server/db/schema";
import { getEventParticipantByEventAndUsername, getParticipantById, insertEventParticipant } from "~/server/queries/participants";
import { getSession, insertSession, updateSession } from "~/server/queries/sessions";

type Session = typeof session.$inferSelect;
type Participant = typeof participant.$inferSelect;

function generateSessionToken(length = 32) {
    const charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        token += charset[randomIndex];
    }
    return token;
}

export async function signInParticipant(
    eventId: number,
    data: z.infer<typeof ParticipantSignInFormSchema>,
) {
    let participant: Participant | undefined = await getEventParticipantByEventAndUsername(eventId, data.username);

    if (!participant) {
        const newParticipant: NewParticipant = {
            eventId,
            username: data.username,
            password: data.password,
        };

        participant = await insertEventParticipant(newParticipant);

        if (!participant) {
            throw new Error("Failed to sign in. Error creating participant.");
        }
    } else {
        if (participant.password !== data.password) {
            throw new Error("Failed to sign in. Incorrect password.");
        }
    }

    const newSession: NewSession = {
        participantId: participant.id,
        token: generateSessionToken(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        closed: false,
        rememberMe: data.rememberMe,
    };

    const createdSession: Session | undefined = await insertSession(newSession);

    if (!createdSession) {
        throw new Error("Failed to sign in. Error creating session.");
    }

    const cookieStore = cookies();
    if (cookieStore.has("session_token")) {
        cookieStore.delete("session_token");
    }
    cookieStore.set("session_token", createdSession.token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        httpOnly: true,
        sameSite: "strict",
        secure: true,
    });

    revalidatePath(`/events/${eventId}`);
}

export async function signOutParticipant() {
    const cookiesStore = cookies();
    if (!cookiesStore.has("session_token")) {
        throw new Error("No session found");
    }

    const sessionToken: string | undefined = cookiesStore.get("session_token")?.value;

    if (!sessionToken) {
        throw new Error("No session found");
    }

    const session: Session | undefined = await getSession(sessionToken)

    if (!session) {
        throw new Error("No session found");
    }

    await updateSession(session.id, { closed: true });

    cookiesStore.delete("session_token");

    const participant: Participant | undefined = await getParticipantById(session.participantId);

    if (!participant) {
        throw new Error("No participant found");
    }

    revalidatePath(`/events/${participant.eventId}`);
}