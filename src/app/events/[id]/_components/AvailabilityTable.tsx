import React, { useContext } from "react";
import {
  createAvailability,
  deleteAvailabilitySlot,
} from "~/app/_actions/availabilities";

import {
  Table,
  TableHeader,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
} from "~/components/ui/table";
import type { AvailabilityGrid, GridDay } from "./EventBody";
import { DateTime } from "luxon";
import { EventContext } from "../_contexts/event";
import { useStore } from "zustand";
import { tz } from "moment-timezone";
import type { availability } from "~/server/db/schema";
import type { PopulatedAvailability } from "../page";

type InsertAvailability = typeof availability.$inferInsert;

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

type AvailabilityTableProps = {
  gridDays: GridDay[];
  availabilityGrid: AvailabilityGrid;
  startIdx: number;
  numCols: number;
};

export default function AvailabilityTable(props: AvailabilityTableProps) {
  const eventStore = useContext(EventContext);
  if (!eventStore) throw new Error("EventSignInForm must be used within Event");
  const {
    event,
    participant,
    timezone,
    days,
    availabilities,
    addAvailability,
    removeAvailability,
    replaceAvailability,
  } = useStore(eventStore);

  const { availabilityGrid, gridDays, startIdx, numCols } = props;

  const [mousePressed, setMousePressed] = React.useState(false);

  window.addEventListener("mouseup", () => {
    setMousePressed(false);
  });

  window.addEventListener("mousedown", () => {
    setMousePressed(true);
  });

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
    <Table>
      <TableHeader className="select-none">
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
            <TableRow key={time} className="text-center hover:bg-transparent">
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

                  const participantAvailability = slot.availabilities.find(
                    (a) => a.participant.id === participant!.id,
                  );

                  return (
                    <TableCell
                      key={time + day}
                      className={
                        participantAvailability
                          ? "cursor-pointer bg-green-400 p-1 hover:bg-green-300"
                          : "cursor-pointer p-1 hover:bg-slate-800"
                      }
                      onMouseEnter={async () => {
                        if (mousePressed) {
                          if (!participantAvailability) {
                            const datetime = DateTime.fromObject({
                              day: Number(day.split("-")[2]),
                              month: Number(day.split("-")[1]),
                              year: Number(day.split("-")[0]),
                              hour: Number(time.split(":")[0]),
                              minute: Number(time.split(":")[1]),
                            });
                            const serverDatetime = datetime.plus({
                              hours:
                                (tz(event.timezone).utcOffset() -
                                  tz(timezone).utcOffset()) /
                                60,
                            });

                            const eventDay = days.find((d) => {
                              const dt =
                                d.type === "date"
                                  ? DateTime.fromJSDate(new Date(d.date!))
                                  : DateTime.fromObject({
                                      weekday: weekDayToNumber(d.day!),
                                    });

                              return dt.hasSame(serverDatetime, "day");
                            });

                            const newAvailability: InsertAvailability = {
                              participantId: participant!.id,
                              dayId: eventDay!.id,
                              startTime: serverDatetime.toFormat("HH:mm"),
                              endTime: serverDatetime
                                .plus({ minutes: 30 })
                                .toFormat("HH:mm"),
                            };

                            // find min id in availabilities
                            const nextTempId =
                              availabilities.reduce(
                                (minId, availability) =>
                                  availability.id < minId
                                    ? availability.id
                                    : minId,
                                0,
                              ) - 1;
                            addAvailability({
                              id: nextTempId,
                              startTime: serverDatetime.toFormat("HH:mm"),
                              endTime: serverDatetime
                                .plus({ minutes: 30 })
                                .toFormat("HH:mm"),
                              day: eventDay!,
                              participant: participant!,
                            });

                            const createdAvailability =
                              await createAvailability(newAvailability);

                            const newPopulatedAvailability: PopulatedAvailability =
                              {
                                id: createdAvailability.id,
                                startTime: createdAvailability.startTime,
                                endTime: createdAvailability.endTime,
                                day: eventDay!,
                                participant: participant!,
                              };

                            replaceAvailability(
                              nextTempId,
                              newPopulatedAvailability,
                            );
                          } else {
                            removeAvailability(participantAvailability.id);

                            try {
                              await deleteAvailabilitySlot(
                                participantAvailability.id,
                              );
                            } catch (error) {
                              console.error(error);
                              addAvailability({
                                id: participantAvailability.id,
                                startTime:
                                  participantAvailability.startTime.hour +
                                  ":" +
                                  participantAvailability.startTime.minute,
                                endTime:
                                  participantAvailability.endTime.hour +
                                  ":" +
                                  participantAvailability.endTime.minute,
                                day: participantAvailability.day,
                                participant: participant!,
                              });
                            }
                          }
                        }
                      }}
                      onClick={async () => {
                        if (!participantAvailability) {
                          const datetime = DateTime.fromObject({
                            day: Number(day.split("-")[2]),
                            month: Number(day.split("-")[1]),
                            year: Number(day.split("-")[0]),
                            hour: Number(time.split(":")[0]),
                            minute: Number(time.split(":")[1]),
                          });
                          const serverDatetime = datetime.plus({
                            hours:
                              (tz(event.timezone).utcOffset() -
                                tz(timezone).utcOffset()) /
                              60,
                          });

                          const eventDay = days.find((d) => {
                            const dt =
                              d.type === "date"
                                ? DateTime.fromJSDate(new Date(d.date!))
                                : DateTime.fromObject({
                                    weekday: weekDayToNumber(d.day!),
                                  });

                            return dt.hasSame(serverDatetime, "day");
                          });

                          const newAvailability: InsertAvailability = {
                            participantId: participant!.id,
                            dayId: eventDay!.id,
                            startTime: serverDatetime.toFormat("HH:mm"),
                            endTime: serverDatetime
                              .plus({ minutes: 30 })
                              .toFormat("HH:mm"),
                          };

                          // find min id in availabilities
                          const nextTempId =
                            availabilities.reduce(
                              (minId, availability) =>
                                availability.id < minId
                                  ? availability.id
                                  : minId,
                              0,
                            ) - 1;
                          addAvailability({
                            id: nextTempId,
                            startTime: serverDatetime.toFormat("HH:mm"),
                            endTime: serverDatetime
                              .plus({ minutes: 30 })
                              .toFormat("HH:mm"),
                            day: eventDay!,
                            participant: participant!,
                          });

                          const createdAvailability =
                            await createAvailability(newAvailability);

                          const newPopulatedAvailability: PopulatedAvailability =
                            {
                              id: createdAvailability.id,
                              startTime: createdAvailability.startTime,
                              endTime: createdAvailability.endTime,
                              day: eventDay!,
                              participant: participant!,
                            };

                          replaceAvailability(
                            nextTempId,
                            newPopulatedAvailability,
                          );
                        } else {
                          removeAvailability(participantAvailability.id);

                          try {
                            await deleteAvailabilitySlot(
                              participantAvailability.id,
                            );
                          } catch (error) {
                            console.error(error);
                            addAvailability({
                              id: participantAvailability.id,
                              startTime:
                                participantAvailability.startTime.hour +
                                ":" +
                                participantAvailability.startTime.minute,
                              endTime:
                                participantAvailability.endTime.hour +
                                ":" +
                                participantAvailability.endTime.minute,
                              day: participantAvailability.day,
                              participant: participant!,
                            });
                          }
                        }
                      }}
                      // onMouseDown={async (e) => {
                      //   e.preventDefault();

                      //   if (!participantAvailability) {
                      //     const datetime = DateTime.fromObject({
                      //       day: Number(day.split("-")[2]),
                      //       month: Number(day.split("-")[1]),
                      //       year: Number(day.split("-")[0]),
                      //       hour: Number(time.split(":")[0]),
                      //       minute: Number(time.split(":")[1]),
                      //     });
                      //     const serverDatetime = datetime.plus({
                      //       hours:
                      //         (tz(event.timezone).utcOffset() -
                      //           tz(timezone).utcOffset()) /
                      //         60,
                      //     });

                      //     const eventDay = days.find((d) => {
                      //       const dt =
                      //         d.type === "date"
                      //           ? DateTime.fromJSDate(new Date(d.date!))
                      //           : DateTime.fromObject({
                      //               weekday: weekDayToNumber(d.day!),
                      //             });

                      //       return dt.hasSame(serverDatetime, "day");
                      //     });

                      //     const newAvailability: InsertAvailability = {
                      //       participantId: participant!.id,
                      //       dayId: eventDay!.id,
                      //       startTime: serverDatetime.toFormat("HH:mm"),
                      //       endTime: serverDatetime
                      //         .plus({ minutes: 30 })
                      //         .toFormat("HH:mm"),
                      //     };

                      //     // find min id in availabilities
                      //     const nextTempId =
                      //       availabilities.reduce(
                      //         (minId, availability) =>
                      //           availability.id < minId
                      //             ? availability.id
                      //             : minId,
                      //         0,
                      //       ) - 1;
                      //     addAvailability({
                      //       id: nextTempId,
                      //       startTime: serverDatetime.toFormat("HH:mm"),
                      //       endTime: serverDatetime
                      //         .plus({ minutes: 30 })
                      //         .toFormat("HH:mm"),
                      //       day: eventDay!,
                      //       participant: participant!,
                      //     });

                      //     const createdAvailability =
                      //       await createAvailability(newAvailability);

                      //     const newPopulatedAvailability: PopulatedAvailability =
                      //       {
                      //         id: createdAvailability.id,
                      //         startTime: createdAvailability.startTime,
                      //         endTime: createdAvailability.endTime,
                      //         day: eventDay!,
                      //         participant: participant!,
                      //       };

                      //     replaceAvailability(
                      //       nextTempId,
                      //       newPopulatedAvailability,
                      //     );
                      //   } else {
                      //     removeAvailability(participantAvailability.id);

                      //     try {
                      //       await deleteAvailabilitySlot(
                      //         participantAvailability.id,
                      //       );
                      //     } catch (error) {
                      //       console.error(error);
                      //       addAvailability({
                      //         id: participantAvailability.id,
                      //         startTime:
                      //           participantAvailability.startTime.hour +
                      //           ":" +
                      //           participantAvailability.startTime.minute,
                      //         endTime:
                      //           participantAvailability.endTime.hour +
                      //           ":" +
                      //           participantAvailability.endTime.minute,
                      //         day: participantAvailability.day,
                      //         participant: participant!,
                      //       });
                      //     }
                      //   }
                      // }}
                    />
                  );
                })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
