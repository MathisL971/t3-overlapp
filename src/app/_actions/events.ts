"use server";

import { redirect } from "next/navigation";
import type { z } from "zod";
import type { NewEventFormSchema } from "../_components/NewEventForm";
import type {
    NewEvent,
    NewEventDay,
} from "~/server/types";
import type { event } from "~/server/db/schema";
import { getEvent, insertEvent } from "~/server/queries/events";
import { insertDays } from "~/server/queries/days";

type Event = typeof event.$inferSelect;

export async function fetchEvent(id: number) {
    return await getEvent(id);
}

export async function createEvent(
    formData: z.infer<typeof NewEventFormSchema>,
) {
    const newEvent: NewEvent = {
        title: formData.title,
        timezone: formData.timezone,
        type: formData.type,
    };

    const createdEvent: Event | undefined = await insertEvent(newEvent);

    if (!createdEvent) {
        throw new Error("Failed to create event");
    }

    const formDays = formData.type === "dates" ? formData.dates : formData.days;

    const newEventDays: NewEventDay[] = []

    for (const day of formDays) {
        newEventDays.push({
            eventId: createdEvent.id,
            type: formData.type === "dates" ? "date" : "day",
            day: formData.type === "dates" ? undefined : day as ('sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'),
            date: formData.type === "dates" ? day as Date : undefined,
            startTime: "09:00",
            endTime: "17:00",
        });
    }

    await insertDays(newEventDays);

    redirect(`/events/${createdEvent.id}`);
}
