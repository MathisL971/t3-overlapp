"use client";

import { tz } from "moment-timezone";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  SelectItem,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Card } from "~/components/ui/card";
import { Calendar } from "~/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useState } from "react";
import { createEvent } from "../_actions/events";
import { toast } from "sonner";
import { dayOfWeekEnum } from "~/server/db/schema";

export const NewEventFormSchema = z.object({
  title: z.string().min(3).max(50),
  timezone: z.string(),
  type: z.enum(["dotw", "dates"]),
  days: z.array(
    z.enum([
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ]),
  ),
  dates: z.array(z.date()),
});

const NewEventForm = () => {
  const [submitting, setSubmitting] = useState(false);

  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const form = useForm<z.infer<typeof NewEventFormSchema>>({
    resolver: zodResolver(NewEventFormSchema),
    defaultValues: {
      title: "",
      timezone: tz.names().includes(localTimezone) ? localTimezone : "",
      days: [],
      dates: [],
    },
  });

  async function onSubmit(data: z.infer<typeof NewEventFormSchema>) {
    setSubmitting(true);
    try {
      await createEvent(data);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <h1>{"Organizing a new event?"}</h1>
        <FormDescription>
          Fill out the form below to create a new event.
        </FormDescription>

        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage {...field} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>Timezone</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  name={field.name}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        onBlur={field.onBlur}
                        ref={field.ref}
                        placeholder={field.value || "Select a timezone"}
                      />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {tz.names().map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormDescription>
                  The timezone in which the event will take place.
                </FormDescription>
                <FormMessage {...field} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    // Create a fake event object and pass it to field.onChange
                    const event = {
                      target: {
                        value,
                        name: field.name,
                      },
                    };
                    field.onChange(event);

                    // Also set dates and days to []
                    form.setValue("dates", []);
                    form.setValue("days", []);
                  }}
                  value={field.value}
                  name={field.name}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        onBlur={field.onBlur}
                        ref={field.ref}
                        placeholder="Select an event type"
                      />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value="dotw">Days of the week</SelectItem>
                    <SelectItem value="dates">Specific dates</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {field.value &&
                    (field.value === "dotw"
                      ? "This event will repeat every week on the selected days."
                      : field.value === "dates"
                        ? "This event will only happen on the selected dates."
                        : null)}
                </FormDescription>
                <FormMessage {...field} />
              </FormItem>
            )}
          />

          {form.watch("type") &&
            (form.watch("type") === "dotw" ? (
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Days of the week</FormLabel>{" "}
                    <FormControl>
                      <Card className="space-y-2 rounded-md p-3">
                        {dayOfWeekEnum.enumValues.map((day) => (
                          <FormField
                            key={day}
                            control={form.control}
                            name="days"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={day}
                                  className="flex flex-row items-start space-x-3 space-y-0 align-middle"
                                >
                                  <FormControl>
                                    <Checkbox
                                      className="self-center"
                                      checked={field.value?.includes(day)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              day,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== day,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {day.charAt(0).toUpperCase() + day.slice(1)}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </Card>
                    </FormControl>
                    <FormMessage {...field} />
                  </FormItem>
                )}
              />
            ) : form.watch("type") === "dates" ? (
              <FormField
                control={form.control}
                name="dates"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel htmlFor={field.name}>Dates</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="justify-start gap-2 px-3 font-normal"
                          >
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                            <p className="overflow-hidden">
                              {field.value.length > 0
                                ? field.value
                                    .sort((a, b) => a.getTime() - b.getTime())
                                    .map((date) => date.toLocaleDateString())
                                    .join(", ")
                                : "Pick your dates"}
                            </p>
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="multiple"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date <= new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage {...field} />
                  </FormItem>
                )}
              />
            ) : null)}
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating event..." : "Create event"}
        </Button>
      </form>
    </Form>
  );
};

export default NewEventForm;
