import { Outlet } from "react-router";

export default function Navbar() {
  return (
    <>
      <nav>some nav</nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}
