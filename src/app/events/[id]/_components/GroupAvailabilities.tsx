"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import type { availability, day } from "~/server/db/schema";
import { useState } from "react";
type Availability = typeof availability.$inferSelect;
type Day = typeof day.$inferSelect;

type GroupAvailabilitiesProps = {
    availabilities: Availability[];
    days: Day[];
};

const constructSlotGrid = (
    startHour: number,
    endHour: number,
) => {
    const slots = [];

    for (let i = startHour; i < endHour; i++) {
        const slot1 = {
            id: i,
            startTime: `${i < 10 ? "0" + i : i
                }:00:00`,
            endTime: `${i < 10 ? "0" + i : i
                }:30:00`,
            savedSlotId: undefined,
        };
        slots.push(slot1);

        const slot2 = {
            id: i + 0.5,
            startTime: `${i < 10 ? "0" + i : i
                }:30:00`,
            endTime: `${i + 1 < 10 ? "0" + (i + 1) : i + 1
                }:00:00`,
            savedSlotId: undefined,
        };

        slots.push(slot2);
    }

    return slots;
};

export default function GroupAvailabilities(
    props: GroupAvailabilitiesProps
) {

    const { availabilities, days } = props;

    const numCols = Math.min(3, days.length);

    const [displayedDays, setDisplayedDays] = useState<Day[]>(days.slice(0, numCols));

    const minStartTime = displayedDays.reduce((min, day) => {
        const startTime = day.startTime;
        return startTime < min ? startTime : min;
    }, days[0]!.startTime);

    const maxEndTime = displayedDays.reduce((max, day) => {
        const endTime = day.endTime;
        return endTime > max ? endTime : max;
    }, days[0]!.endTime);

    const startHour = new Date(
        new Date().toDateString() + " " + minStartTime,
    ).getHours();
    const endHour = new Date(
        new Date().toDateString() + " " + maxEndTime,
    ).getHours();

    const slots = constructSlotGrid(startHour, endHour);

    const counts: object = {};
    availabilities.forEach((availability) => {
        const key = availability.dayId + availability.startTime;
        counts[key] = (counts[key] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(counts));

    const colors = {};
    for (let i = maxCount; i >= maxCount - 5; i--) {
        colors[i] = `rgba(0, 255, 0, ${0.9 - 0.2 * i})`;
    }
    colors[0] = "lightgray";

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
                <h5>Group Availabilities</h5>
                {days.length > numCols &&
                    <div className="flex flex-row gap-1">
                        <Button
                            disabled={displayedDays[0].id === days[0].id}
                            onClick={
                                () => {
                                    const indexOfCurrentFirst = days.findIndex((day) => day.id === displayedDays[0].id);
                                    setDisplayedDays(days.slice(indexOfCurrentFirst - 1, indexOfCurrentFirst + numCols - 1));
                                }
                            }>{"<"}</Button>
                        <Button
                            disabled={displayedDays[numCols - 1].id === days[days.length - 1].id}
                            onClick={
                                () => {
                                    const indexOfCurrentFirst = days.findIndex((day) => day.id === displayedDays[0].id);
                                    setDisplayedDays(days.slice(indexOfCurrentFirst + 1, indexOfCurrentFirst + numCols + 1));
                                }
                            }>{">"}</Button>
                    </div>}
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center" style={{
                            width: "20%"
                        }}>Time</TableHead>
                        {
                            displayedDays.slice(0, numCols).map((day) => (
                                <TableHead key={day.id} className="text-center">
                                    {
                                        day.type === "date" ? (
                                            new Date(day.date!).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric"
                                            }).toUpperCase()
                                        ) : (
                                            day.day!.toUpperCase()[0] + day.day!.slice(1, 3)
                                        )
                                    }
                                </TableHead>
                            ))
                        }
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {slots.map((slot) => (
                        <TableRow key={slot.id} className="text-center">
                            <TableCell className="p-1 flex flex-row justify-center text-xs">{slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}</TableCell>
                            {displayedDays.slice(0, numCols).map((day) => {
                                const dayAvailabilities = availabilities.filter((availability) => availability.dayId === day.id);
                                const slotAvailabilities = dayAvailabilities.filter((availability) => availability.startTime === slot.startTime);

                                return (
                                    <TableCell key={day.id} className="p-1" style={{
                                        backgroundColor: colors[slotAvailabilities.length]
                                    }}>
                                    </TableCell>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}