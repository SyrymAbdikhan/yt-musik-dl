import { createCookieSessionStorage } from "react-router";
import { createThemeSessionResolver } from "remix-themes";

const secret = import.meta.env.VITE_SESSION_SECRET || "default-dev-secret";
const isProduction = process.env.NODE_ENV === "production";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [secret],
    // Set domain and secure only if in production
    ...(isProduction
      ? { domain: "your-production-domain.com", secure: true }
      : {}),
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
