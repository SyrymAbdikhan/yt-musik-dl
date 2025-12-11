import type { Route } from "./+types/logout";
import { redirect, Link } from "react-router";
import { getSession, destroySession } from "~/sessions";

import { Button } from "~/components/ui/button";

async function getCookies(request: Request) {
  return await getSession(request.headers.get("Cookie"));
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getCookies(request);
  const token = session.get("authToken");
  // checking if there are any auth token
  if (!token) {
    return redirect("/");
  }

  // remove the auth token
  const setCookie = await destroySession(session);
  return redirect("/", {
    headers: {
      "Set-Cookie": setCookie,
    },
  });
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Logout" }];
}

export default function Logout() {
  return (
    <div className="h-screen flex justify-center">
      <div className="max-w-[20rem] text-center">
        <h1 className="text-4xl mb-3">Logout</h1>
        <p className="mb-4 text-muted-foreground">
          If it did not redirect automatically <br />
          then click the button below.
        </p>
        <Link to={"/"}>
          <Button>Redirect</Button>
        </Link>
      </div>
    </div>
  );
}
