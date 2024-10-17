"use client";

import { useContext, useRef, useState } from "react";
import type { day, event, participant } from "~/server/db/schema";
import ParticipantSignInForm from "./ParticipantSignInForm";
import dynamic from "next/dynamic";

import { tz } from "moment-timezone";
import { DateTime } from "luxon";
import type { PopulatedAvailability } from "../page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { createEventStore } from "../_stores/event";
import { EventContext } from "../_contexts/event";
import { useStore } from "zustand";

const ParticipantAvailabilities = dynamic(
  () => import("./ParticipantAvailabilities"),
  {
    ssr: false,
  },
);
const GroupAvailabilities = dynamic(() => import("./GroupAvailabilities"), {
  ssr: false,
});

type Participant = typeof participant.$inferSelect;
type Event = typeof event.$inferSelect;
type Day = typeof day.$inferSelect;

type EventBodyProps = {
  event: Event;
  participant?: Participant;
  days: Day[];
  participants: Participant[];
  availabilities: PopulatedAvailability[];
};

export type PopulatedAvailabilityWithDateTime = Omit<
  PopulatedAvailability,
  "startTime" | "endTime"
> & {
  startTime: DateTime;
  endTime: DateTime;
};

export type AvailabilityGrid = Record<string, Record<string, Slot>>;

type Slot = {
  availabilities: PopulatedAvailabilityWithDateTime[];
  valid: boolean;
};

const weekDayToNumber = (day: string) => {
  switch (day) {
    case "monday":
      return 1;
    case "tuesday":
      return 2;
    case "wednesday":
      return 3;
    case "thursday":
      return 4;
    case "friday":
      return 5;
    case "saturday":
      return 6;
    case "sunday":
      return 7;
  }
};

const buildAvailabilityGrid = (
  availabilities: PopulatedAvailability[],
  days: Day[],
  offset: number,
  gridDays: GridDay[],
) => {
  const formattedAvailabilities: PopulatedAvailabilityWithDateTime[] =
    availabilities.map((availability) => {
      const datetime =
        availability.day.type === "date"
          ? DateTime.fromJSDate(new Date(availability.day.date!))
          : DateTime.fromObject({
              weekday: weekDayToNumber(availability.day.day!),
            });

      return {
        ...availability,
        startTime: DateTime.fromObject({
          ...datetime.toObject(),
          hour: Number(availability.startTime.split(":")[0]),
          minute: Number(availability.startTime.split(":")[1]),
        }).minus({ hours: offset }),
        endTime: DateTime.fromObject({
          ...datetime.toObject(),
          hour: Number(availability.endTime.split(":")[0]),
          minute: Number(availability.endTime.split(":")[1]),
        }).minus({ hours: offset }),
      };
    });

  let earliestDayStartTime = days
    .reduce(
      (min, day) => {
        const startTime = DateTime.fromObject({
          hour: Number(day.startTime.split(":")[0]),
          minute: Number(day.startTime.split(":")[1]),
        });
        return startTime < min ? startTime : min;
      },
      DateTime.fromObject({
        hour: Number(days[0]!.startTime.split(":")[0]),
        minute: Number(days[0]!.startTime.split(":")[1]),
      }),
    )
    .minus({
      hours: offset,
    });

  const latestDayEndTime = days
    .reduce(
      (max, day) => {
        const endTime = DateTime.fromObject({
          hour: Number(day.endTime.split(":")[0]),
          minute: Number(day.endTime.split(":")[1]),
        });

        return endTime > max ? endTime : max;
      },
      DateTime.fromObject({
        hour: Number(days[0]!.endTime.split(":")[0]),
        minute: Number(days[0]!.endTime.split(":")[1]),
      }),
    )
    .minus({ hours: offset });

  const availabilitiesByDay: Record<
    string,
    PopulatedAvailabilityWithDateTime[]
  > = {};

  gridDays.forEach((day) => {
    const date = day.date.toISODate();

    const availabilities: PopulatedAvailabilityWithDateTime[] = [];

    formattedAvailabilities.forEach((availability) => {
      if (date === availability.startTime.toISODate()) {
        availabilities.push(availability);
      }
    });

    availabilitiesByDay[date!] = availabilities;
  });

  const grid: AvailabilityGrid = {};

  while (earliestDayStartTime < latestDayEndTime) {
    const time = earliestDayStartTime.toFormat("HH:mm");

    grid[time] = {};

    for (const day of Object.keys(availabilitiesByDay)) {
      const gridDay = gridDays.find((gridDay) => {
        return gridDay.date.toISODate() === day;
      });

      const d = DateTime.fromObject({
        hour: Number(time.split(":")[0]),
        minute: Number(time.split(":")[1]),
        day: Number(day.split("-")[2]),
        month: Number(day.split("-")[1]),
        year: Number(day.split("-")[0]),
      });

      if (!grid[time]) {
        throw new Error("Invalid window");
      }

      if (!isValidWindow(d, gridDay!.windows)) {
        grid[time][day] = {
          valid: false,
          availabilities: [],
        };
        continue;
      }

      const availabilities = availabilitiesByDay[day];

      grid[time][day] = {
        valid: true,
        availabilities: availabilities!.filter((availability) => {
          return availability.startTime.toFormat("HH:mm") === time;
        }),
      };
    }

    earliestDayStartTime = earliestDayStartTime.plus({
      minutes: 30,
    });
  }

  return grid;
};

export type GridDay = {
  date: DateTime;
  windows: DayWindow[];
};

type DayWindow = {
  start: DateTime;
  end: DateTime;
};

