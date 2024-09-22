import type { availability, day, participant } from "~/server/db/schema";
import SignOutButton from "./SignOutButton";
import Days from "./Days";
import { tz } from "moment-timezone";

type Day = typeof day.$inferSelect;
type Participant = typeof participant.$inferSelect;
type Availability = typeof availability.$inferSelect;

type ParticipantAvailabilitiesProps = {
  participant: Participant;
  // availabilities: Availability[];
  // days: Day[];
  // setAvailabilities: (
  //   availabilities: Availability[] | ((prev: Availability[]) => Availability[]),
  // ) => void;
  timezone: string;
  formattedAvailabilities: any;
};

export default function ParticipantAvailabilities(
  props: ParticipantAvailabilitiesProps,
) {
  const { participant, availabilities, days, setAvailabilities, timezone } =
    props;

  return (
    <div className="col-span-6 block space-y-4 rounded-md border border-slate-300 bg-slate-50 p-5 dark:border-slate-600 dark:bg-slate-900 dark:placeholder:text-slate-400">
      <div className="flex flex-col gap-1">
        <div className="flex flex-row items-center justify-between">
          <h5 className="m-0">Welcome {participant.username}!</h5>
          <SignOutButton />
        </div>
        <p
          style={{
            fontSize: "0.8rem",
            color: "#94a3b8",
          }}
        >
          Select a day to add/modify your availabilities.
        </p>
      </div>
      <Days
        participant={participant}
        days={days}
        availabilities={availabilities.filter(
          (availability) => availability.participantId === participant.id,
        )}
        setAvailabilities={setAvailabilities}
      />
    </div>
  );
}
