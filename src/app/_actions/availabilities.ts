"use server";

import type { availability } from "~/server/db/schema";
import {
  insertAvailability,
  removeAvailability,
} from "~/server/queries/availabilities";

type InsertAvailability = typeof availability.$inferInsert;

export async function createAvailability(newAvailability: InsertAvailability) {
  const result = await insertAvailability(newAvailability);

  if (!result[0]) {
    throw new Error("Failed to create availability slot");
  }

  return result[0];
}

export async function deleteAvailabilitySlot(slotId: number) {
  await removeAvailability(slotId);
}
