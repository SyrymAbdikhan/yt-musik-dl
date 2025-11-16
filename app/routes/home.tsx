import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hello World" },
  ];
}

export default function Home() {
  return <div>This is Home page</div>;
}