const isValidWindow = (slot: DateTime, windows: DayWindow[]) => {
  if (!windows) {
    return false;
  }

  for (const window of windows) {
    if (slot >= window.start && slot <= window.end) {
      return true;
    }
  }

  return false;
};

const buildGridDays = (days: Day[], offset: number) => {
  const gridDays: GridDay[] = [];

  for (const day of days) {
    let startDate: DateTime;
    let endDate: DateTime;
    if (day.type === "date") {
      const jsDate = new Date(day.date!);
      startDate = DateTime.fromObject({
        year: jsDate.getFullYear(),
        month: jsDate.getMonth() + 1,
        day: jsDate.getDate(),
        hour: Number(day.startTime.split(":")[0]),
        minute: Number(day.startTime.split(":")[1]),
      }).minus({ hours: offset });
      endDate = DateTime.fromObject({
        year: jsDate.getFullYear(),
        month: jsDate.getMonth() + 1,
        day: jsDate.getDate(),
        hour: Number(day.endTime.split(":")[0]),
        minute: Number(day.endTime.split(":")[1]),
      }).minus({ hours: offset });
    } else if (day.type === "day") {
      startDate = DateTime.fromObject({
        weekday: weekDayToNumber(day.day!),
        hour: Number(day.startTime.split(":")[0]),
        minute: Number(day.startTime.split(":")[1]),
      }).minus({ hours: offset });
      endDate = DateTime.fromObject({
        weekday: weekDayToNumber(day.day!),
        hour: Number(day.endTime.split(":")[0]),
        minute: Number(day.endTime.split(":")[1]),
      }).minus({ hours: offset });
    } else {
      throw new Error("Invalid day type");
    }

    if (startDate.day !== endDate.day && endDate.hour !== 0) {
      const existingGridDayOne = gridDays.find((gridDay) => {
        return gridDay.date.toISODate() === startDate.toISODate();
      });

      if (!existingGridDayOne) {
        gridDays.push({
          date: startDate,
          windows: [
            {
              start: startDate,
              end: DateTime.fromObject({
                year: startDate.year,
                month: startDate.month,
                day: startDate.day,
                hour: 23,
                minute: 59,
              }),
            },
          ],
        });
      } else {
        existingGridDayOne.windows.push({
          start: startDate,
          end: DateTime.fromObject({
            year: startDate.year,
            month: startDate.month,
            day: startDate.day,
            hour: 23,
            minute: 59,
          }),
        });
      }

      const existingGridDayTwo = gridDays.find((gridDay) => {
        return gridDay.date.toISODate() === endDate.toISODate();
      });

      if (!existingGridDayTwo) {
        gridDays.push({
          date: endDate,
          windows: [
            {
              start: DateTime.fromObject({
                year: endDate.year,
                month: endDate.month,
                day: endDate.day,
                hour: 0,
                minute: 0,
              }),
              end: endDate,
            },
          ],
        });
      } else {
        existingGridDayTwo.windows.push({
          start: DateTime.fromObject({
            year: endDate.year,
            month: endDate.month,
            day: endDate.day,
            hour: 0,
            minute: 0,
          }),
          end: endDate,
        });
      }
    } else {
      const existingGridDay = gridDays.find((gridDay) => {
        return gridDay.date.toISODate() === startDate.toISODate();
      });

      if (!existingGridDay) {
        gridDays.push({
          date: startDate,
          windows: [
            {
              start: startDate,
              end: endDate,
            },
          ],
        });
      } else {
        existingGridDay.windows.push({
          start: startDate,
          end: endDate,
        });
      }
    }
  }

  gridDays.sort((a, b) => {
    return a.date.toMillis() - b.date.toMillis();
  });

  return gridDays;
};

export default function EventBody(props: EventBodyProps) {
  const eventStore = useRef(
    createEventStore({
      event: props.event,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      participant: props.participant,
      availabilities: props.availabilities,
      participants: props.participants,
      days: props.days,
    }),
  ).current;

  return (
    <EventContext.Provider value={eventStore}>
      <EventBodyConsumer />
    </EventContext.Provider>
  );
}

const EventBodyConsumer = () => {
  const eventStore = useContext(EventContext);
  if (!eventStore)
    throw new Error("EventBodyConsumer must be used within EventBody");

  const { event, timezone, participant, setTimezone, days, availabilities } =
    useStore(eventStore);

  const [copied, setCopied] = useState(false);

  const offset =
    (tz(event.timezone).utcOffset() - tz(timezone).utcOffset()) / 60;
  const gridDays = buildGridDays(days, offset);

  const availabilityGrid = buildAvailabilityGrid(
    availabilities,
    days,
    offset,
    gridDays,
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        <div className="flex flex-row gap-2">
          <Input
            type="text"
            value={`http://localhost:3000/events/${event.id}`}
            readOnly
          />
          <Button
            variant={"outline"}
            onClick={async () => {
              await navigator.clipboard.writeText(
                `http://localhost:3000/events/${event.id}`,
              );
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 2000);
            }}
          >
            {copied ? (
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
                  d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                />
              </svg>
            ) : (
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
                  d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z"
                />
              </svg>
            )}
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="timezone">Timezone</Label>
          <p className="text-xs text-slate-400">
            Select the timezone you would like to view the event in.
          </p>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue placeholder={timezone ?? "Select timezone"} />
            </SelectTrigger>
            <SelectContent>
              {tz.names().map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {participant ? (
        <ParticipantAvailabilities
          gridDays={gridDays}
          availabilityGrid={availabilityGrid}
        />
      ) : (
        <ParticipantSignInForm />
      )}
      <GroupAvailabilities
        gridDays={gridDays}
        availabilityGrid={availabilityGrid}
      />
    </div>
  );
};
