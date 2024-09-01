import {
  getEvent,
  getEventParticipantById,
  getSession,
} from "~/server/queries";
import ParticipantSignInForm from "./_components/ParticipantSignInForm";
import { cookies } from "next/headers";
import SignOutButton from "./_components/SignOutButton";
import type { event_participants, sessions } from "~/server/db/schema";
import ParticipantAvailabilities from "./_components/ParticipantAvailabilities";
import { Button } from "~/components/ui/button";

type Session = typeof sessions.$inferInsert;
type EventParticipant = typeof event_participants.$inferInsert;

export default async function EventPage({
  params,
}: {
  params: { id: number };
}) {
  const { id } = params;

  const event = await getEvent(id);

  if (!event) {
    return (
      <div>
        <h1>Event not found</h1>
        <p className="mt-2">The event you are looking for does not exist.</p>
        <a href="/">
          <Button type="button" className="mt-4">
            Back to events
          </Button>
        </a>
      </div>
    );
  }

  const cookieStore = cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return (
      <div className="flex flex-col gap-4">
        <h1>{event.title}</h1>
        <ParticipantSignInForm eventId={event.id} />
      </div>
    );
  }

  const session: Session | undefined = await getSession(sessionToken);

  if (!session) {
    cookieStore.set("session_token", "", { expires: new Date(0) });
    return (
      <div className="flex flex-col gap-4">
        <h1>{event.title}</h1>
        <ParticipantSignInForm eventId={event.id} />
      </div>
    );
  }

  const participant: EventParticipant | undefined =
    await getEventParticipantById(session.participantId!);

  if (!participant) {
    cookieStore.set("session_token", "", { expires: new Date(0) });
    return (
      <div className="flex flex-col gap-4">
        <h1>{event.title}</h1>
        <ParticipantSignInForm eventId={event.id} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between align-middle">
        <h1>{event.title}</h1>
        <SignOutButton />
      </div>

      <ParticipantAvailabilities participant={participant} />
    </div>
  );
}
