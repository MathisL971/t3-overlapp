"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createAvailabilitySlot, deleteAvailabilitySlot } from "~/app/actions";
import { Button } from "~/components/ui/button";
import type {
  availability_slots,
  event_participants,
} from "~/server/db/schema";

type AvailabilitySlot = typeof availability_slots.$inferInsert;
type EventParticipant = typeof event_participants.$inferInsert;

type AvailabilitySlotProps = {
  participant: EventParticipant;
  dayId: number;
  startTime: string;
  endTime: string;
  savedSlot: AvailabilitySlot | undefined;
};

export default function AvailabilitySlot(props: AvailabilitySlotProps) {
  const [savedSlot, setSavedSlot] = useState(props.savedSlot);

  const handleSlotClick = async () => {
    try {
      if (savedSlot) {
        if (savedSlot.id === undefined) {
          throw new Error("Saved slot is missing an ID");
        }

        await deleteAvailabilitySlot(savedSlot.id);
        setSavedSlot(undefined);
      } else {
        const createdAvailabilitySlot: AvailabilitySlot =
          await createAvailabilitySlot(
            props.dayId,
            props.startTime,
            props.endTime,
            props.participant,
          );

        setSavedSlot(createdAvailabilitySlot);
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
      variant={savedSlot ? "default" : "outline"}
      onClick={handleSlotClick}
    >
      {props.startTime} - {props.endTime}
    </Button>
  );
}
