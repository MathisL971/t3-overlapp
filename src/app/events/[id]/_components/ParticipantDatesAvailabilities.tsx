"use client";

import type {
  availability_slots,
  event_dates,
  event_participants,
} from "~/server/db/schema";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";

type EventDate = typeof event_dates.$inferInsert;
type AvailabilitySlot = typeof availability_slots.$inferInsert;
type EventParticipant = typeof event_participants.$inferInsert;

type ParticipantDatesAvailabilitiesProps = {
  participant: EventParticipant;
  availabilityDates: EventDate[];
  availabilitySlots: AvailabilitySlot[];
};

export default function ParticipantDatesAvailabilities(
  props: ParticipantDatesAvailabilitiesProps,
) {
  return (
    <div className="flex flex-col gap-1" id="grid">
      {props.availabilityDates.map((date) => {
        const dateObj = new Date(date.date);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });

        return (
          <Drawer key={date.id}>
            <DrawerTrigger className="rounded-md border py-2">
              {formattedDate}
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle className="text-center">
                  {formattedDate}
                </DrawerTitle>
                <DrawerDescription className="text-center">
                  Select your availabilities
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Button>Submit</Button>
                <DrawerClose>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        );
      })}
    </div>
  );
}
