"use client";

import { useState } from "react";
import { signOutParticipant } from "~/app/_actions/auth";
import { Button } from "~/components/ui/button";

export default function SignOutButton() {
  const [signingOut, setSigningOut] = useState(false);

  return (
    <Button
      type="button"
      className={`my-auto hover:bg-red-400 text-white ${signingOut ? "bg-red-400" : "bg-red-500"}`}
      onClick={async () => {
        setSigningOut(true);
        await signOutParticipant();
      }}
      disabled={signingOut}
      size={"sm"}
    >
      {signingOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}
