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
  ChevronRight,
  Layers
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Sidebar({ onOpenAIChat, isMobile = false, onCloseMobile }) {
  const { user, isAdmin, isMentor, isIntern, logout } = useAuth();

  const getNavItems = () => {
    if (isAdmin) {
      return [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/interns", label: "Interns Roster", icon: GraduationCap },
        { to: "/mentors", label: "Mentors Directory", icon: Users },
        { to: "/users", label: "Staff & Approvals", icon: UserCheck },
        { to: "/settings", label: "System Settings", icon: Settings },
        { to: "/audit-logs", label: "Security & Audit", icon: ShieldCheck },
        { to: "/profile", label: "Account Profile", icon: User },
      ];
    }
    if (isMentor) {
      return [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/internships", label: "Assigned Interns", icon: Users },
        { to: "/projects", label: "Projects & Tasks", icon: FolderGit2 },
        { to: "/reports", label: "Weekly Reports", icon: FileText },
        { to: "/blockers", label: "Blocker Support", icon: AlertCircle },
        { to: "/evaluations", label: "Evaluations", icon: Award },
        { to: "/profile", label: "Account Profile", icon: User },
      ];
    }
    // Intern
    return [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/projects", label: "My Projects & Tasks", icon: FolderGit2 },
      { to: "/reports", label: "Weekly Reports", icon: FileText },
      { to: "/blockers", label: "Blocker Logs", icon: AlertCircle },
      { to: "/internships", label: "Internship Track", icon: Briefcase },
      { to: "/evaluations", label: "Performance Review", icon: Award },
      { to: "/profile", label: "Account Profile", icon: User },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-[#0B132B] flex flex-col justify-between flex-shrink-0 select-none h-full overflow-hidden text-white">
      {/* Top Header & Nav */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-slate-800/80 flex items-center gap-3.5 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-white shadow-inner">
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-white tracking-tight text-base leading-tight">NetSol IMS</h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Enterprise Portal</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto min-h-0">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
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
                  `flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group relative ${
                    isActive
                      ? "bg-[#1E293B] text-white shadow-sm before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-white before:rounded-r-full"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3.5 min-w-0 pl-1">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800/80 flex-shrink-0 bg-[#0B132B]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
