"use server";

import { redirect } from "next/navigation";
import type { z } from "zod";
import type { NewEventFormSchema } from "../_components/NewEventForm";
import type { day, event } from "~/server/db/schema";
import { getEvent, insertEvent } from "~/server/queries/events";
import { insertDays } from "~/server/queries/days";

type Event = typeof event.$inferSelect;
type InsertEvent = typeof event.$inferInsert;
type InsertDay = typeof day.$inferInsert;

export async function fetchEvent(id: number) {
  return await getEvent(id);
}

export async function createEvent(
  formData: z.infer<typeof NewEventFormSchema>,
) {
  const newEvent: InsertEvent = {
    title: formData.title,
    timezone: formData.timezone,
    type: formData.type,
  };

  const createdEvent: Event | undefined = await insertEvent(newEvent);

  if (!createdEvent) {
    throw new Error("Failed to create event");
  }

  const formDays = formData.type === "dates" ? formData.dates : formData.days;

  const newEventDays: InsertDay[] = [];

  for (const day of formDays) {
    newEventDays.push({
      eventId: createdEvent.id,
      type: formData.type === "dates" ? "date" : "day",
      day:
        formData.type === "dates"
          ? undefined
          : (day as
              | "sunday"
              | "monday"
              | "tuesday"
              | "wednesday"
              | "thursday"
              | "friday"
              | "saturday"),
      // @ts-expect-error - This is a hack to get around the fact that the type of `day` is not inferred correctly
      date: formData.type === "dates" ? (day as Date) : undefined,
      startTime: "09:00",
      endTime: "17:00",
    });
  }

  await insertDays(newEventDays);

  redirect(`/events/${createdEvent.id}`);
}
