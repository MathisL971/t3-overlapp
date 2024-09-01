export type NewEvent = {
  title: string;
  timezone: string;
  type: string;
};

export type NewEventDate = {
  eventId: number;
  date: string;
  startTime: string;
  endTime: string;
};

export type NewEventDay = {
  eventId: number;
  day: string;
  startTime: string;
  endTime: string;
};

export type Event = {
  id: number;
  title: string;
  timezone: string;
  type: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export type EventDate = {
  id: number;
  eventId: number;
  date: string;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export type EventDay = {
  id: number;
  eventId: number;
  day: string;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export type EventDayDate = {
  id: number;
  eventId: number;
  type: string;
  day: string | undefined;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export type NewEventParticipant = {
  eventId: number;
  username: string;
  password: string;
  rememberMe: boolean;
};

export type EventParticipant = {
  id: number;
  eventId: number;
  username: string;
  password: string;
  rememberMe: boolean;
  createdAt: Date;
  updatedAt: Date | null;
};

export type NewAvailabilitySlot = {
  participantId: number;
  dateId: number | undefined;
  dayId: number | undefined;
  startTime: string;
  endTime: string;
};

export type Session = {
  id: number;
  participantId: number;
  token: string;
  createdAt: Date;
  updatedAt: Date | null;
};
