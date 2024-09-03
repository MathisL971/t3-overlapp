import { cookies } from "next/headers";
import type { participant, session } from "~/server/db/schema";
import { getAvailabilitiesByEvent } from "~/server/queries/availabilities";
import { getSession } from "~/server/queries/sessions";
import { getParticipantById } from "~/server/queries/participants";
import { getEventDays } from "~/server/queries/days";
import EventBody from "./_components/EventBody";

type Session = typeof session.$inferSelect;
type Participant = typeof participant.$inferSelect;

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  let eventParticipant: Participant | undefined = undefined;

  const cookieStore = cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (sessionToken) {
    const session: Session | undefined = await getSession(sessionToken);

    if (session && !session.closed) {
      const participant: Participant | undefined =
        await getParticipantById(session.participantId);

      if (participant && participant.eventId === Number(id)) {
        eventParticipant = participant;
      }
    }
  }

  const availabilities = await getAvailabilitiesByEvent(Number(id));
  const days = await getEventDays(Number(id));

  return (
    <EventBody
      eventId={Number(id)}
      participant={eventParticipant}
      availabilities={availabilities}
      days={days}
    />
  );
}


