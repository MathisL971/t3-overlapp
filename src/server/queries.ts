import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  event_dates,
  event_days,
  events,
  event_participants,
  availability_slots,
  sessions,
} from "./db/schema";
import type {
  EventDayDate,
  NewAvailabilitySlot,
  NewEvent,
  NewEventDate,
  NewEventDay,
  NewEventParticipant,
} from "./types";

export async function insertEvent(newEvent: NewEvent) {
  return await db.insert(events).values(newEvent).returning();
}

export async function insertEventDates(newEventDates: NewEventDate[]) {
  return await db.insert(event_dates).values(newEventDates).returning();
}

export async function insertEventDays(eventDays: NewEventDay[]) {
  return await db.insert(event_days).values(eventDays).returning();
}

export async function getEvent(id: number) {
  return await db.query.events.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  });
}

export async function getEventDates(eventId: number) {
  return await db.query.event_dates.findMany({
    where: (model, { eq }) => eq(model.eventId, eventId),
  });
}

export async function getEventDays(eventId: number) {
  return await db.query.event_days.findMany({
    where: (model, { eq }) => eq(model.eventId, eventId),
  });
}

export async function getEventCols(eventId: number) {
  const event = await getEvent(eventId);

  if (event?.type === "specific-dates") {
    const eventDates = await getEventDates(eventId);
    const eventCols: EventDayDate[] = eventDates.map((eventDate) => ({
      ...eventDate,
      type: "date",
      day: undefined,
    }));
    return eventCols;
  } else {
    const eventDays = await getEventDays(eventId);
    const eventCols: EventDayDate[] = eventDays.map((eventDay) => ({
      ...eventDay,
      type: "day",
      date: undefined,
    }));
    return eventCols;
  }
}

export async function getEventParticipant(eventId: number, username: string) {
  return await db.query.event_participants.findFirst({
    where: (model, { eq }) =>
      eq(model.eventId, eventId) && eq(model.username, username),
  });
}

export async function getEventParticipantById(participantId: number) {
  return await db.query.event_participants.findFirst({
    where: (model, { eq }) => eq(model.id, participantId),
  });
}

export async function insertEventParticipant(
  newEventParticipant: NewEventParticipant,
) {
  return await db
    .insert(event_participants)
    .values(newEventParticipant)
    .returning();
}

export async function insertAvailabilitySlots(
  participantId: number,
  slots: object[],
) {
  const newSlots = slots.map((slot) => ({
    participantId,
    ...slot,
  }));

  return await db.insert(availability_slots).values(newSlots).returning();
}

export async function insertAvailabilitySlot(
  availabilitySlot: NewAvailabilitySlot,
) {
  return await db
    .insert(availability_slots)
    .values(availabilitySlot)
    .returning();
}

export async function removeAvailabilitySlot(slotId: number) {
  return await db
    .delete(availability_slots)
    .where(eq(availability_slots.id, slotId));
}

export async function getAvailabilitySlots(participantId: number) {
  return await db.query.availability_slots.findMany({
    where: (model, { eq }) => eq(model.participantId, participantId),
  });
}

export async function getAvailabilitySlot(
  participantId: number,
  dayId: number,
  startTime: string,
  endTime: string,
) {
  return await db.query.availability_slots.findFirst({
    where: (model, { eq }) =>
      eq(model.participantId, participantId) &&
      eq(model.dayId, dayId) &&
      eq(model.startTime, startTime) &&
      eq(model.endTime, endTime),
  });
}

export async function insertSession(
  participantId: number,
  sessionToken: string,
) {
  return await db
    .insert(sessions)
    .values({ participantId, token: sessionToken });
}

export async function getSession(token: string) {
  return await db.query.sessions.findFirst({
    where: (model, { eq }) => eq(model.token, token),
  });
}
