import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar, AuthenticatedNavbar } from "@components/layout";

const ADMIN_SIDEBAR_STORAGE_KEY = "PlayRizon-admin-sidebar-collapsed";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  useEffect(() => {
    const savedState = window.localStorage.getItem(
      ADMIN_SIDEBAR_STORAGE_KEY,
    );
    setIsCollapsed(savedState === "true");
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      ADMIN_SIDEBAR_STORAGE_KEY,
      String(isCollapsed),
    );
  }, [isCollapsed]);

  return (
    <div className="flex flex-col min-h-screen">
      <AuthenticatedNavbar toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 pt-16">
        <AdminSidebar
          isOpen={isOpen}
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
          toggleCollapse={toggleCollapse}
          className={`
            ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        />
        <main
          className={`
          flex-1 
          overflow-x-hidden 
          overflow-y-auto 
          p-4 
          transition-all 
          duration-300 
          ease-in-out
          lg:ml-0
        `}
        >
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
