"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { NewPassowordSchema } from "@/schemas";

import { CardWrapper } from "./card-wrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";

import { useSearchParams } from "next/navigation";
import { newPassowrd } from "@/actions/new-password";

export const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof NewPassowordSchema>>({
    resolver: zodResolver(NewPassowordSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = (values: z.infer<typeof NewPassowordSchema>) => {
    setError(undefined);
    setSuccess(undefined);

    console.log(values);

    startTransition(() => {
      newPassowrd(values, token).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };
  return (
    <CardWrapper
      headerLabel="Enter a new password"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {error && <FormError message={error} />}
          {success && <FormSuccess message={success} />}

          <Button disabled={isPending} type="submit" className="w-full">
            {isPending ? "Submitting..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
