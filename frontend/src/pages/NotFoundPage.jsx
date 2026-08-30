import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F0F3F8] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
        The requested page does not exist or has been relocated.
      </p>
      <Link
        to="/dashboard"
        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}
