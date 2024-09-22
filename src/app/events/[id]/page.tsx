import { cookies } from "next/headers";
import type {
  availability,
  day,
  event,
  participant,
  session,
} from "~/server/db/schema";
import { getAvailabilitiesByEvent } from "~/server/queries/availabilities";
import { getSession } from "~/server/queries/sessions";
import {
  getParticipantById,
  getParticipantsByEvent,
} from "~/server/queries/participants";
import { getEventDays } from "~/server/queries/days";
import EventBody from "./_components/EventBody";
import { getEvent } from "~/server/queries/events";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

import { DateTime } from "luxon";

type Session = typeof session.$inferSelect;
type Participant = typeof participant.$inferSelect;
type Event = typeof event.$inferSelect;
type Day = typeof day.$inferSelect;
type Availability = typeof availability.$inferSelect;

type FormattedDays = Record<string, FormattedDay>;

type FormattedDay = {
  day: Day;
  date: DateTime;
  slots: Record<string, Availability[]>;
};

// week day to day number (0-6)
const dayToNumber = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

const formatAvailabilities = (
  days: Day[],
  availabilities: Availability[],
  participants: Participant[],
) => {
  let formattedDays: FormattedDays = {};

  for (const day of days) {
    let dt;
    if (day.type === "date") {
      dt = DateTime.fromJSDate(day.date);
    } else if (day.type === "day") {
      dt = DateTime.fromObject({
        weekDay: dayToNumber[day.day],
      });
    }

    const timeSlotDuration = 30;
    const startTime: DateTime = DateTime.fromObject({
      hour: Number(day.startTime.split(":")[0]),
      minute: Number(day.startTime.split(":")[1]),
    });
    const endTime = DateTime.fromObject({
      hour: Number(day.endTime.split(":")[0]),
      minute: Number(day.endTime.split(":")[1]),
    });

    const dayAvailabilities = availabilities.filter(
      (availability) => availability.dayId === day.id,
    );
    const slots = {};

    for (
      let time = startTime;
      time < endTime;
      time = time.plus({ minutes: timeSlotDuration })
    ) {
      slots[time.toFormat("HH:mm")] = dayAvailabilities.filter(
        (availability) => {
          const start = DateTime.fromObject({
            hour: Number(availability.startTime.split(":")[0]),
            minute: Number(availability.startTime.split(":")[1]),
          });

          return time.equals(start);
        },
      );
    }

    formattedDays[dt.toFormat("yyyy-MM-dd")] = {
      day,
      slots,
    };
  }

  // sort formatted days
  formattedDays = Object.fromEntries(
    Object.entries(formattedDays).sort(([a], [b]) => {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    }),
  );

  console.log(formattedDays);
  return formattedDays;
};

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const event: Event | undefined = await getEvent(Number(id));

  if (!event) {
    throw new Error("Event not found");
  }

  let eventParticipant: Participant | undefined = undefined;

  const cookieStore = cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (sessionToken) {
    const session: Session | undefined = await getSession(sessionToken);

    if (session && !session.closed) {
      const participant: Participant | undefined = await getParticipantById(
        session.participantId,
      );

      if (participant && participant.eventId === event.id) {
        eventParticipant = participant;
      }
    }
  }

  const days = await getEventDays(event.id);
  const availabilities = await getAvailabilitiesByEvent(event.id);
  const participants = await getParticipantsByEvent(event.id);

  const formattedDays = formatAvailabilities(
    days,
    availabilities,
    participants,
  );

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{event.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="m-0">{event.title}</h1>

      <EventBody
        event={event}
        participant={eventParticipant}
        formattedDays={formattedDays}
      />
    </div>
  );
}
