import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Bell, LogOut, User, ShieldCheck } from "lucide-react";
import logoImg from "../../assets/images/netsol_logo.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="px-6 py-3.5 flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src={logoImg} alt="NETSOL Logo" className="h-8 w-auto object-contain" />
          <div className="border-l border-slate-300 pl-3">
            <span className="text-xs font-bold text-slate-800 tracking-tight block">IMS Portal</span>
            <span className="text-[10px] text-blue-600 font-semibold block uppercase">AI Progress Hub</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{user.profile?.full_name || user.email}</p>
              <div className="flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-semibold text-slate-500 capitalize">{user.role?.name || "Intern"}</span>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user.profile?.full_name ? user.profile.full_name.charAt(0).toUpperCase() : "U"}
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
