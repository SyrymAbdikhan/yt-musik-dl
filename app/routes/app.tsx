"use client";

import { useEffect } from "react";
import type { Route } from "./+types/auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation, useSubmit, useActionData } from "react-router";
import { useForm } from "react-hook-form";
import { destroySession, getSession } from "~/sessions";

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

const requestSchema = z.object({
  url: z.url("A valid YouTube URL is required"),
  metadata: z.object({
    artist: z.string().min(1, "Artist is empty"),
    title: z.string().min(1, "Title is empty"),
  }),
  dl_opts: z.object({
    codec: z.null(),
    bitrate: z.null(),
  }),
});

type RequestFormData = z.infer<typeof requestSchema>;

type ActionData = {
  formError?: string;
  fieldErrors?: Partial<Record<keyof RequestFormData, string>>;
};

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
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
      return;
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

  try {
    const response = await fetch(`${API_URL}/api/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        formError: result.detail || "Processing failed",
        fieldErrors: result.errors,
      } satisfies ActionData;
    }

    // TODO: Handle result
  } catch (err) {
    return { formError: "Connection to server failed" } satisfies ActionData;
  }
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Turtle" }];
}

export default function App() {
  const navigation = useNavigation();
  const submit = useSubmit();
  const actionData = useActionData() as ActionData;
  const isSubmitting = navigation.state === "submitting";

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      url: "",
      metadata: {
        artist: "",
        title: "",
      },
      dl_opts: {
        codec: null,
        bitrate: null,
      },
    },
  });

  useEffect(() => {
    if (!actionData?.fieldErrors) return;

    Object.entries(actionData.fieldErrors).forEach(([field, message]) => {
      form.setError(field as keyof RequestFormData, {
        type: "server",
        message: message as string,
      });
    });
  }, [actionData, form]);

  const onSubmit = async (data: RequestFormData) => {
    form.clearErrors();
    submit(data, { method: "post" });
  };

  return (
    <div className="h-full flex justify-center items-center">
      <Card className="max-w-sm w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Request</CardTitle>
          <CardDescription>Download audio from YouTube</CardDescription>
        </CardHeader>
        <CardContent>
          {actionData?.formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{actionData.formError}</AlertDescription>
            </Alert>
          )}

          <UiForm {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* YouTube URL */}
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="youtube.com/..."
                        autoComplete="url"
                        autoCapitalize="none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Artist */}
              <FormField
                control={form.control}
                name="metadata.artist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kanye West"
                        autoComplete="artist"
                        autoCapitalize="none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="metadata.title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Flashing Lights"
                        autoComplete="title"
                        autoCapitalize="none"
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
                    Processing...
                  </>
                ) : (
                  "Download"
                )}
              </Button>
            </form>
          </UiForm>
        </CardContent>
      </Card>
    </div>
  );
}
