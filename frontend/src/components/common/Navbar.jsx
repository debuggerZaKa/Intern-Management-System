import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  Sparkles,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar({ onToggleMobileSidebar, onOpenAIChat }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Compute clean readable page title
  const getPageTitle = () => {
    const path = location.pathname.replace("/", "");
    if (!path || path === "dashboard") return "Dashboard Overview";
    if (path === "interns") return "Interns Roster";
    if (path === "mentors") return "Mentors Directory";
    if (path === "users") return "Staff & Approvals";
    if (path === "internships") return "Internship Management";
    if (path === "projects") return "Projects & Tasks";
    if (path === "reports") return "Weekly Reports";
    if (path === "blockers") return "Blocker Logs & Support";
    if (path === "evaluations") return "Performance Evaluations";
    if (path === "settings") return "System Settings";
    if (path === "audit-logs") return "Security & Audit Logs";
    if (path === "profile") return "Account Profile";
    return path
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const initial = user?.profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U";

  return (
    <header className="h-20 px-4 sm:px-8 bg-transparent flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Mobile Trigger & Bold Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: User Profile Card */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Card matching screenshot */}
        <Link
          to="/profile"
          className="flex items-center gap-3 py-1.5 px-2.5 rounded-2xl hover:bg-white/80 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300/80 text-slate-800 font-extrabold flex items-center justify-center text-sm uppercase shadow-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {initial}
          </div>
          <div className="hidden md:block text-left leading-none">
            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[160px]">
              {user?.profile?.full_name || user?.email}
            </p>
            <span className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase mt-1 inline-block">
              {user?.role?.name || "User"}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}

