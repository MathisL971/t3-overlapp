"use client";

import type { availability, day, participant } from "~/server/db/schema";
import AvailabilityDrawer from "./AvailabilityDrawer";

type Day = typeof day.$inferSelect;
type Participant = typeof participant.$inferSelect;
type Availability = typeof availability.$inferSelect;

export type DaysProps = {
  participant: Participant;
  days: Day[];
  availabilities: Availability[];
  setAvailabilities: (
    availabilities: Availability[] | ((prev: Availability[]) => Availability[]),
  ) => void;
};

export default function Days(props: DaysProps) {
  const { participant, days, availabilities, setAvailabilities } = props;

  return (
    <div className="flex flex-col gap-1" id="grid">
      {days.map((day) => {
        return (
          <AvailabilityDrawer
            key={day.id}
            day={day}
            participant={participant}
            availabilities={availabilities.filter(
              (availability) => availability.dayId === day.id,
            )}
            setAvailabilities={setAvailabilities}
          />
        );
      })}
    </div>
  );
}
