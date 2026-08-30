import React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AccessDenied({ message = "Access Denied: You do not have the required permissions to view this resource." }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">403 - Permission Restricted</h2>
      <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-6">
        {message}
      </p>
      <button
        onClick={() => navigate("/dashboard")}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Return to Dashboard
      </button>
    </div>
  );
}
