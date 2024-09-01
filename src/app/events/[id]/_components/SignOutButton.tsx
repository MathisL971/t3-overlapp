"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";

export default function SignOutButton() {
  const router = useRouter();

  const [signingOut, setSigningOut] = useState(false);

  return (
    <Button
      type="button"
      className="my-auto"
      onClick={() => {
        setSigningOut(true);
        document.cookie =
          "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        router.refresh();
      }}
      disabled={signingOut}
    >
      {signingOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}
