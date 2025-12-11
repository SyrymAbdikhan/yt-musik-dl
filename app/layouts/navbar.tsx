import type { Route } from "./+types/navbar";
import { Link, Outlet, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { destroySession, getSessionCookies } from "~/sessions";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionCookies(request);
  const token = session.get("authToken");
  // checking if there are any auth token
  if (!token) {
    return { isAuthenticated: false };
  }

  try {
    // validating the auth token
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // if valid then return json
    if (res.ok) {
      return { isAuthenticated: true };
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
