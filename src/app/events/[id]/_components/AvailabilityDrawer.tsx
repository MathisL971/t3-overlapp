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
import Availability from "./Availability";
import type { participant, availability, day } from "~/server/db/schema";
import { Badge } from "~/components/ui/badge";

type Day = typeof day.$inferSelect;
type Availability = typeof availability.$inferSelect;
type Participant = typeof participant.$inferSelect;

export const constructSlotGrid = (
  startHour: number,
  endHour: number,
  existingAvailabilities: Availability[],
): TemporaryAvailabilitySlot[] => {
  const slots: TemporaryAvailabilitySlot[] = [];

  for (let i = startHour; i < endHour; i++) {
    const slot1: TemporaryAvailabilitySlot = {
      id: i,
      startTime: `${i < 10 ? "0" + i : i}:00`,
      endTime: `${i < 10 ? "0" + i : i}:30`,
      savedSlotId: undefined,
    };

    const existingSlot1 = existingAvailabilities.find(
      (availability) =>
        availability.startTime === `${i < 10 ? "0" + i : i}:00:00`,
    );

    if (existingSlot1) {
      slot1.savedSlotId = existingSlot1.id;
    }

    slots.push(slot1);

    const slot2: TemporaryAvailabilitySlot = {
      id: i + 0.5,
      startTime: `${i < 10 ? "0" + i : i}:30`,
      endTime: `${i + 1 < 10 ? "0" + (i + 1) : i + 1}:00`,
      savedSlotId: undefined,
    };

    const existingSlot2 = existingAvailabilities.find(
      (availability) =>
        availability.startTime === `${i < 10 ? "0" + i : i}:30:00`,
    );

    if (existingSlot2) {
      slot2.savedSlotId = existingSlot2.id;
    }

    slots.push(slot2);
  }

  return slots;
};

export type TemporaryAvailabilitySlot = {
  id: number;
  startTime: string;
  endTime: string;
  savedSlotId: number | undefined;
};

type AvailabilityDrawerProps = {
  participant: Participant;
  day: Day;
  availabilities: Availability[];
  setAvailabilities: (
    availabilities: Availability[] | ((prev: Availability[]) => Availability[]),
  ) => void;
};

export default function AvailabilityDrawer(props: AvailabilityDrawerProps) {
  const { participant, day, availabilities, setAvailabilities } = props;

  const startHour = new Date(
    new Date().toDateString() + " " + day.startTime,
  ).getHours();
  const endHour = new Date(
    new Date().toDateString() + " " + day.endTime,
  ).getHours();
  const middleHour = Math.floor((endHour - startHour) / 2) + startHour;

  const firstHalf = constructSlotGrid(
    startHour,
    middleHour,
    availabilities.filter((availability) => {
      const startTime = availability.startTime.split(":")[0];
      return parseInt(startTime!) < middleHour;
    }),
  );
  const secondHalf = constructSlotGrid(
    middleHour,
    endHour,
    availabilities.filter((availability) => {
      const startTime = availability.startTime.split(":")[0];
      return parseInt(startTime!) >= middleHour;
    }),
  );

  const title =
    day.type === "date"
      ? new Date(day.date!).toLocaleString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      : day.day!.toUpperCase()[0] + day.day!.slice(1);

  return (
    <Drawer key={day.id}>
      <DrawerTrigger className="flex flex-row items-center justify-between rounded-md border bg-slate-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-700">
        <p className="m-0">{title}</p>
        <Badge variant={"secondary"}>
          {firstHalf.filter((slot) => slot.savedSlotId).length +
            secondHalf.filter((slot) => slot.savedSlotId).length}
        </Badge>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="m-0 text-center">{title}</DrawerTitle>
          <DrawerDescription className="text-center">
            Select your availabilities
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-row gap-5 px-3 py-1">
          <div className="flex flex-grow flex-col gap-2">
            <div className="flex flex-col gap-1">
              {firstHalf.map((slot) => {
                return (
                  <Availability
                    key={slot.id}
                    participant={participant}
                    day={day}
                    slot={slot}
                    setAvailabilities={setAvailabilities}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex flex-grow flex-col gap-2">
            <div className="flex flex-col gap-1">
              {secondHalf.map((slot) => {
                return (
                  <Availability
                    key={slot.id}
                    participant={participant}
                    day={day}
                    slot={slot}
                    setAvailabilities={setAvailabilities}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <DrawerFooter className="flex flex-row justify-center">
          <DrawerClose
            role="button"
            className="rounded-md border bg-red-500 px-8 py-2 hover:bg-red-400"
          >
            Close
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
