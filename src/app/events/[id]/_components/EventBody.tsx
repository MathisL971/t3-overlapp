"use client";

import { useState } from "react";
import type { availability, day, event, participant } from "~/server/db/schema";
import ParticipantSignInForm from "./ParticipantSignInForm";

import { Clipboard } from "flowbite-react";
import GroupAvailabilities from "./GroupAvailabilities";
import ParticipantAvailabilities from "./ParticipantAvailabilities";
import { tz } from "moment-timezone";
import { DateTime } from "luxon";

type Participant = typeof participant.$inferSelect;
type Event = typeof event.$inferSelect;

type EventBodyProps = {
  event: Event;
  participant?: Participant;
  formattedDays: any;
};

export default function EventBody(props: EventBodyProps) {
  const { event, participant, formattedDays } = props;

  // const [availabilities, setAvailabilities] = useState<Availability[]>(
  //   props.availabilities,
  // );

  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  const eventTimezone = tz(event.timezone);
  const clientTimezone = tz(timezone);
  const offset = (eventTimezone.utcOffset() - clientTimezone.utcOffset()) / 60;

  // const participantAvailabilities = availabilities.filter(
  //   (availability) => availability.participantId === participant?.id,
  // );

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

      <select
        className="text-black"
        value={timezone}
        onChange={(e) => setTimezone(e.target.value)}
      >
        {tz.names().map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      {/* {participant ? (
        <ParticipantAvailabilities
          participant={participant}
          formattedDays={formattedDays}
          timezone={timezone}
        />
      ) : (
        <ParticipantSignInForm event={event} />
      )} */}
      <GroupAvailabilities event={event} formattedDays={formattedDays} />
    </div>
  );
}
