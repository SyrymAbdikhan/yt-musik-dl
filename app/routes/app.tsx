import type { Route } from "./+types/app";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Turtle" }];
}

export default function App() {
  return <div>This is App page</div>;
}
