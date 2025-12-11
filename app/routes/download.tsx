import type { Route } from "./+types/download";
import { getSession } from "~/sessions";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function getCookies(request: Request) {
  return await getSession(request.headers.get("Cookie"));
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getCookies(request);
  const token = session.get("authToken");

  if (!token) {
    return new Response("Not authenticated", { status: 401 });
  }

  const fileId = params.fileId;
  if (!fileId) {
    return new Response("Missing file id", { status: 400 });
  }

  const downloadRes = await fetch(`${API_URL}/api/v1/audio/download/${fileId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!downloadRes.ok) {
    const errJson = await downloadRes.json().catch(() => ({}));
    return new Response(errJson.detail || "Download failed", {
      status: downloadRes.status,
    });
  }

  const contentType =
    downloadRes.headers.get("content-type") ?? "application/octet-stream";
  const contentDisposition =
    downloadRes.headers.get("content-disposition") ??
    `attachment; filename="${fileId}.bin"`;
  const contentLength = downloadRes.headers.get("content-length");

  return new Response(downloadRes.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition,
      ...(contentLength ? { "Content-Length": contentLength } : {}),
    },
  });
}
