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
      bg: "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-500/20 border border-blue-500/30",
      hover: "hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/30",
    },
    emerald: {
      bg: "bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-lg shadow-emerald-500/20 border border-emerald-500/30",
      hover: "hover:scale-[1.01] hover:shadow-xl hover:shadow-emerald-500/30",
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/20 border border-amber-500/30",
      hover: "hover:scale-[1.01] hover:shadow-xl hover:shadow-amber-500/30",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white shadow-lg shadow-purple-500/20 border border-purple-500/30",
      hover: "hover:scale-[1.01] hover:shadow-xl hover:shadow-purple-500/30",
    },
    rose: {
      bg: "bg-gradient-to-br from-rose-600 via-rose-700 to-red-700 text-white shadow-lg shadow-rose-500/20 border border-rose-500/30",
      hover: "hover:scale-[1.01] hover:shadow-xl hover:shadow-rose-500/30",
    },
    indigo: {
      bg: "bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-lg shadow-indigo-500/20 border border-indigo-500/30",
      hover: "hover:scale-[1.01] hover:shadow-xl hover:shadow-indigo-500/30",
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between ${scheme.bg} ${
        onClick ? `cursor-pointer ${scheme.hover}` : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold text-white/80 tracking-wider uppercase">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
            {value !== undefined && value !== null ? value : "—"}
          </h3>
        </div>
        {Icon && (
          <Icon className="w-7 h-7 text-white/90 flex-shrink-0" />
        )}
      </div>

      {(subtitle || trend !== undefined) && (
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
          {subtitle && <span className="text-white/80 font-medium">{subtitle}</span>}
          {trend !== undefined && (
            <span
              className="inline-flex items-center gap-0.5 font-semibold text-white bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm"
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

