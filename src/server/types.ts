export type NewEvent = {
  title: string;
  timezone: string;
  type: "dates" | "dotw";
};

export type NewEventDay = {
  eventId: number;
  type: 'day' | 'date';
  day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | undefined;
  date: Date | undefined;
  startTime: string;
  endTime: string;
};

export type NewParticipant = {
  eventId: number;
  username: string;
  password: string;
};

export type NewAvailability = {
  participantId: number;
  dayId: number;
  startTime: string;
  endTime: string;
};

export type NewSession = {
  participantId: number;
  token: string;
  expiresAt: Date;
  closed: boolean;
  rememberMe: boolean;
};
