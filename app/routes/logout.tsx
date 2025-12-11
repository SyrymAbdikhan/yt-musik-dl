import type { Route } from "./+types/logout";
import { redirect, Link } from "react-router";
import { destroySession } from "~/sessions";
import { getSessionToken } from "~/lib/auth.server";

import { Button } from "~/components/ui/button";

export async function loader({ request }: Route.LoaderArgs) {
  const { session, token } = await getSessionToken(request);
  // checking if there are any auth token
  if (!token) {
    return redirect("/");
  }

  // remove the auth token
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Logout" }];
}

export default function Logout() {
  return (
    <div className="h-screen flex justify-center items-center">
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
