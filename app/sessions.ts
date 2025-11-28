import { createCookieSessionStorage } from "react-router";

const secret = process.env.SESSION_SECRET || "default-dev-secret";

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
