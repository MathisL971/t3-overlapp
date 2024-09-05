"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import type { availability, day, participant } from "~/server/db/schema";
import { useState } from "react";

type Availability = typeof availability.$inferSelect;
type Day = typeof day.$inferSelect;
type Participant = typeof participant.$inferSelect;

type GroupAvailabilitiesProps = {
  availabilities: Availability[];
  days: Day[];
  participants: Participant[];
};

const constructSlotGrid = (days: Day[]) => {
  const minStartTime = days.reduce((min, day) => {
    const startTime = day.startTime;
    return startTime < min ? startTime : min;
  }, days[0]!.startTime);

  const maxEndTime = days.reduce((max, day) => {
    const endTime = day.endTime;
    return endTime > max ? endTime : max;
  }, days[0]!.endTime);

  const startHour = new Date(
    new Date().toDateString() + " " + minStartTime,
  ).getHours();
  const endHour = new Date(
    new Date().toDateString() + " " + maxEndTime,
  ).getHours();

  const slots = [];

  for (let i = startHour; i < endHour; i++) {
    const slot1 = {
      id: i,
      startTime: `${i < 10 ? "0" + i : i}:00:00`,
      endTime: `${i < 10 ? "0" + i : i}:30:00`,
      savedSlotId: undefined,
    };
    slots.push(slot1);

    const slot2 = {
      id: i + 0.5,
      startTime: `${i < 10 ? "0" + i : i}:30:00`,
      endTime: `${i + 1 < 10 ? "0" + (i + 1) : i + 1}:00:00`,
      savedSlotId: undefined,
    };

    slots.push(slot2);
  }

  return slots;
};

const constructColorsRecord = (availabilities: Availability[]) => {
  const counts: Record<string, number> = {};
  for (const availability of availabilities) {
    const key = availability.dayId + "-" + availability.startTime;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const countsValuesSet = new Set(Object.values(counts));
  const countsValues = Array.from(countsValuesSet).sort((a, b) => a - b);
  const colors: Record<number, string> = {};
  for (let i = 0; i < countsValues.length; i++) {
    const count = countsValues[i] ?? 0;
    colors[count] = `rgba(0, 255, 0, ${1 - (countsValues.length / 55) * i})`;
  }
  colors[0] = "transparent";

  return colors;
};

export default function GroupAvailabilities(props: GroupAvailabilitiesProps) {
  const { availabilities, days, participants } = props;

  const colors = constructColorsRecord(availabilities);
  const numCols = Math.min(4, days.length);

  const [displayedDays, setDisplayedDays] = useState<Day[]>(
    days.slice(0, numCols),
  );

  const slots = constructSlotGrid(displayedDays);

  return (
    <div className="col-span-6 block space-y-4 rounded-md border border-slate-300 bg-slate-50 p-5 dark:border-slate-600 dark:bg-slate-900 dark:placeholder:text-slate-400">
      <div className="flex flex-col gap-1">
        <div className="flex flex-row items-center justify-between">
          <h5 className="m-0">Group Availabilities</h5>
          {days.length > numCols && (
            <div className="flex flex-row gap-1">
              <Button
                disabled={displayedDays[0]!.id === days[0]!.id}
                onClick={() => {
                  const indexOfCurrentFirst = days.findIndex(
                    (day) => day.id === displayedDays[0]!.id,
                  );
                  setDisplayedDays(
                    days.slice(
                      indexOfCurrentFirst - 1,
                      indexOfCurrentFirst + numCols - 1,
                    ),
                  );
                }}
              >
                {"<"}
              </Button>
              <Button
                disabled={
                  displayedDays[numCols - 1]!.id === days[days.length - 1]!.id
                }
                onClick={() => {
                  const indexOfCurrentFirst = days.findIndex(
                    (day) => day.id === displayedDays[0]!.id,
                  );
                  setDisplayedDays(
                    days.slice(
                      indexOfCurrentFirst + 1,
                      indexOfCurrentFirst + numCols + 1,
                    ),
                  );
                }}
              >
                {">"}
              </Button>
            </div>
          )}
        </div>
        <p
          style={{
            fontSize: "0.8rem",
            color: "#94a3b8",
          }}
        >
          {
            "Select any slot with the information icon to view the participants' availabilities."
          }
        </p>
      </div>

      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead
              className="text-center"
              style={{
                width: "20%",
              }}
            >
              Time
            </TableHead>
            {displayedDays.slice(0, numCols).map((day) => (
              <TableHead key={day.id} className="text-center">
                {day.type === "date"
                  ? new Date(day.date!)
                      .toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                      .toUpperCase()
                  : day.day!.toUpperCase()[0] + day.day!.slice(1, 3)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {slots.map((slot) => (
            <TableRow key={slot.id} className="text-center">
              <TableCell className="flex flex-row justify-center p-1 text-xs">
                {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
              </TableCell>
              {displayedDays.slice(0, numCols).map((day) => {
                const dayAvailabilities = availabilities.filter(
                  (availability) => availability.dayId === day.id,
                );
                const slotAvailabilities = dayAvailabilities.filter(
                  (availability) => availability.startTime === slot.startTime,
                );

                const availableParticipants = slotAvailabilities.map((a) => {
                  return participants.find((p) => p.id === a.participantId);
                });

                const unavailableParticipants = participants.filter(
                  (p) => !availableParticipants.includes(p),
                );

                return (
                  <TableCell
                    key={day.id}
                    className="p-1"
                    style={{
                      backgroundColor: colors[slotAvailabilities.length],
                    }}
                  >
                    <Dialog>
                      <DialogTrigger
                        style={{
                          cursor:
                            slotAvailabilities.length > 0
                              ? "pointer"
                              : "default",
                        }}
                      >
                        {slotAvailabilities.length > 0 && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                            />
                          </svg>
                        )}
                      </DialogTrigger>
                      <DialogContent className="w-4/5 rounded-md">
                        <DialogHeader>
                          <DialogTitle className="m-0 px-4 text-center">
                            {day.type === "date"
                              ? new Date(day.date!).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )
                              : day.day!.toUpperCase()}
                            {" @ "}
                            {slot.startTime.slice(0, 5)}
                          </DialogTitle>
                          <DialogDescription className="px-4 text-center">
                            {availableParticipants.length} participant
                            {availableParticipants.length > 1 && "s"} available
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-row">
                          <div className="flex flex-grow flex-col items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="green"
                              className="mb-2 size-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                              />
                            </svg>
                            <div className="flex flex-col gap-1">
                              {availableParticipants.map((p) => {
                                return (
                                  <p className="text-center" key={p?.id}>
                                    {p?.username}
                                  </p>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-grow flex-col items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="red"
                              className="mb-2 size-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                              />
                            </svg>{" "}
                            <div className="flex flex-col gap-1">
                              {unavailableParticipants.map((p) => {
                                return (
                                  <p className="text-center" key={p.id}>
                                    {p.username}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
