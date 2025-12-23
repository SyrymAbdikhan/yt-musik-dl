import type { Route } from "./+types/home";
import { Link } from "react-router";
import { ModeToggle } from "~/components/mode-toggle";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Home" }];
}

export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center">
      <nav className="w-full p-4 flex items-center text-sm justify-end">
        <ModeToggle />
      </nav>
      <div className="grow" />
      <div className="max-w-160 text-center">
        <h1 className="text-4xl mb-3">Welcome to Turtle Tools!</h1>
        <p className="mb-4 text-muted-foreground">
          Audio downloader from YouTube. <br />
          Please follow the link below to App.
        </p>
        <Button asChild>
          <Link to="/app">
            Open App
          </Link>
        </Button>
      </div>
      <div className="grow" />
      <a className="text-blue-600 mb-6" href="https://github.com/SyrymAbdikhan/">View on Github</a>
    </div>
  );
}
