"use client";

import SignOutButton from "./SignOutButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useContext, useState } from "react";
import AvailabilityTable from "./AvailabilityTable";
import { useStore } from "zustand";
import { EventContext } from "../_contexts/event";
import type { AvailabilityGrid, GridDay } from "./EventBody";
import { Button } from "~/components/ui/button";

type ParticipantAvailabilitiesProps = {
  gridDays: GridDay[];
  availabilityGrid: AvailabilityGrid;
};

const ParticipantAvailabilities = (props: ParticipantAvailabilitiesProps) => {
  const eventStore = useContext(EventContext);
  if (!eventStore) throw new Error("EventSignInForm must be used within Event");
  const { participant } = useStore(eventStore);

  const { availabilityGrid, gridDays } = props;

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [startIdx, setStartIdx] = useState(0);
  const numCols = Math.min(Math.round(screenWidth / 200), gridDays.length);

  window.addEventListener("resize", () => {
    setScreenWidth(window.innerWidth);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="m-0">
            Welcome {participant!.username}!
          </CardTitle>
          <div className="flex flex-row gap-2">
            <SignOutButton />
            {numCols !== gridDays.length && (
              // && screenWidth > 720
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
        </div>
        <CardDescription className="select-none">
          Select a day to add/modify your availabilities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AvailabilityTable
          gridDays={gridDays}
          availabilityGrid={availabilityGrid}
          startIdx={startIdx}
          numCols={numCols}
        />
        {/* {screenWidth > 720 ? (
          
        ) : (
          gridDays.map((day) => {
            return (
              <AvailabilityDrawer
                key={day}
                day={day}
                availabilities={availabilities.filter(
                  (availability) => availability.dayId === day.id,
                )}
                setAvailabilities={setAvailabilities}
              />
            );
          })
        )} */}
      </CardContent>
    </Card>
  );
};

export default ParticipantAvailabilities;
