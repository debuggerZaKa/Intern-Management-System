import React from "react";

export default function Loader({ fullScreen = false, message = "Loading..." }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      {message && <p className="text-xs font-semibold text-slate-500 tracking-wide">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
