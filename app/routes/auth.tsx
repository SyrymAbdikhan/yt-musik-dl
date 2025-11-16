import type { Route } from "./+types/auth";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Login" }];
}

export default function Auth() {
  return <div>This is Auth page</div>;
}
