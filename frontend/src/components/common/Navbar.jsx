import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  Bell,
  Sparkles,
  User as UserIcon,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import StatusBadge from "./StatusBadge";

export default function Navbar({ onToggleMobileSidebar, onOpenAIChat }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Compute readable breadcrumb from route path
  const getBreadcrumb = () => {
    const path = location.pathname.replace("/", "");
    if (!path || path === "dashboard") return "Dashboard Overview";
    return path
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Mobile Sidebar Trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline">Internship System</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
          <span className="font-bold text-slate-800">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Right: Quick AI chat, notifications, profile */}
      <div className="flex items-center gap-3">
        {onOpenAIChat && (
          <button
            onClick={onOpenAIChat}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </button>
        )}

        <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

        {/* User Badge Profile Link */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            {user?.profile?.full_name?.slice(0, 1) || user?.email?.slice(0, 1) || "U"}
          </div>
          <div className="hidden md:block text-left leading-tight">
            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-[140px]">
              {user?.profile?.full_name || user?.email}
            </p>
            <span className="text-[10px] text-slate-400 font-medium capitalize">
              {user?.role?.name || "User"}
            </span>
          </div>
        </Link>

        {/* Logout Quick Button */}
        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
