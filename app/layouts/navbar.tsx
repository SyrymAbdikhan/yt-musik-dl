import type { Route } from "./+types/navbar";
import { Link, Outlet, useLoaderData } from "react-router";
import { getSessionToken } from "~/lib/auth.server";

import { ModeToggle } from "~/components/mode-toggle";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export async function loader({ request }: Route.LoaderArgs) {
  const result = await getSessionToken(request);
  return result;
}

export default function Navbar() {
  const { token } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <nav className="m-4 flex h-5 items-center gap-2 text-sm justify-end">
        <Button asChild variant={"ghost"} size={"sm"}>
          <Link to="/" className="px-3">
            Home
          </Link>
        </Button>

        <Separator orientation="vertical" />
        <ModeToggle />
        <Separator orientation="vertical" className="mr-2" />

        {token ? (
          <Button asChild size={"sm"}>
            <Link to="/logout" className="px-3">
              Logout
            </Link>
          </Button>
        ) : (
          <Button asChild size={"sm"}>
            <Link to="/login" className="px-3">
              Login
            </Link>
          </Button>
        )}
      </nav>
      <Outlet />
    </div>
  );
}
