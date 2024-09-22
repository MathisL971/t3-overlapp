import React from "react";
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
import { availability, day, participant } from "~/server/db/schema";

type Day = typeof day.$inferSelect;
type Availability = typeof availability.$inferSelect;
type InsertAvailability = typeof availability.$inferInsert;
type Participant = typeof participant.$inferSelect;

type AvailabilityTableProps = {
  participant: Participant;
  days: Day[];
  availabilities: Availability[];
  setAvailabilities: (
    availabilities: Availability[] | ((prev: Availability[]) => Availability[]),
  ) => void;
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

export default function AvailabilityTable(props: AvailabilityTableProps) {
  const { participant, availabilities, days, setAvailabilities } = props;

  const [mousePressed, setMousePressed] = React.useState(false);

  window.addEventListener("mouseup", () => {
    setMousePressed(false);
  });

  window.addEventListener("mousedown", (e) => {
    setMousePressed(true);
  });

  return (
    <Table
      style={{
        userSelect: "none",
      }}
    >
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
          {days.map((day) => (
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
        {constructSlotGrid(days).map((slot) => (
          <TableRow key={slot.id} className="text-center hover:bg-transparent">
            <TableCell className="flex flex-row justify-center p-1 text-xs">
              {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
            </TableCell>
            {days.map((day) => {
              const dayAvailabilities = availabilities.filter(
                (availability) => availability.dayId === day.id,
              );
              const slotAvailability = dayAvailabilities.find(
                (availability) => availability.startTime === slot.startTime,
              );

              if (!slotAvailability) {
                return (
                  <TableCell
                    key={day.id}
                    className="cursor-pointer p-1 hover:bg-slate-800"
                    onMouseEnter={() => {
                      if (mousePressed) {
                        const newAvailability: InsertAvailability = {
                          participantId: participant.id,
                          dayId: day.id,
                          startTime: slot.startTime,
                          endTime: slot.endTime,
                        };

                        createAvailability(newAvailability).then(
                          (createdAvailability) => {
                            setAvailabilities((prev) => {
                              return [...prev, createdAvailability];
                            });
                          },
                        );
                      }
                    }}
                    onClick={async () => {
                      const newAvailability: InsertAvailability = {
                        participantId: participant.id,
                        dayId: day.id,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                      };

                      const createdAvailability =
                        await createAvailability(newAvailability);

                      setAvailabilities((prev) => {
                        return [...prev, createdAvailability];
                      });
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();

                      const newAvailability: InsertAvailability = {
                        participantId: participant.id,
                        dayId: day.id,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                      };

                      createAvailability(newAvailability).then(
                        (createdAvailability) => {
                          setAvailabilities((prev) => {
                            return [...prev, createdAvailability];
                          });
                        },
                      );
                    }}
                  ></TableCell>
                );
              }

              return (
                <TableCell
                  key={day.id}
                  className="cursor-pointer bg-green-400 p-1 hover:bg-green-300"
                  onMouseEnter={async (e) => {
                    if (mousePressed) {
                      await deleteAvailabilitySlot(slotAvailability.id);

                      setAvailabilities((prev) => {
                        return prev.filter(
                          (availability) =>
                            availability.id !== slotAvailability.id,
                        );
                      });
                    }
                  }}
                  onClick={async () => {
                    await deleteAvailabilitySlot(slotAvailability.id);

                    setAvailabilities((prev) => {
                      return prev.filter(
                        (availability) =>
                          availability.id !== slotAvailability.id,
                      );
                    });
                  }}
                  onMouseDown={async (e) => {
                    e.preventDefault();

                    await deleteAvailabilitySlot(slotAvailability.id);

                    setAvailabilities((prev) => {
                      return prev.filter(
                        (availability) =>
                          availability.id !== slotAvailability.id,
                      );
                    });
                  }}
                ></TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
