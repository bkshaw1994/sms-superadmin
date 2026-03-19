import { useSelector } from "react-redux";
import {
  Building2,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { selectAuthDisplayName } from "../../features/auth/authSlice";

function Sidebar({
  isCollapsed,
  onToggle,
  onLogout,
  activeLabel,
  onMenuSelect,
}) {
  const displayName = useSelector(selectAuthDisplayName);
  const menuItems = [
    { label: "OverView", icon: Sparkles },
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Add School", icon: Building2 },
    { label: "Add Owner", icon: UserPlus },
  ];

  return (
    <aside
      className={`sidebar-surface w-full shrink-0 transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:rounded-l-none ${
        isCollapsed ? "lg:w-24" : "lg:w-72"
      }`}
    >
      <div className="relative flex h-full flex-col px-3 py-4 lg:px-4 lg:py-5">
        <div
          className={`mb-6 rounded-[24px] border border-white/10 bg-white/5 p-3 ${
            isCollapsed
              ? "flex justify-center"
              : "flex items-start justify-between gap-3"
          }`}
        >
          <div
            className={`flex items-center gap-3 ${isCollapsed ? "hidden" : "flex"}`}
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-400/15 text-teal-200 ring-1 ring-white/10">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="mt-1 font-bold text-white">
                {displayName || "Admin"}
              </div>
            </div>
          </div>
          <button
            className={`rounded-2xl border p-2.5 transition ${
              isCollapsed
                ? "border-teal-300/30 bg-teal-400 text-slate-950 shadow-lg shadow-teal-950/30 hover:bg-teal-300"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            type="button"
            onClick={onToggle}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <div className={isCollapsed ? "hidden" : "mb-3 px-2"}>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-slate-500">
            Workspace
          </p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeLabel === item.label;

            return (
              <button
                key={item.label}
                className={`flex w-full items-center rounded-2xl px-3 py-3 text-left transition ${
                  isActive
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-cyan-950/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                } ${isCollapsed ? "justify-center" : "gap-3"}`}
                type="button"
                onClick={() => onMenuSelect(item.label)}
              >
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${
                    isActive ? "bg-white/15" : "bg-white/5"
                  }`}
                >
                  <Icon size={19} />
                </div>
                <div className={isCollapsed ? "hidden" : "block"}>
                  <span className="block text-sm font-semibold">
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        <button
          className={`mt-auto flex items-center justify-center rounded-2xl border border-white/10 bg-white px-3 py-3 font-semibold text-slate-900 transition hover:bg-amber-50 ${
            isCollapsed ? "gap-0" : "gap-3"
          }`}
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
