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
  Layers
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  isMobile = false,
  onCloseMobile
}) {
  const { user, isAdmin, isMentor, logout } = useAuth();

  const getNavItems = () => {
    if (isAdmin) {
      return [
        { to: "/dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
        { to: "/users", label: "Staff & Approvals", icon: UserCheck },
        { to: "/interns", label: "Interns Roster", icon: GraduationCap },
        { to: "/alumni", label: "Alumni & Certificates", icon: Award },
        { to: "/mentors", label: "Mentors Directory", icon: Users },
        { to: "/audit-logs", label: "Security & Audit", icon: ShieldCheck },
        { to: "/settings", label: "Settings", icon: Settings },
      ];
    }
    if (isMentor) {
      return [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/internships", label: "Assigned Interns", icon: GraduationCap },
        { to: "/projects", label: "Projects & Tasks", icon: FolderGit2 },
        { to: "/reports", label: "Weekly Reports", icon: FileText },
        { to: "/blockers", label: "Blocker Support", icon: AlertCircle },
        { to: "/evaluations", label: "Evaluations", icon: Award },
        { to: "/settings", label: "Settings", icon: Settings },
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
      { to: "/settings", label: "Settings", icon: Settings },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`bg-[#0B132B] flex flex-col justify-between flex-shrink-0 select-none h-full overflow-hidden text-white transition-all duration-300 ${
        isCollapsed && !isMobile ? "w-20" : "w-64"
      }`}
    >
      {/* Top Header & Nav */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div
          className={`h-20 px-4 border-b border-slate-800/80 flex items-center flex-shrink-0 ${
            isCollapsed && !isMobile ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 border border-blue-400/30 flex items-center justify-center p-2.5 shadow-md shadow-blue-500/20 flex-shrink-0">
              <img src="/netsol_icon.png" alt="Netsol" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="min-w-0">
                <h1 className="font-black text-white tracking-tight text-base leading-tight truncate">
                  Netsol IMS
                </h1>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Enterprise Portal
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links (Scrollable with hidden scrollbar) */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {(!isCollapsed || isMobile) && (
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {isAdmin ? "Governance & Navigation" : "Navigation"}
            </p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={isCollapsed && !isMobile ? item.label : undefined}
                onClick={isMobile ? onCloseMobile : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-2xl text-xs font-bold transition-all group relative ${
                    isCollapsed && !isMobile
                      ? "justify-center p-3"
                      : "justify-between px-3.5 py-3"
                  } ${
                    isActive
                      ? "bg-[#1E293B] text-white shadow-md border border-slate-700/50"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`flex items-center gap-3.5 ${
                        isCollapsed && !isMobile ? "justify-center" : "min-w-0"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                        }`}
                      />
                      {(!isCollapsed || isMobile) && (
                        <span className="truncate text-xs font-bold tracking-wide">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {isActive && (!isCollapsed || isMobile) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer / Logout Button (Aligned with nav item padding) */}
      <div className="p-3 border-t border-slate-800/80 flex-shrink-0 bg-[#0B132B]">
        <button
          onClick={logout}
          title={isCollapsed && !isMobile ? "Logout Account" : undefined}
          className={`w-full flex items-center rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors ${
            isCollapsed && !isMobile ? "justify-center p-3" : "px-3.5 py-3 gap-3.5"
          }`}
        >
          <LogOut className="w-6 h-6 flex-shrink-0" />
          {(!isCollapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
