import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = "blue",
  onClick,
}) {
  const colorMap = {
    blue: {
      bg: "from-blue-500/10 to-indigo-500/10 border-blue-100",
      iconBg: "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/25",
      accent: "text-blue-600",
    },
    emerald: {
      bg: "from-emerald-500/10 to-teal-500/10 border-emerald-100",
      iconBg: "bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-emerald-500/25",
      accent: "text-emerald-600",
    },
    amber: {
      bg: "from-amber-500/10 to-orange-500/10 border-amber-100",
      iconBg: "bg-gradient-to-tr from-amber-600 to-orange-600 text-white shadow-amber-500/25",
      accent: "text-amber-600",
    },
    purple: {
      bg: "from-purple-500/10 to-pink-500/10 border-purple-100",
      iconBg: "bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-purple-500/25",
      accent: "text-purple-600",
    },
    rose: {
      bg: "from-rose-500/10 to-red-500/10 border-rose-100",
      iconBg: "bg-gradient-to-tr from-rose-600 to-red-600 text-white shadow-rose-500/25",
      accent: "text-rose-600",
    },
    indigo: {
      bg: "from-indigo-500/10 to-violet-500/10 border-indigo-100",
      iconBg: "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-indigo-500/25",
      accent: "text-indigo-600",
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        onClick ? "cursor-pointer hover:border-blue-300" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
            {value !== undefined && value !== null ? value : "—"}
          </h3>
        </div>
        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${scheme.iconBg}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend !== undefined) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                trend >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend > 0 ? `+${trend}%` : `${trend}%`} {trendLabel || ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
