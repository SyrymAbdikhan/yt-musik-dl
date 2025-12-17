import type { Route } from "./+types/navbar";
import { Link, Outlet, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { getSessionToken } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const result = await getSessionToken(request);
  return result;
}

export default function Navbar() {
  const { token } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <nav className="m-4 flex gap-4 justify-end items-center">
        {token ? (
          <Link to="/logout">
            <Button className="cursor-pointer">Logout</Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button className="cursor-pointer">Login</Button>
          </Link>
        )}
      </nav>
      <Outlet />
    </div>
  );
}
