import type { event_participants } from "~/server/db/schema";
import AvailabilitySlotDrawer from "./AvailabilitySlotDrawer";
import type { EventDayDate } from "~/server/types";
import { getEventCols } from "~/server/queries";

type EventParticipant = typeof event_participants.$inferInsert;

type ParticipantAvailabilitiesProps = {
  participant: EventParticipant;
};

export default async function ParticipantAvailabilities(
  props: ParticipantAvailabilitiesProps,
) {
  const { participant } = props;

  const availabilityCols: EventDayDate[] | undefined = await getEventCols(
    participant.eventId!,
  );

  return (
    <div className="flex flex-col gap-1" id="grid">
      {availabilityCols.map((day) => {
        return (
          <AvailabilitySlotDrawer
            key={day.id}
            day={day}
            participant={participant}
          />
        );
      })}
    </div>
  );
}
