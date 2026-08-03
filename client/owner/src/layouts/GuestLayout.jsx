import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/layout/GuestNavbar";

const PublicLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-base-200">
      <PublicNavbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
