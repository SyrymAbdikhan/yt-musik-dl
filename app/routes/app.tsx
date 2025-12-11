"use client";

import { useEffect } from "react";
import type { Route } from "./+types/app";
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
  dl_opts: z.object(),
});

type RequestFormData = z.infer<typeof requestSchema>;

type ActionData = {
  formError?: string;
  fieldErrors?: Partial<Record<keyof RequestFormData, string>>;
  fileId?: string;
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
  const session = await getCookies(request);
  const token = session.get("authToken");
  // checking if there are any auth token
  if (!token) {
    return { formError: "Not Authenticated" } satisfies ActionData;
  }

  const data = await request.json();
  // validating form data
  const parsed = requestSchema.safeParse(data);
  // if data is invalid
  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten((issue) => issue.message);
    return {
      fieldErrors: {
        url: fieldErrors.url?.[0],
        metadata: fieldErrors.metadata?.[0],
        dl_opts: fieldErrors.dl_opts?.[0],
      },
    } satisfies ActionData;
  }

  try {
    // sending process request to backend
    const response = await fetch(`${API_URL}/api/v1/audio/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parsed.data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        formError: result.detail || "Processing failed",
        fieldErrors: result.errors,
      } satisfies ActionData;
    }

    // getting file id for future download
    const fileId: string | undefined = result.file_id;
    if (!fileId) {
      return {
        formError: "Something went wrong during the donwload process",
      } satisfies ActionData;
    }

    return { fileId } satisfies ActionData;
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
      dl_opts: {},
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

  useEffect(() => {
    if (!actionData?.fileId) return;

    (async () => {
      try {
        // requesting the file
        const res = await fetch(`/download/${actionData.fileId}`);
        if (!res.ok) {
          return;
        }

        // get filename from Content-Disposition if present
        const disposition = res.headers.get("content-disposition") || "";
        let filename = "audio.bin";
        const match = disposition.match(/filename="?([^"]+)"?/i);
        if (match?.[1]) {
          filename = match[1];
        }

        // creating blob to download
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        // downloading
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download failed", err);
      }
    })();
  }, [actionData?.fileId]);

  const onSubmit = async (data: RequestFormData) => {
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
