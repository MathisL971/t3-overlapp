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
import { useEffect, useState } from "react";
import { createEvent } from "../actions";
import { toast } from "sonner";

export const NewEventFormSchema = z.object({
  title: z.string().min(3).max(50),
  timezone: z.string(),
  type: z.string(),
  days: z.array(z.string()),
  dates: z.array(z.date()),
});

const days = [
  { id: "monday", name: "Monday" },
  { id: "tuesday", name: "Tuesday" },
  { id: "wednesday", name: "Wednesday" },
  { id: "thursday", name: "Thursday" },
  { id: "friday", name: "Friday" },
  { id: "saturday", name: "Saturday" },
  { id: "sunday", name: "Sunday" },
];

type NewEventFormProps = {
  timezone: string;
};

const NewEventForm = (props: NewEventFormProps) => {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof NewEventFormSchema>>({
    resolver: zodResolver(NewEventFormSchema),
    defaultValues: {
      title: "",
      timezone: props.timezone,
      type: "",
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

  useEffect(() => {
    if (!document.cookie.includes("timezone")) {
      document.cookie = `timezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h1>{"Let's get your event set up!"}</h1>

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
                        placeholder={props.timezone ?? "Select a timezone"}
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
                    <SelectItem value="specific-dates">
                      Specific dates
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {field.value &&
                    (field.value === "dotw"
                      ? "This event will repeat every week on the selected days."
                      : "This event will only happen on the selected dates.")}
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
                        {days.map((day) => (
                          <FormField
                            key={day.id}
                            control={form.control}
                            name="days"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={day.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 align-middle"
                                >
                                  <FormControl>
                                    <Checkbox
                                      className="self-center"
                                      checked={field.value?.includes(day.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              day.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== day.id,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {day.name}
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
            ) : (
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
            ))}
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating event..." : "Create event"}
        </Button>
      </form>
    </Form>
  );
};

export default NewEventForm;
