import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, SlidersHorizontal, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar({ onToggleSidebar, isSidebarCollapsed }) {
  const { user } = useAuth();
  const location = useLocation();

  // Compute clean readable page title
  const getPageTitle = () => {
    const path = location.pathname.replace("/", "");
    if (!path || path === "dashboard") return "Dashboard Overview";
    if (path === "interns") return "Interns Cohort Roster";
    if (path === "alumni") return "Alumni Roster & Certificate Portal";
    if (path === "mentors") return "Mentors Directory";
    if (path === "internships") {
      if (user?.role?.name === "mentor") return "Assigned Interns";
      if (user?.role?.name === "intern") return "Internship Track";
      return "Internship Management";
    }
    if (path === "reports") return "Weekly Reports";
    if (path === "blockers") return "Blocker Logs & Support";
    if (path === "evaluations") return "Performance Reviews";
    if (path === "settings") return "System Settings";
    if (path === "audit-logs") return "Security & Audit Logs";
    if (path === "profile") return "Account Profile";
    return path
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const fullName = user?.profile?.full_name || (user?.email ? user.email.split("@")[0] : "System Administrator");
  const roleName = (user?.role?.name || "ADMIN").toUpperCase();
  const initial = fullName.charAt(0).toUpperCase() || "S";

  return (
    <header className="sticky top-0 z-20 h-20 px-4 sm:px-8 bg-white/75 backdrop-blur-md border-b border-slate-200/70 shadow-xs flex items-center justify-between gap-4 transition-all">
      {/* Left: Sidebar Toggle Button & Page Name */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors focus:outline-none"
        >
          <Menu className="w-6 h-6 text-slate-700" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: User Profile Info Header matching screenshot */}
      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="flex items-center gap-3 py-1.5 px-3 rounded-2xl hover:bg-slate-100/60 transition-all group"
        >
          <div className="text-right leading-tight hidden sm:block">
            <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[180px]">
              {fullName}
            </p>
            <span className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mt-0.5 block">
              {roleName}
            </span>
          </div>

          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300/80 text-slate-900 font-black flex items-center justify-center text-sm shadow-xs group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
            {initial}
          </div>
        </Link>
      </div>
    </header>
  );
}
