"use client"

import { useState } from "react";
import type { availability, day, participant } from "~/server/db/schema";
import Days from "./Days";
import ParticipantSignInForm from "./ParticipantSignInForm";
import SignOutButton from "./SignOutButton";

import GroupAvailabilities from "./GroupAvailabilities";

type Participant = typeof participant.$inferSelect;
type Availability = typeof availability.$inferSelect;
type Day = typeof day.$inferSelect;

type EventBodyProps = {
    eventId: number;
    participant?: Participant;
    availabilities: Availability[];
    days: Day[];
};

export default function EventBody(
    props: EventBodyProps,
) {
    const { eventId, participant, days } = props;

    const [availabilities, setAvailabilities] = useState<Availability[]>(props.availabilities);

    const participantAvailabilities = availabilities.filter((availability) => availability.participantId === participant?.id);

    return (
        <div className="flex flex-col gap-5">
            {
                participant ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-between items-center">
                            <h4>Welcome {participant.username}!</h4>
                            <SignOutButton />
                        </div>
                        <Days
                            participant={participant}
                            days={days}
                            availabilities={participantAvailabilities}
                            setAvailabilities={setAvailabilities}
                        />
                    </div>
                ) : (
                    <ParticipantSignInForm eventId={eventId} />
                )
            }
            <GroupAvailabilities availabilities={availabilities} days={days} />
        </div>
    )
}