"use client";

import { toast } from "sonner";
import {
  createAvailability,
  deleteAvailabilitySlot,
} from "~/app/_actions/availabilities";
import { Button } from "~/components/ui/button";
import type { availability, day, participant } from "~/server/db/schema";
import type { TemporaryAvailabilitySlot } from "./AvailabilityDrawer";

type Availability = typeof availability.$inferSelect;
type Participant = typeof participant.$inferSelect;
type Day = typeof day.$inferSelect;

type InsertAvailability = typeof availability.$inferInsert;

type AvailabilitySlotProps = {
  participant: Participant;
  day: Day;
  slot: TemporaryAvailabilitySlot;
  setAvailabilities: (
    availabilities: Availability[] | ((prev: Availability[]) => Availability[]),
  ) => void;
};

export default function Availability(props: AvailabilitySlotProps) {
  const { participant, day, slot, setAvailabilities } = props;

  const handleSlotClick = async () => {
    try {
      if (slot.savedSlotId) {
        await deleteAvailabilitySlot(slot.savedSlotId);
        setAvailabilities((prev) =>
          prev.filter((availability) => availability.id !== slot.savedSlotId),
        );
      } else {
        const newAvailability: InsertAvailability = {
          participantId: participant.id,
          dayId: day.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
        };

        const createdAvailability: Availability =
          await createAvailability(newAvailability);
        setAvailabilities((prev) => [
          ...prev,
          {
            ...createdAvailability,
            participant,
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          "An error occurred while selecting the slot. Please try again.",
        );
      }
    }
  };

  return (
    <Button
      variant={slot.savedSlotId ? "default" : "outline"}
      onClick={handleSlotClick}
    >
      {props.slot.startTime} - {props.slot.endTime}
    </Button>
  );
}
