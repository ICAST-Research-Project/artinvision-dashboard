"use client";
 
import { museumAdminSettings } from "@/actions/settings";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/use-current-user";
import { museumAdminSettingsSchema } from "@/schemas";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const Page = () => {
  const user = useCurrentUser();
  const router = useRouter();

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof museumAdminSettingsSchema>>({
    resolver: zodResolver(museumAdminSettingsSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      museumName: user?.museumAdmin?.museumName || "",
      about: user?.museumAdmin?.about || "",
      address: user?.museumAdmin?.address || "",
    },
  });
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        phone: user.phone || "",
        museumName: user.museumAdmin?.museumName || "",
        about: user.museumAdmin?.about || "",
        address: user.museumAdmin?.address || "",
      });
    }
  }, [user, form]);
  const onSubmit = (values: z.infer<typeof museumAdminSettingsSchema>) => {
    startTransition(() => {
      museumAdminSettings(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }
          if (data.success) {
            setSuccess(data.success);
            router.refresh();
          }
        })
        .catch(() => setError("Something went wrong"));
    });
  };
  return (
    <div className="w-[600px]">
      <CardHeader>
        <p className="text-2xl font-semibold text-center"> ⚙️ Settings</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="first last"
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="museumName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Museum Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Museum Name"
                        type="text"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone No.</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="XXX-XXX-XXXX"
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="address"
                        type="text"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isPending}
                        placeholder="Something about the museum..."
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {error && <FormError message={error} />}
            {success && <FormSuccess message={success} />}
            <Button disabled={isPending} type="submit">
              Update
            </Button>
          </form>
        </Form>
      </CardContent>
    </div>
  );
};

export default Page;
