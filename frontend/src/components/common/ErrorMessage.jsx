import React from "react";
import { AlertCircle, X } from "lucide-react";

export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;

  let displayMessage = message;
  if (typeof message === "object") {
    if (Array.isArray(message)) {
      displayMessage = message.map((m) => (typeof m === "object" ? m.msg || JSON.stringify(m) : m)).join(", ");
    } else if (message.detail) {
      displayMessage = typeof message.detail === "string" ? message.detail : JSON.stringify(message.detail);
    } else if (message.message) {
      displayMessage = message.message;
    } else {
      displayMessage = JSON.stringify(message);
    }
  }

  return (
    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start justify-between gap-3 animate-fadeIn">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
        <span className="leading-relaxed font-medium">{String(displayMessage)}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-700 transition-colors flex-shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
