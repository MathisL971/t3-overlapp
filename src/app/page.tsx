import React from "react";
import NewEventForm from "./_components/NewEventForm";
import { cookies } from "next/headers";

export default function HomePage() {
  const cookieStore = cookies();
  const timezone = cookieStore.get("timezone")?.value ?? "";

  return (
    <main className="flex flex-col gap-6 px-8 py-20 sm:px-24 md:px-44 lg:px-72 xl:px-96">
      <h1>{"Let's get your event set up!"}</h1>
      <NewEventForm timezone={timezone} />
    </main>
  );
}
