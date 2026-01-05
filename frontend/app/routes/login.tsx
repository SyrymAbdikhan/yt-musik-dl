"use client";

import { useEffect } from "react";
import type { Route } from "./+types/login";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useNavigation,
  useSubmit,
  useActionData,
  redirect,
} from "react-router";
import { useForm } from "react-hook-form";
import { commitSession } from "~/sessions";
import { getSessionCookies, validateSession } from "~/lib/auth.server";

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

const loginSchema = z.object({
  username: z.string().min(1, "Username is empty"),
  password: z.string().min(1, "Password is empty"),
});

type LoginFormData = z.infer<typeof loginSchema>;

type ActionData = {
  formError?: string;
  fieldErrors?: Partial<Record<keyof LoginFormData, string>>;
};

export async function loader({ request }: Route.LoaderArgs) {
  const result = await validateSession(request);
  if (result.isAuthenticated) {
    return redirect("/app");
  }

  if (result.headers) {
    return new Response(null, { headers: result.headers });
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const API_URL = process.env.API_URL!;
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
    const session = await getSessionCookies(request);
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

export default function Login() {
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
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your username below to login to your account</CardDescription>
          {actionData?.formError && (
            <Alert variant="destructive">
              <AlertDescription>{actionData.formError}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
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
