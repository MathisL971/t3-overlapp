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
import type { availability, day, event } from "~/server/db/schema";
import { useState } from "react";

type Availability = typeof availability.$inferSelect;
type Day = typeof day.$inferSelect;
type Event = typeof event.$inferSelect;

type GroupAvailabilitiesProps = {
  event: Event;
  formattedDays: any;
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
  const cutCountValues =
    countsValues.length > 9
      ? countsValues.slice(countsValues.length - 9)
      : countsValues;

  const availableColors: Record<number, string> = {
    0: "bg-none",
    1: "bg-green-200",
    2: "bg-green-300",
    3: "bg-green-400",
    4: "bg-green-500",
    5: "bg-green-600",
    6: "bg-green-700",
    7: "bg-green-800",
    8: "bg-green-900",
    9: "bg-green-950",
  };

  const colors: Record<number, string> = {};

  for (let i = 0; i < cutCountValues.length; i++) {
    const count = cutCountValues[i] ?? 0;
    colors[count] =
      availableColors[i + (9 - cutCountValues.length)] ?? "bg-none";
  }
  colors[0] = "bg-none";

  return colors;
};

export default function GroupAvailabilities(props: GroupAvailabilitiesProps) {
  const { event, formattedDays } = props;

  console.log(formattedDays);

  // const colors = constructColorsRecord(formattedDays);

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  window.addEventListener("resize", () => {
    setWindowWidth(window.innerWidth);
  });

  const numCols = Math.min(
    Math.round(windowWidth / 200),
    Object.keys(formattedDays).length,
  );

  const [startIdx, setStartIdx] = useState<number>(0);

  const displayedDays = Object.values(formattedDays).slice(
    startIdx,
    startIdx + numCols,
  );

  return (
    <div className="col-span-6 block space-y-4 rounded-md border border-slate-300 bg-slate-50 p-5 dark:border-slate-600 dark:bg-slate-900 dark:placeholder:text-slate-400">
      <div className="flex flex-col">
        <div className="flex flex-row items-center justify-between">
          <h5 className="m-0">Group Availabilities</h5>
          {Object.keys(formattedDays).length > numCols && (
            <div className="flex flex-row gap-1">
              <Button
                className="px-2"
                disabled={startIdx === 0}
                onClick={() => setStartIdx(startIdx - 1)}
              >
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
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </Button>
              <Button
                className="px-2"
                disabled={
                  startIdx + numCols === Object.keys(formattedDays).length
                }
                onClick={() => setStartIdx(startIdx + 1)}
              >
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
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </Button>
            </div>
          )}
        </div>
        <h6
          style={{
            fontSize: "0.9rem",
          }}
          className="text-slate-500"
        >
          {event.timezone}
        </h6>
        <p
          style={{
            fontSize: "0.8rem",
            color: "#94a3b8",
          }}
          className="mt-2"
        >
          {
            "Select any slot with the information icon to view the participants' availabilities."
          }
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead
              className="text-center"
              style={{
                width: "20%",
              }}
            >
              Time
            </TableHead>
            {Object.keys(formattedDays).map((day) => (
              <TableHead key={day} className="text-center">
                {day}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {constructSlotGrid(Object.values(formattedDays)).map(({ day}) => (
            <TableRow
              key={slot.id}
              className="text-center hover:bg-transparent"
            >
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
                    className={`p-1 ${colors[slotAvailabilities.length]}`}
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
