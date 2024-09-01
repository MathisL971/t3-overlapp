import React from "react";
import NewEventForm from "./_components/NewEventForm";
import { cookies } from "next/headers";

export default function HomePage() {
  const cookieStore = cookies();
  const timezone = cookieStore.get("timezone")?.value ?? "";

  return (
    <>
      <NewEventForm timezone={timezone} />
    </>
  );
}
