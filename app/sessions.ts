import { createCookieSessionStorage } from "react-router";

const secret = import.meta.env.VITE_SESSION_SECRET || "default-dev-secret";

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      path: "/",
      secrets: [secret],
      maxAge: 60 * 60 * 24 * 7,
    },
  });

export async function getSessionCookies(request: Request) {
  return await getSession(request.headers.get("Cookie"));
}
