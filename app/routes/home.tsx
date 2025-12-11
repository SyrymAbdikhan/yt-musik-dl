import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Home" }];
}

export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center">
      <div className="grow" />
      <div className="max-w-[20rem] text-center">
        <h1 className="text-4xl mb-3">Welcome to Turtle!</h1>
        <p className="mb-4 text-muted-foreground">
          Audio downloader from YouTube. <br />
          Please follow the link below to App.
        </p>
        <Link to={"/login"}>
          <Button>Open App</Button>
        </Link>
      </div>
      <div className="grow" />
      <a className="text-blue-600 mb-6" href="https://github.com/SyrymAbdikhan/">View on Github</a>
    </div>
  );
}
