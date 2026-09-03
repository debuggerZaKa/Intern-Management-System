import React from "react";
import { User } from "lucide-react";
import { getMediaUrl } from "../../utils/mediaUtils";

export default function UserAvatar({
  avatarUrl,
  name = "User",
  size = "md", // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className = "",
}) {
  const resolvedUrl = avatarUrl ? getMediaUrl(avatarUrl) : null;

  const sizeClasses = {
    xs: "w-7 h-7 rounded-lg text-[10px]",
    sm: "w-9 h-9 rounded-xl text-xs",
    md: "w-11 h-11 rounded-2xl text-sm",
    lg: "w-14 h-14 rounded-2xl text-base",
    xl: "w-20 h-20 rounded-3xl text-xl",
  }[size] || "w-11 h-11 rounded-2xl text-sm";

  const iconSizes = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-9 h-9",
  }[size] || "w-5 h-5";

  if (resolvedUrl) {
    return (
      <img
        src={resolvedUrl}
        alt={name}
        className={`${sizeClasses} object-cover border border-slate-200/90 shadow-xs flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} bg-blue-50/80 border border-blue-100/90 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-xs ${className}`}
      title={name}
    >
      <User className={`${iconSizes} text-blue-500`} />
    </div>
  );
}
