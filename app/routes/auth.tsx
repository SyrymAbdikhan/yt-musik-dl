"use client";

import { useEffect } from "react";
import type { Route } from "./+types/auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useNavigation,
  useSubmit,
  useActionData,
  redirect,
} from "react-router";
import { useForm } from "react-hook-form";
import { getSession, commitSession } from "~/sessions";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const loginSchema = z.object({
  username: z.string().min(1, "Username is empty"),
  password: z.string().min(1, "Password is empty"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const params = new URLSearchParams(data as Record<string, string>);

  try {
    const response = await fetch(`${API_URL}/api/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.detail || "Login failed", errors: result.errors };
    }

    const session = await getSession(request.headers.get("Cookie"));
    session.set("authToken", result.token);

    return redirect("/app", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (err) {
    return { error: "Connection to server failed" };
  }
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Login" }];
}

export default function Auth() {
  const navigation = useNavigation();
  const submit = useSubmit();
  const actionData = useActionData();
  const isSubmitting = navigation.state === "submitting";

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (actionData?.errors) {
      Object.entries(actionData.errors).forEach(([key, message]) => {
        form.setError(key as keyof LoginFormData, {
          type: "server",
          message: message as string,
        });
      });
    }
  }, [actionData, form]);

  const onSubmit = async (data: LoginFormData) => {
    form.clearErrors();
    submit(data, { method: "post" });
  };

  return (
    <div className="h-full flex justify-center items-center">
      <Card className="max-w-sm w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>Only staff allowed to login</CardDescription>
        </CardHeader>
        <CardContent>
          {actionData?.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{actionData.error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="username"
                        autoCapitalize="none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
