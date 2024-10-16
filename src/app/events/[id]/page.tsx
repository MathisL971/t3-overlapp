import { cookies } from "next/headers";
import type { day, event, participant, session } from "~/server/db/schema";
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

type Session = typeof session.$inferSelect;
type Participant = typeof participant.$inferSelect;
type Event = typeof event.$inferSelect;
type Day = typeof day.$inferSelect;

export type PopulatedAvailability = {
  id: number;
  startTime: string;
  endTime: string;
  day: Day;
  participant: Participant;
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
  const participants = await getParticipantsByEvent(event.id);
  const availabilities = await getAvailabilitiesByEvent(event.id);

  const populatedAvailabilities: PopulatedAvailability[] = availabilities.map(
    ({ id, startTime, endTime, participantId, dayId }) => {
      const participant = participants.find((p) => p.id === participantId);
      const day = days.find((d) => d.id === dayId);
      return {
        id,
        startTime,
        endTime,
        participant: participant!,
        day: day!,
      };
    },
  );

  return (
    <div className="flex flex-col gap-6">
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
        days={days}
        participants={participants}
        availabilities={populatedAvailabilities}
      />
    </div>
  );
}
