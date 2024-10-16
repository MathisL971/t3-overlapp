"use client";

import { useContext, useState } from "react";
import { signOutParticipant } from "~/app/_actions/auth";
import { Button } from "~/components/ui/button";
import { EventContext } from "../_contexts/event";
import { useStore } from "zustand";

export default function SignOutButton() {
  const eventStore = useContext(EventContext);

  if (!eventStore) throw new Error("SignOutButton must be used within Event");

  const { setParticipant } = useStore(eventStore);

  const [signingOut, setSigningOut] = useState(false);

  return (
    <Button
      type="button"
      className={`select-none text-white hover:bg-red-400 ${signingOut ? "bg-red-400" : "bg-red-500"}`}
      onClick={async () => {
        setSigningOut(true);
        await signOutParticipant();
        setParticipant(undefined);
        setSigningOut(false);
      }}
      disabled={signingOut}
    >
      {signingOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}
