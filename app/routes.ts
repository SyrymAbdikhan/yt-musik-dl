import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("layouts/navbar.tsx", [
    route("login", "routes/login.tsx"),
    route("app", "routes/app.tsx"),
  ]),
  route("logout", "routes/logout.tsx"),
  route("download/:fileId", "routes/download.tsx"),
] satisfies RouteConfig;
