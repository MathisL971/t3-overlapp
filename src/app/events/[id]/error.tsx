"use client";

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error.message);
  }, [error]);

  return (
    <Alert variant="destructive">
      <ExclamationTriangleIcon className="h-5 w-5" />
      <AlertTitle>Something went wrong!</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
      <div className="mt-2 flex flex-row justify-end gap-2">
        <Button variant={"destructive"} size={"sm"} onClick={reset}>
          Try again
        </Button>
        <Button
          variant={"destructive"}
          size={"sm"}
          onClick={async () => {
            window.location.href = "/";
          }}
        >
          Go back home
        </Button>
      </div>
    </Alert>
  );
}
