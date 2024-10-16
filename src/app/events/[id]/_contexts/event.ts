import { createContext } from "react";
import type { EventStore } from "../_stores/event";

export const EventContext = createContext<EventStore | null>(null);
