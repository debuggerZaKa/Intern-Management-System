import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  FolderGit2,
  FileText,
  AlertCircle,
  Award,
  Settings,
  ShieldCheck,
  UserCheck,
  User,
  LogOut,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import logoImg from "../../assets/images/netsol_logo.png";
import StatusBadge from "./StatusBadge";

export default function Sidebar({ onOpenAIChat, isMobile = false, onCloseMobile }) {
  const { user, isAdmin, isMentor, isIntern, logout } = useAuth();

  const getNavItems = () => {
    if (isAdmin) {
      return [
        { to: "/dashboard", label: "Executive Overview", icon: LayoutDashboard },
        { to: "/interns", label: "Interns Directory", icon: GraduationCap },
        { to: "/mentors", label: "Mentors Directory", icon: Users },
        { to: "/users", label: "Users & Approvals", icon: UserCheck },
        { to: "/settings", label: "System Settings", icon: Settings },
        { to: "/audit-logs", label: "Audit Security Logs", icon: ShieldCheck },
        { to: "/profile", label: "My Profile", icon: User },
      ];
    }
    if (isMentor) {
      return [
        { to: "/dashboard", label: "Mentor Portal", icon: LayoutDashboard },
        { to: "/internships", label: "Assigned Interns", icon: Users },
        { to: "/projects", label: "Intern Projects & Tasks", icon: FolderGit2 },
        { to: "/reports", label: "Review Reports", icon: FileText },
        { to: "/blockers", label: "Blockers Support", icon: AlertCircle },
        { to: "/evaluations", label: "Final Evaluations", icon: Award },
        { to: "/profile", label: "My Profile", icon: User },
      ];
    }
    // Intern
    return [
      { to: "/dashboard", label: "Intern Dashboard", icon: LayoutDashboard },
      { to: "/projects", label: "My Projects & Tasks", icon: FolderGit2 },
      { to: "/reports", label: "Weekly Reports", icon: FileText },
      { to: "/blockers", label: "Report Blockers", icon: AlertCircle },
      { to: "/internships", label: "My Internship", icon: Briefcase },
      { to: "/evaluations", label: "My Evaluation", icon: Award },
      { to: "/profile", label: "My Profile", icon: User },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white flex flex-col justify-between flex-shrink-0 select-none h-full overflow-hidden">
      {/* Top Header & Nav */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-blue-500/20">
              N
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-sm">NETSOL</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">
                  IMS
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400">Engineering Portal</p>
            </div>
          </div>
        </div>

        {/* User Card Miniature */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 p-0.5 flex-shrink-0 shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-blue-700 uppercase">
                {user?.profile?.full_name?.slice(0, 2) || user?.email?.slice(0, 2) || "US"}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.profile?.full_name || user?.email}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <StatusBadge status={user?.role?.name || "intern"} size="xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {isAdmin ? "Admin Governance" : "Navigation"}
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={isMobile ? onCloseMobile : undefined}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer / AI Assistant Trigger & Logout */}
      <div className="p-3 border-t border-slate-100 space-y-2 flex-shrink-0 bg-white">
        {onOpenAIChat && (
          <button
            onClick={onOpenAIChat}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-200/60 text-blue-700 hover:from-blue-600 hover:to-indigo-600 hover:text-white transition-all text-xs font-bold group shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 group-hover:text-white animate-pulse" />
              <span>AI Assistant</span>
            </div>
            <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 group-hover:bg-white/20 group-hover:text-white">
              Llama 3.3
            </span>
          </button>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
