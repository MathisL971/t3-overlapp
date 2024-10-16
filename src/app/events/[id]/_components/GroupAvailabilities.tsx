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
import { useContext, useEffect, useState } from "react";
import type { AvailabilityGrid, GridDay } from "./EventBody";
import { DateTime } from "luxon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useStore } from "zustand";
import { EventContext } from "../_contexts/event";

const constructColorsRecord = (availabilityGrid: AvailabilityGrid) => {
  const counts: Record<string, number> = {};

  for (const time of Object.keys(availabilityGrid)) {
    const days = Object.keys(availabilityGrid[time]!);
    for (const day of days) {
      const slots = availabilityGrid[time]![day];
      const numOfAvailabilities = slots!.availabilities.length;
      counts[numOfAvailabilities] = (counts[numOfAvailabilities] ?? 0) + 1;
    }
  }

  const countsValuesSet = new Set(Object.keys(counts));
  const countsValues = Array.from(countsValuesSet)
    .map((a) => Number(a))
    .sort((a, b) => {
      return a - b;
    });
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

type GroupAvailabilitiesProps = {
  gridDays: GridDay[];
  availabilityGrid: AvailabilityGrid;
};

export default function GroupAvailabilities(props: GroupAvailabilitiesProps) {
  const eventStore = useContext(EventContext);

  if (!eventStore)
    throw new Error("EventBodyConsumer must be used within EventBody");

  const { event, participants } = useStore(eventStore);

  const { availabilityGrid, gridDays } = props;

  const colors = constructColorsRecord(availabilityGrid);

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setWindowWidth(window.innerWidth);
    });
  }, []);

  const numCols = Math.min(Math.round(windowWidth / 200), gridDays.length);

  const [startIdx, setStartIdx] = useState<number>(0);

  const sortedAvailabilityGridTimes = Object.keys(availabilityGrid).sort(
    (t1, t2) => {
      const [h1, m1] = t1.split(":");
      const [h2, m2] = t2.split(":");

      return Number(h1) * 60 + Number(m1) - (Number(h2) * 60 + Number(m2));
    },
  );

  const paddedAvailabilityGridTimes: string[] = [];
  sortedAvailabilityGridTimes.forEach((time, i) => {
    paddedAvailabilityGridTimes.push(time);

    if (i === sortedAvailabilityGridTimes.length - 1) {
      return;
    }

    const dt = DateTime.fromFormat(time, "HH:mm").plus({ minutes: 30 });
    const nextTime = sortedAvailabilityGridTimes[i + 1];
    const nextDt = DateTime.fromFormat(nextTime!, "HH:mm");

    if (dt < nextDt) {
      paddedAvailabilityGridTimes.push("bubble");
    }
  });

  return (
    <Card>
      <CardHeader className="select-none">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="m-0">Group Availabilities</CardTitle>
          {gridDays.length > numCols && (
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
                disabled={startIdx + numCols === gridDays.length}
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
        <CardDescription>
          {
            "Select any slot with the information icon to view the participants' availabilities."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              {gridDays.slice(startIdx, startIdx + numCols).map((day) => (
                <TableHead
                  key={day.date.toString()}
                  className="text-center"
                  style={{
                    width:
                      80 / gridDays.slice(startIdx, startIdx + numCols).length +
                      "%",
                  }}
                >
                  {event.type === "dates"
                    ? day.date.toLocaleString({
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })
                    : day.date.toLocaleString({
                        weekday: "long",
                      })}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paddedAvailabilityGridTimes.map((time, i) => {
              if (time === "bubble") {
                return <TableRow key={time + i} className="h-5" />;
              }

              return (
                <TableRow
                  key={time}
                  className="text-center hover:bg-transparent"
                >
                  <TableCell className="pointer-events-none my-auto flex select-none flex-row justify-center p-1 text-xs">
                    {time +
                      " - " +
                      DateTime.fromISO(time)
                        .plus({ minutes: 30 })
                        .toFormat("HH:mm")}
                  </TableCell>
                  {Object.keys(availabilityGrid[time]!)
                    .sort(
                      (a, b) =>
                        DateTime.fromISO(a).toMillis() -
                        DateTime.fromISO(b).toMillis(),
                    )
                    .slice(startIdx, startIdx + numCols)
                    .map((day) => {
                      const slot = availabilityGrid[time]![day]!;

                      if (!slot.valid) {
                        return (
                          <TableCell
                            key={time + day}
                            className={
                              "cursor-not-allowed bg-gray-100 p-1 dark:bg-slate-900"
                            }
                          />
                        );
                      }

                      const slotAvailabilities = slot.availabilities;

                      return (
                        <TableCell
                          key={day}
                          className={`p-1 ${colors[slotAvailabilities.length]}`}
                        >
                          {slotAvailabilities.length > 0 && (
                            <Dialog>
                              <DialogTrigger
                                className="flex w-full flex-row items-center justify-center"
                                style={{
                                  cursor:
                                    slotAvailabilities.length > 0
                                      ? "pointer"
                                      : "default",
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="white"
                                  className="size-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                                  />
                                </svg>
                              </DialogTrigger>
                              <DialogContent className="w-4/5 rounded-md">
                                <DialogHeader>
                                  <DialogTitle className="m-0 px-4 text-center">
                                    {(event.type === "dates"
                                      ? DateTime.fromISO(day).toFormat(
                                          "LLL d, yyyy",
                                        )
                                      : DateTime.fromISO(day).toLocaleString({
                                          weekday: "long",
                                        })) +
                                      " @ " +
                                      time}
                                  </DialogTitle>
                                  <DialogDescription className="px-4 text-center">
                                    {slotAvailabilities.length} participant
                                    {slotAvailabilities.length > 1 && "s"}{" "}
                                    available
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
                                      {slotAvailabilities.map((a) => {
                                        return (
                                          <p className="text-center" key={a.id}>
                                            {a.participant.username}
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
                                      {participants
                                        .filter(
                                          (p) =>
                                            !slotAvailabilities.some(
                                              (a) => a.participant.id === p.id,
                                            ),
                                        )
                                        .map((p) => {
                                          return (
                                            <p
                                              className="text-center"
                                              key={p.id}
                                            >
                                              {p.username}
                                            </p>
                                          );
                                        })}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      );
                    })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
