import type { Route } from "./+types/navbar";
import { Link, Outlet, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { validateSession } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const result = await validateSession(request);
  return { isAuthenticated: result.isAuthenticated };
}

export default function Navbar() {
  const { isAuthenticated } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <nav className="m-4 flex gap-4 justify-end items-center">
        {isAuthenticated ? (
          <Link to="/logout">
            <Button>Logout</Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        )}
      </nav>
      <Outlet />
    </div>
  );
}
