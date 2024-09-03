"use server";

import { insertAvailability, removeAvailability } from "~/server/queries/availabilities";
import type { NewAvailability } from "~/server/types";

export async function createAvailability(
    newAvailability: NewAvailability,
) {
    const result = await insertAvailability(newAvailability);

    if (!result[0]) {
        throw new Error("Failed to create availability slot");
    }

    return result[0];
}

export async function deleteAvailabilitySlot(slotId: number) {
    await removeAvailability(slotId);
}