"use client";

import { useState, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
  // AlertTitle,
} from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username is required" })
    .max(50, { message: "Username must be less than 50 characters" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .max(100, { message: "Password must be less than 100 characters" }),
});

interface LoginFormProps {
  onLogin?: () => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError("");
    setProcessing(true);

    axios
      .post(`${import.meta.env.VITE_API_URL}/auth/token`, values, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      .then((resp) => {
        Cookies.set("token", resp.data.access_token);
        if (onLogin) onLogin();
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status == 401) {
          setError("Failed to sign in. Please try again.")
        } else {
          setError("Unknown error occured. Please contact the developer.")
        }
      })
      .finally(() => {
        setProcessing(false);
      });
  }

  return (
    <Card className="w-[350px] min-w-[250px]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome</CardTitle>
        <CardDescription>
          Only staff allowed to login
        </CardDescription>
        {error && (
          <Alert variant="destructive" className="text-left">
            <AlertCircle className="h-4 w-4" />
            {/* <AlertTitle>Error</AlertTitle> */}
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Kodak" {...field} />
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
                      <Input placeholder="secure" {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button disabled={processing} className="w-full mt-6" type="submit">
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className={`flex justify-center ${!processing && "hidden"}`}>
        <Spinner size="medium" />
      </CardFooter>
    </Card>
  );
}
