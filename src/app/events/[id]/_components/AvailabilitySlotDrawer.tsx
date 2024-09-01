"use client";

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
import AvailabilitySlot from "./AvailabilitySlot";
import type {
  availability_slots,
  event_participants,
} from "~/server/db/schema";
import { getAvailabilitySlot } from "~/server/queries";
import type { EventDayDate } from "~/server/types";
import { useState } from "react";

type EventParticipant = typeof event_participants.$inferInsert;

type AvailabilitySlot = typeof availability_slots.$inferInsert;

type TemporaryAvailabilitySlot = {
  id: number;
  startTime: string;
  endTime: string;
};

type AvailabilitySlotDrawerProps = {
  day: EventDayDate;
  participant: EventParticipant;
};

const constructSlotGrid = (
  startHour: number,
  endHour: number,
): TemporaryAvailabilitySlot[] => {
  const slots: TemporaryAvailabilitySlot[] = [];

  for (let i = startHour; i < endHour; i++) {
    slots.push({
      id: i,
      startTime: `${i}:00`,
      endTime: `${i}:30`,
    });

    slots.push({
      id: i + 0.5,
      startTime: `${i}:30`,
      endTime: `${i + 1}:00`,
    });
  }

  return slots;
};

export default function AvailabilitySlotDrawer(
  props: AvailabilitySlotDrawerProps,
) {
  const { day, participant } = props;

  const startHour = new Date(
    new Date().toDateString() + " " + day.startTime,
  ).getHours();
  const endHour = new Date(
    new Date().toDateString() + " " + day.endTime,
  ).getHours();
  const middleHour = Math.floor((endHour - startHour) / 2) + startHour;

  const [firstHalf, setFirstHalf] = useState<TemporaryAvailabilitySlot[]>(
    constructSlotGrid(startHour, middleHour),
  );
  const [secondHalf, setSecondHalf] = useState<TemporaryAvailabilitySlot[]>(
    constructSlotGrid(middleHour, endHour),
  );

  const title =
    day.type === "date" && day.date
      ? day.date.toLocaleDateString()
      : day.day
        ? day.day?.charAt(0).toUpperCase() + day.day?.slice(1)
        : "";

  return (
    <Drawer key={day.id}>
      <DrawerTrigger className="rounded-md border py-2">{title}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">{title}</DrawerTitle>
          <DrawerDescription className="text-center">
            Select your availabilities
          </DrawerDescription>
          <div className="my-1 flex flex-row gap-5 px-3">
            <div className="flex flex-grow flex-col gap-2">
              <div className="flex flex-col gap-1">
                {firstHalf.map(async (slot) => {
                  const savedSlot: AvailabilitySlot | undefined =
                    await getAvailabilitySlot(
                      participant.id!,
                      day.id,
                      slot.startTime,
                      slot.endTime,
                    );

                  return (
                    <AvailabilitySlot
                      key={slot.id}
                      participant={participant}
                      dayId={day.id}
                      startTime={slot.startTime}
                      endTime={slot.endTime}
                      savedSlot={savedSlot}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex flex-grow flex-col gap-2">
              <div className="flex flex-col gap-1">
                {secondHalf.map(async (slot) => {
                  const savedSlot: AvailabilitySlot | undefined =
                    await getAvailabilitySlot(
                      participant.id!,
                      day.id,
                      slot.startTime,
                      slot.endTime,
                    );

                  return (
                    <AvailabilitySlot
                      key={slot.id}
                      participant={participant}
                      dayId={day.id}
                      startTime={slot.startTime}
                      endTime={slot.endTime}
                      savedSlot={savedSlot}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </DrawerHeader>
        <DrawerFooter className="flex flex-row justify-center">
          <DrawerClose role="button" className="rounded-md border px-8 py-2">
            Close
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
