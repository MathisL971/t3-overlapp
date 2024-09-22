"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { fetchEvent } from "../_actions/events";
import type { event } from "~/server/db/schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Event = typeof event.$inferSelect;

export const EventLookupFormSchema = z.object({
  eventCode: z.string(),
});

export default function EventLookupForm() {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof EventLookupFormSchema>>({
    resolver: zodResolver(EventLookupFormSchema),
    defaultValues: {
      eventCode: "",
    },
  });

  async function onSubmit(data: z.infer<typeof EventLookupFormSchema>) {
    setSubmitting(true);

    if (
      Number.isNaN(Number(data.eventCode)) ||
      !Number.isInteger(Number(data.eventCode))
    ) {
      toast.error("Event code must be a number.");
      form.reset();
      setSubmitting(false);
      return;
    }

    const event: Event | undefined = await fetchEvent(Number(data.eventCode));

    if (!event) {
      toast.error(`Event with code ${data.eventCode} does not exist.`);
      form.reset();
      setSubmitting(false);
      return;
    }

    router.push(`/events/${data.eventCode}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <h1>Looking for an existing event?</h1>
        <FormDescription>
          Enter the event code to search for an event.
        </FormDescription>
        <FormField
          control={form.control}
          name="eventCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={field.name}>Event Code</FormLabel>
              <div className="flex flex-row gap-2">
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Searching..." : "Search"}
                </Button>
              </div>
              <FormMessage {...field} />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
