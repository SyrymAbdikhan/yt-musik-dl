import { createCookieSessionStorage } from "react-router";
import { createThemeSessionResolver } from "remix-themes";

const secret = process.env.SESSION_SECRET!;
const isProduction = process.env.NODE_ENV === "production";
const domain = process.env.SESSION_DOMAIN;

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [secret],
    // Set domain and secure only if in production
    ...(isProduction && domain
      ? { domain, secure: true }
      : {}),
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
