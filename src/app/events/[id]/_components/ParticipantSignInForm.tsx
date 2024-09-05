"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { signInParticipant } from "~/app/_actions/auth";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
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
import type { event } from "~/server/db/schema";

export const ParticipantSignInFormSchema = z.object({
  username: z.string(),
  password: z.string(),
  rememberMe: z.boolean(),
});

type Event = typeof event.$inferSelect;

export type ParticipantSignInFormProps = {
  event: Event;
};

const ParticipantSignInForm = (props: ParticipantSignInFormProps) => {
  const { event } = props;

  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof ParticipantSignInFormSchema>>({
    resolver: zodResolver(ParticipantSignInFormSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: z.infer<typeof ParticipantSignInFormSchema>) {
    setSubmitting(true);
    try {
      await signInParticipant(event.id, data);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="col-span-6 block space-y-4 rounded-lg border border-slate-300 bg-slate-50 p-5 dark:border-slate-600 dark:bg-slate-900 dark:placeholder:text-slate-400"
      >
        <div>
          <h5 className="mb-1">Join the event now!</h5>
          <FormDescription>
            Sign in as a participant to add/modify your availabilities for this
            event.
          </FormDescription>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel htmlFor={field.name}>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage {...field} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel htmlFor={field.name}>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage {...field} />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem>
              <div className="my-2 flex flex-row gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                </FormControl>
                <FormLabel htmlFor={field.name}>Remember me</FormLabel>
              </div>

              <FormMessage {...field} />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Form>
  );
};

export default ParticipantSignInForm;
