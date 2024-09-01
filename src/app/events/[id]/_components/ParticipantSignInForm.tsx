"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { signInParticipant } from "~/app/actions";
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

export const ParticipantSignInFormSchema = z.object({
  username: z.string(),
  password: z.string(),
  rememberMe: z.boolean(),
});

export type ParticipantSignInFormProps = {
  eventId: number;
};

function generateSessionToken(length = 32) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    token += charset[randomIndex];
  }
  return token;
}

const ParticipantSignInForm = (props: ParticipantSignInFormProps) => {
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
      document.cookie = `session_token=${generateSessionToken()}; expires=${new Date(
        Date.now() + (data.rememberMe ? 1000 * 60 * 60 * 24 * 30 : 15000),
      ).toUTCString()}`;

      await signInParticipant(props.eventId, data);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormDescription>
          Sign in as a participant to add/modify your availabilities for this
          event.
        </FormDescription>

        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
                <FormLabel htmlFor={field.name}>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage {...field} />
              </FormItem>
            )}
          />

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
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Form>
  );
};

export default ParticipantSignInForm;
