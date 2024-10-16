import { createStore } from "zustand";
import type { day, event, participant } from "~/server/db/schema";
import type { PopulatedAvailability } from "../page";

type Event = typeof event.$inferSelect;
type Participant = typeof participant.$inferSelect;
type Day = typeof day.$inferSelect;

interface EventProps {
  event: Event;
  timezone: string;
  participant: Participant | undefined;
  availabilities: PopulatedAvailability[];
  participants: Participant[];
  days: Day[];
}

interface EventState extends EventProps {
  setEvent: (event: Event) => void;
  setParticipant: (participant: Participant | undefined) => void;
  setTimezone: (timezone: string) => void;
  addAvailability: (availability: PopulatedAvailability) => void;
  removeAvailability: (id: number) => void;
  replaceAvailability: (
    id: number,
    availability: PopulatedAvailability,
  ) => void;
}

export type EventStore = ReturnType<typeof createEventStore>;

export const createEventStore = (initProps: EventProps) => {
  return createStore<EventState>()((set) => ({
    ...initProps,
    setEvent: (event) => set(() => ({ event })),
    setParticipant: (participant) => set(() => ({ participant })),
    setTimezone: (timezone) => set(() => ({ timezone })),
    addAvailability: (availability) =>
      set((state) => ({
        availabilities: [...state.availabilities, availability],
      })),
    removeAvailability: (id) =>
      set((state) => ({
        availabilities: state.availabilities.filter(
          (availability) => availability.id !== id,
        ),
      })),

    replaceAvailability: (id, availability) =>
      set((state) => ({
        availabilities: state.availabilities.map((a) =>
          a.id === id ? availability : a,
        ),
      })),
  }));
};
