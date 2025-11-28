import { Outlet } from "react-router";

export default function Navbar() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <nav>some nav</nav>
      <Outlet />
    </div>
  );
}
