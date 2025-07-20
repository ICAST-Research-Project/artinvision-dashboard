"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { z } from "zod";

import { LoginSchema } from "@/schemas";
import type { LoginResult } from "@/actions/login";
import { login } from "@/actions/login";

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
import Link from "next/link";

export const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError(undefined);
    setSuccess(undefined);

    startTransition(async () => {
      const res: LoginResult = await login(values);

      if (res.needsVerification) {
        setSuccess(res.message);
        return;
      }

      if (res.message !== "Credentials verified") {
        setError(res.message);
        return;
      }

      const nextAuth = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (nextAuth?.error) {
        setError(
          nextAuth.error === "CredentialsSignin"
            ? "Invalid email or password!"
            : nextAuth.error
        );
        return;
      }
      setSuccess("Logged in successfully!");
      const session = await getSession();
      const acct = session?.user?.accountType;

      setTimeout(() => {
        if (acct === "MUSEUM_ADMIN") router.push("/museum");
        else if (acct === "CURATOR") router.push("/curator");
        else if (acct === "ARTIST") router.push("/artist");
        else router.push("/");
      }, 1000);
    });
  };

  return (
    <CardWrapper
      headerLabel="Welcome back!"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="example@domain.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      placeholder="*******"
                      type="password"
                    />
                  </FormControl>
                  <Button
                    size="sm"
                    variant="link"
                    asChild
                    className="px-0 font-normal justify-start"
                  >
                    <Link href="/auth/reset">Forgot password?</Link>
                  </Button>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {error && <FormError message={error} />}
          {success && <FormSuccess message={success} />}

          <Button disabled={isPending} type="submit" className="w-full">
            {isPending ? "Signing in" : "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
