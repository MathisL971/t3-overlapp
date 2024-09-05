import { cookies } from "next/headers";
import type { event, participant, session } from "~/server/db/schema";
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

  const availabilities = await getAvailabilitiesByEvent(event.id);
  const days = await getEventDays(event.id);
  const participants = await getParticipantsByEvent(event.id);

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
        availabilities={availabilities}
        days={days}
        participants={participants}
      />
    </div>
  );
}
