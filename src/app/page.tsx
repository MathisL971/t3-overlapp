import React from "react";
import NewEventForm from "./_components/NewEventForm";
import EventLookupForm from "./_components/EventLookupForm";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <EventLookupForm />
      <hr />
      <NewEventForm />
    </div>
  );
}
