import { getSession, destroySession } from "~/sessions";

const API_URL = process.env.API_URL!;

export async function getSessionCookies(request: Request) {
  return await getSession(request.headers.get("Cookie"));
}

export async function getSessionToken(request: Request) {
  const session = await getSessionCookies(request);
  return { session, token: session.get("authToken") as string | undefined };
}

export async function validateSession(request: Request) {
  const { session, token } = await getSessionToken(request);
  // checing if there are any token
  if (!token) {
    return { isAuthenticated: false, headers: undefined, token: undefined };
  }

  try {
    // validating token
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      return { isAuthenticated: true, headers: undefined, token };
    }
  } catch (err) {}

  // removing token
  const headers = { "Set-Cookie": await destroySession(session) };
  return { isAuthenticated: false, headers, token: undefined };
}
