"use client";

import { curatorSettings } from "@/actions/settings";
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
import { useCurrentCuratorUser } from "@/hooks/use-current-user";
import { curatorSettingsSchema } from "@/schemas";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const Page = () => {
  const user = useCurrentCuratorUser();
  const router = useRouter();

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof curatorSettingsSchema>>({
    resolver: zodResolver(curatorSettingsSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      about: user?.curator?.about || "",
      image: user?.image || undefined,
      address: user?.curator?.address || "",
      connect: user?.curator?.connect || "",
    },
  });
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        phone: user.phone || "",
        about: user.curator?.about || "",
        image: user?.image || undefined,
        address: user.curator?.address || "",
        connect: user.curator?.connect || "",
      });
    }
  }, [user, form]);
  const onSubmit = (values: z.infer<typeof curatorSettingsSchema>) => {
    startTransition(() => {
      curatorSettings(values)
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
                    <FormLabel>Name</FormLabel>
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
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-4">
                        {/* <ProfileUploader onUploadComplete={field.onChange} /> */}
                        {field.value && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={field.value}
                            alt="Current profile"
                            className=" w-full object-contian"
                          />
                        )}
                      </div>
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
              <FormField
                control={form.control}
                name="connect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Media Handler</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="@artist"
                        type="text"
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
