import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function AdminLayout({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const activeLabel = (() => {
    if (location.pathname === "/dashboard/add-school") {
      return "Add School";
    }

    if (location.pathname === "/dashboard/add-owner") {
      return "Add Owner";
    }

    return "Dashboard";
  })();

  const handleMenuSelect = (menuLabel) => {
    if (menuLabel === "Add School") {
      navigate("/dashboard/add-school");
      return;
    }

    if (menuLabel === "Add Owner") {
      navigate("/dashboard/add-owner");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <main className="min-h-screen py-4 pr-4 md:py-6 md:pr-6 lg:py-0 lg:pr-6">
      <section className="flex min-h-screen w-full flex-col gap-4 lg:flex-row lg:gap-6">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() =>
            setIsSidebarCollapsed((previousState) => !previousState)
          }
          activeLabel={activeLabel}
          onMenuSelect={handleMenuSelect}
          onLogout={onLogout}
        />

        <div className="flex-1 space-y-5 px-4 md:px-6 lg:pl-0 lg:pr-0 lg:pt-6">
          <Outlet />
        </div>
      </section>
    </main>
  );
}

export default AdminLayout;
