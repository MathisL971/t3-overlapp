// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  date,
  boolean,
  pgEnum,
  time,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `overlapp_${name}`);

export const eventTypeEnum = pgEnum("event_type", ["dotw", "dates"]);

export const event = createTable(
  "event",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 256 }).notNull(),
    timezone: varchar("timezone", { length: 256 }).notNull(),
    type: eventTypeEnum('type').notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (event) => ({
    titleIndex: index("title_idx").on(event.title),
  }),
);

export const dayTypeEnum = pgEnum("day_type", ["date", "day"]);
export const dayOfWeekEnum = pgEnum("day_of_week", [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]);

export const day = createTable(
  "day",
  {
    id: serial("id").primaryKey(),
    eventId: serial("event_id").references(() => event.id).notNull(),
    type: dayTypeEnum('type').notNull(),
    day: dayOfWeekEnum('day'),
    date: date("date"),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (day) => ({
    dayIndex: index("day_idx").on(day.eventId, day.day, day.date),
  }),
);

export const participant = createTable(
  "participant",
  {
    id: serial("id").primaryKey(),
    eventId: serial("event_id").references(() => event.id).notNull(),
    username: varchar("username", { length: 256 }),
    password: varchar("password", { length: 256 }),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (eventParticipant) => ({
    participantIndex: index("participant_idx").on(eventParticipant.username),
  }),
);

export const availability = createTable(
  "availability",
  {
    id: serial("id").primaryKey(),
    participantId: serial("participant_id").references(
      () => participant.id,
    ).notNull(),
    dayId: serial("day_id").references(() => day.id).notNull(),
    startTime: time("start_time",
      { precision: 0 }
    ).notNull(),
    endTime: time("end_time", {
      precision: 0
    }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (availability) => ({
    slotIndex: index("slot_idx").on(
      availability.participantId,
      availability.dayId,
      availability.startTime,
      availability.endTime,
    ),
  }),
);

export const session = createTable(
  "session",
  {
    id: serial("id").primaryKey(),
    token: varchar("token", { length: 256 }).notNull(),
    participantId: serial("participant_id")
      .references(() => participant.id)
      .notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    rememberMe: boolean("remember_me").notNull(),
    closed: boolean("closed").notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (session) => ({
    sessionIndex: index("session_idx").on(session.token),
  }),
);
