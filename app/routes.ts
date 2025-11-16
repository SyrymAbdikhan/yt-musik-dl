import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("layouts/navbar.tsx", [
    route("auth", "routes/auth.tsx"),
    route("app", "routes/app.tsx"),
  ]),
] satisfies RouteConfig;
