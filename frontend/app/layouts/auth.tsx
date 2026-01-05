import type { Route } from "./+types/navbar";
import { redirect } from "react-router";
import { validateSession } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const result = await validateSession(request);
  // if unauthenticated then redirect
  if (!result.isAuthenticated) {
    if (result.headers) {
      return redirect("/login", { headers: result.headers });
    }
    return redirect("/login");
  }
}
