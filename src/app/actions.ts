"use server";

import { redirect } from "next/navigation";
import {
  getEvent,
  getEventParticipant,
  insertAvailabilitySlot,
  insertEvent,
  insertEventDates,
  insertEventDays,
  insertEventParticipant,
  insertSession,
  removeAvailabilitySlot,
} from "~/server/queries";

import type { z } from "zod";
import type { NewEventFormSchema } from "./_components/NewEventForm";
import type {
  NewAvailabilitySlot,
  NewEvent,
  NewEventDate,
  NewEventDay,
  NewEventParticipant,
} from "~/server/types";
import type { ParticipantSignInFormSchema } from "./events/[id]/_components/ParticipantSignInForm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { event_participants } from "~/server/db/schema";

type EventParticipant = typeof event_participants.$inferInsert;

export async function createEvent(
  formData: z.infer<typeof NewEventFormSchema>,
) {
  const newEvent: NewEvent = {
    title: formData.title,
    timezone: formData.timezone,
    type: formData.type,
  };
  const events = await insertEvent(newEvent);

  if (events.length === 0 || !events[0]) {
    throw new Error("Failed to create event");
  }

  const createdEvent = events[0];

  if (createdEvent.type === "specific-dates") {
    const newEventDates: NewEventDate[] = formData.dates.map((date) => ({
      eventId: createdEvent.id,
      date: date.toISOString(),
      startTime: "09:00",
      endTime: "17:00",
    }));
    await insertEventDates(newEventDates);
  } else {
    const newEventDays: NewEventDay[] = formData.days.map((day) => ({
      eventId: createdEvent.id,
      day,
      startTime: "09:00",
      endTime: "17:00",
    }));
    await insertEventDays(newEventDays);
  }

  redirect(`/events/${createdEvent.id}`);
}

export async function signInParticipant(
  eventId: number,
  data: z.infer<typeof ParticipantSignInFormSchema>,
) {
  let participant = await getEventParticipant(eventId, data.username);

  if (!participant) {
    const newEventParticipant: NewEventParticipant = {
      eventId,
      username: data.username,
      password: data.password,
      rememberMe: data.rememberMe,
    };

    const result = await insertEventParticipant(newEventParticipant);
    participant = result[0];

    if (!participant) {
      throw new Error("Failed to sign in. No participant found.");
    }
  } else {
    if (participant.password !== data.password) {
      throw new Error("Invalid password");
    }
  }

  if (!participant) {
    throw new Error("Failed to sign in. No participant found.");
  }

  const cookieStore = cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    throw new Error("Failed to sign in. No session token found.");
  }

  await insertSession(participant.id, sessionToken);

  revalidatePath(`/events/${eventId}`);
}

export async function createAvailabilitySlot(
  colId: number,
  startTime: string,
  endTime: string,
  participant: EventParticipant,
) {
  if (!participant ?? !participant?.id ?? !participant?.eventId) {
    throw new Error("Invalid participant");
  }

  const event = await getEvent(participant.eventId);

  if (!event) {
    throw new Error("Invalid event");
  }

  let newAvailabilitySlot: NewAvailabilitySlot;

  if (event.type === "dotw") {
    newAvailabilitySlot = {
      participantId: participant.id,
      dayId: colId,
      dateId: undefined,
      startTime,
      endTime,
    };
  } else {
    newAvailabilitySlot = {
      participantId: participant.id,
      dateId: colId,
      dayId: undefined,
      startTime,
      endTime,
    };
  }

  const result = await insertAvailabilitySlot(newAvailabilitySlot);

  if (!result[0]) {
    throw new Error("Failed to create availability slot");
  }

  return result[0];
}

export async function deleteAvailabilitySlot(slotId: number) {
  await removeAvailabilitySlot(slotId);
}
