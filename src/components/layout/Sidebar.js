import {
  ChevronLeft,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
} from "lucide-react";

function Sidebar({ isCollapsed, onToggle, onLogout }) {
  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Students", icon: Users },
    { label: "Reports", icon: FileText },
    { label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`border-r border-slate-200 bg-white/95 backdrop-blur transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-5 flex items-center justify-between gap-2 px-1">
          <div
            className={`font-bold text-slate-900 ${isCollapsed ? "hidden" : "block"}`}
          >
            Superadmin
          </div>
          <button
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            type="button"
            onClick={onToggle}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100"
                type="button"
              >
                <Icon size={19} />
                <span className={isCollapsed ? "hidden" : "inline"}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <button
          className="mt-auto flex items-center gap-3 rounded-lg bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-700"
          type="button"
          onClick={onLogout}
        >
          <LogOut size={18} />
          <span className={isCollapsed ? "hidden" : "inline"}>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
