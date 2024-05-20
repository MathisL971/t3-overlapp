// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  date,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `overlapp_${name}`);

export const events = createTable(
  "event",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 256 }),
    timezone: varchar("timezone", { length: 256 }),
    type: varchar("type", { length: 256 }),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (event) => ({
    titleIndex: index("title_idx").on(event.title),
  }),
);

export const event_dates = createTable(
  "event_date",
  {
    id: serial("id").primaryKey(),
    eventId: serial("event_id").references(() => events.id),
    date: date("date").notNull(),
    startTime: varchar("start_time", { length: 256 }),
    endTime: varchar("end_time", { length: 256 }),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (eventDate) => ({
    eventDateIndex: index("date_idx").on(eventDate.date),
  }),
);

export const enumDay = pgEnum("day", [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

export const event_days = createTable(
  "event_day",
  {
    id: serial("id").primaryKey(),
    eventId: serial("event_id").references(() => events.id),
    day: enumDay("day"),
    startTime: varchar("start_time", { length: 256 }),
    endTime: varchar("end_time", { length: 256 }),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (eventDay) => ({
    dayIndex: index("day_idx").on(eventDay.day),
  }),
);
