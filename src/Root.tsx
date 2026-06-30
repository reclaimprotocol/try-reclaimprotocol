import { Outlet } from "react-router";
import { Navbar } from "./components/Navbar";
import { StagingChrome } from "./components/StagingChrome";

export default function Root() {
  return (
    <>
      <StagingChrome />
      <Navbar />
      <Outlet />
    </>
  );
}
