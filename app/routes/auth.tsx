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
import { getSession, commitSession, destroySession } from "~/sessions";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Form as UiForm,
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

type ActionData = {
  formError?: string;
  fieldErrors?: Partial<Record<keyof LoginFormData, string>>;
};

async function getCookies(request: Request) {
  return await getSession(request.headers.get("Cookie"));
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getCookies(request);
  const token = session.get("authToken");
  // checking if there are any auth token
  if (!token) {
    return;
  }

  try {
    // validating the auth token
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // if valid then redirect
    if (res.ok) {
      return redirect("/app");
    }
  } catch (err) {}

  // else remove the auth token
  const setCookie = await destroySession(session);
  return new Response(JSON.stringify({ loggedOut: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": setCookie,
    },
  });
}

export async function action({ request }: Route.ActionArgs) {
  const data = await request.json();
  // validating form data
  const parsed = loginSchema.safeParse(data);
  // if data is invalid
  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten((issue) => issue.message);
    return {
      fieldErrors: {
        username: fieldErrors.username?.[0],
        password: fieldErrors.password?.[0],
      },
    } satisfies ActionData;
  }

  try {
    // preparing data to send
    const params = new URLSearchParams();
    params.set("username", parsed.data.username);
    params.set("password", parsed.data.password);

    // requesting auth token
    const response = await fetch(`${API_URL}/api/v1/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const result = await response.json();
    // if something is not ok
    if (!response.ok) {
      return {
        formError: result.detail || "Login failed",
        fieldErrors: result.errors,
      } satisfies ActionData;
    }

    // setting the token
    const session = await getCookies(request);
    session.set("authToken", result.access_token);
    // redirecting and passing the headers
    return redirect("/app", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (err) {
    return { formError: "Connection to server failed." } satisfies ActionData;
  }
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Login" }];
}

export default function Auth() {
  const navigation = useNavigation();
  const submit = useSubmit();
  const actionData = useActionData() as ActionData;
  const isSubmitting = navigation.state === "submitting";

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!actionData?.fieldErrors) return;

    Object.entries(actionData.fieldErrors).forEach(([field, message]) => {
      form.setError(field as keyof LoginFormData, {
        type: "server",
        message: message as string,
      });
    });
  }, [actionData, form]);

  const onSubmit = (data: LoginFormData) => {
    form.clearErrors();
    submit(JSON.stringify(data), {
      method: "post",
      encType: "application/json",
    });
  };

  return (
    <div className="h-full flex justify-center items-center">
      <Card className="max-w-sm w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Only staff allowed to login</CardDescription>
        </CardHeader>
        <CardContent>
          {actionData?.formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{actionData.formError}</AlertDescription>
            </Alert>
          )}

          <UiForm {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
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
          </UiForm>
        </CardContent>
      </Card>
    </div>
  );
}
