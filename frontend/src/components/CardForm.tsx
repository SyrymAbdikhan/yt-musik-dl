"use client";

import { useState, useRef } from "react";
import axios from "axios";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const formSchema = z.object({
  url: z
    .string()
    .min(1, { message: "URL is required" })
    .url({ message: "Invalid URL" }),
  artist: z
    .string()
    .min(1, { message: "Artist is required" })
    .max(100, { message: "Artist must be less than 100 characters" }),
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title must be less than 100 characters" }),
});

function CardForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      artist: "",
      title: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    setError("");
    setProcessing(true);

    axios.post(`${import.meta.env.VITE_API_URL}/process`, values)
      .then((resp) => {
        console.log(resp);

        const downloadUrl = `${import.meta.env.VITE_API_URL}/download/${resp.data.file_id}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        var parent = document.body;
        if (formRef.current) {parent = formRef.current}
        parent.appendChild(link);
        link.click();
        parent.removeChild(link);
      })
      .catch((error) => {
        setError(error.response?.data.detail);
        console.log(error);
      })
      .finally(() => {
        setProcessing(false);
      });
  }

  return (
    <Card className="w-[350px] min-w-[250px]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Download Audio</CardTitle>
        <CardDescription>
          Download mp3 file (128kbps) from youtube
        </CardDescription>
        {error && (
          <Alert variant="destructive" className="text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Youtube URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="artist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist</FormLabel>
                    <FormControl>
                      <Input placeholder="Daniel Caesar ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Get You ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button disabled={processing} className="w-full mt-6" type="submit">
              Download
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className={`flex justify-center ${!processing && "hidden"}`}>
        <Spinner size="medium">Processing...</Spinner>
      </CardFooter>
    </Card>
  );
}

export { CardForm };
