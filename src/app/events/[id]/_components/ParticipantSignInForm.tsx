"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { signInParticipant } from "~/app/_actions/auth";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { EventContext } from "../_contexts/event";
import { useStore } from "zustand";

export const ParticipantSignInFormSchema = z.object({
  username: z.string(),
  password: z.string(),
  rememberMe: z.boolean(),
});

const ParticipantSignInForm = () => {
  const eventStore = useContext(EventContext);
  if (!eventStore) throw new Error("EventSignInForm must be used within Event");
  const { event, setParticipant } = useStore(eventStore);

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
      const participant = await signInParticipant(event.id, data);

      if (!participant) {
        throw new Error("Failed to sign in. Error creating participant.");
      }

      setParticipant(participant);
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
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="m-0">Join the event now!</CardTitle>
            <CardDescription>
              Sign in as a participant to add/modify your availabilities for
              this event.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 md:flex-row">
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
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ParticipantSignInForm;
