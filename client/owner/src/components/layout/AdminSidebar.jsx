import { Link, useLocation } from "react-router-dom";
import {
  X,
  Home,
  Users,
  Building,
  MapPin,
  DollarSign,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Info,
  MessageCircle,
  UserCircle2,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
const AdminSidebar = ({
  toggleSidebar,
  toggleCollapse,
  isCollapsed = false,
  className,
}) => {
  const location = useLocation();
  const [ownerRequestsOpen, setOwnerRequestsOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith("/admin/owner-requests")) {
      setOwnerRequestsOpen(true);
    }
  }, [location.pathname]);

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: Home },
    {
      label: "Owner Requests",
      icon: UserPlus,
      subItems: [
        { to: "/admin/owner-requests/new", label: "New Requests" },
        { to: "/admin/owner-requests/rejected", label: "Rejected Requests" },
      ],
    },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/owners", label: "Owners", icon: Building },
    { to: "/admin/turfs", label: "Turfs", icon: MapPin },
    { to: "/admin/transactions", label: "Transactions", icon: DollarSign },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    { to: "/admin/messages", label: "Messages", icon: MessageCircle },
    { to: "/admin/profile", label: "Profile", icon: UserCircle2 },
    { to: "/admin/about", label: "About PlayRizon", icon: Info },
  ];

  const toggleOwnerRequests = () => {
    setOwnerRequestsOpen(!ownerRequestsOpen);
  };

  const renderNavItem = (item) => {
    if (item.subItems) {
      return (
        <div key={item.label}>
          <button
            onClick={toggleOwnerRequests}
            title={isCollapsed ? item.label : undefined}
            className={`flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-base-300 ${
              isCollapsed ? "justify-center lg:px-0" : ""
            }`}
          >
            <div className="flex items-center">
              <item.icon size={18} className={isCollapsed ? "" : "mr-2"} />
              <span className={isCollapsed ? "hidden" : ""}>{item.label}</span>
            </div>
            {!isCollapsed && ownerRequestsOpen ? (
              <ChevronUp size={18} />
            ) : !isCollapsed ? (
              <ChevronDown size={18} />
            ) : null}
          </button>
          {ownerRequestsOpen && !isCollapsed && (
            <div className="ml-4">
              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.to}
                  to={subItem.to}
                  className={`flex items-center px-4 py-2 text-sm ${
                    location.pathname === subItem.to
                      ? "bg-accent text-accent-content"
                      : "hover:bg-base-300"
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                >
                  {subItem.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.to}
        to={item.to}
        title={isCollapsed ? item.label : undefined}
        className={`flex items-center px-4 py-2 text-sm ${
          location.pathname === item.to
            ? "bg-accent text-accent-content"
            : "hover:bg-base-300"
        } ${isCollapsed ? "justify-center lg:px-0" : ""}`}
        onClick={() => {
          if (window.innerWidth < 1024) {
            toggleSidebar();
          }
        }}
      >
        <item.icon size={18} className={isCollapsed ? "" : "mr-2"} />
        <span className={isCollapsed ? "hidden" : ""}>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside
      className={`${className} bg-base-200 overflow-y-auto fixed lg:sticky lg:top-16
          ${isCollapsed ? "w-20" : "w-64"} transition-all duration-300 ease-in-out z-30 lg:z-0
          min-h-[calc(100vh-4rem)]`}
    >
      <div
        className={`flex items-center border-b p-4 ${
          isCollapsed ? "justify-center lg:justify-between" : "justify-between"
        }`}
      >
        <span className={`text-xl font-semibold ${isCollapsed ? "hidden lg:hidden" : ""}`}>
          PlayRizon Admin
        </span>
        <button
          type="button"
          onClick={toggleCollapse}
          className="btn btn-ghost btn-sm hidden lg:inline-flex"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <button onClick={toggleSidebar} className="lg:hidden">
          <X size={24} />
        </button>
      </div>
      <nav className="mt-1">{navItems.map(renderNavItem)}</nav>
    </aside>
  );
};

export default AdminSidebar;
