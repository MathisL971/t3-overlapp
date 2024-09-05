"use client";

import { useState } from "react";
import type { availability, day, event, participant } from "~/server/db/schema";
import ParticipantSignInForm from "./ParticipantSignInForm";

import { Clipboard } from "flowbite-react";
import GroupAvailabilities from "./GroupAvailabilities";
import ParticipantAvailabilities from "./ParticipantAvailabilities";

type Participant = typeof participant.$inferSelect;
type Event = typeof event.$inferSelect;
type Availability = typeof availability.$inferSelect;
type Day = typeof day.$inferSelect;

type EventBodyProps = {
  event: Event;
  availabilities: Availability[];
  days: Day[];
  participant?: Participant;
  participants: Participant[];
};

export default function EventBody(props: EventBodyProps) {
  const { event, participant, days, participants } = props;

  const [availabilities, setAvailabilities] = useState<Availability[]>(
    props.availabilities,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="relative rounded-md">
        <input
          id="npm-install"
          type="text"
          className="col-span-6 block w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-4 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:placeholder:text-slate-400"
          value={`http://localhost:3000/events/${event.id}`}
          disabled
          readOnly
        />
        <Clipboard.WithIconText
          className="bg-slate-50 dark:bg-slate-700"
          valueToCopy={`http://localhost:3000/events/${event.id}`}
        />
      </div>
      {participant ? (
        <ParticipantAvailabilities
          participant={participant}
          availabilities={availabilities}
          days={days}
          setAvailabilities={setAvailabilities}
        />
      ) : (
        <ParticipantSignInForm event={event} />
      )}
      <GroupAvailabilities
        availabilities={availabilities}
        days={days}
        participants={participants}
      />
    </div>
  );
}
