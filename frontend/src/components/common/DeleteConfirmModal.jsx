import React from "react";
import {
  AlertTriangle,
  ShieldAlert,
  Trash2,
  Lock,
  ArrowRight,
  CheckCircle2,
  X
} from "lucide-react";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  isBlocked = false,
  blockedReason,
  dependencies = [],
  resolutionText,
  resolutionAction,
  confirmText = "Delete Permanently",
  confirmLoading = false,
  warningMessage = "This action is permanent and cannot be reversed.",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip with Close Button */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                isBlocked
                  ? "bg-amber-100 text-amber-600 border border-amber-200"
                  : "bg-rose-100 text-rose-600 border border-rose-200"
              }`}
            >
              {isBlocked ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  isBlocked
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {isBlocked ? "Action Restricted" : "Confirm Deletion"}
              </span>
              <h3 className="text-base font-black text-slate-900 tracking-tight mt-0.5">
                {title || (isBlocked ? "Cannot Delete Record" : "Delete Item")}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 space-y-4">
          {itemName && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                Target Record
              </span>
              <p className="text-sm font-extrabold text-slate-900 truncate mt-0.5">
                {itemName}
              </p>
            </div>
          )}

          {/* Blocked or Warning Description */}
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {isBlocked
              ? blockedReason ||
                "This record is linked to active system dependencies and cannot be removed directly."
              : `Are you sure you want to delete this record? Review the impact below before proceeding.`}
          </p>

          {/* Dependencies / Impact Breakdown Card */}
          {dependencies.length > 0 && (
            <div
              className={`p-3.5 rounded-2xl border space-y-2 ${
                isBlocked
                  ? "bg-amber-50/70 border-amber-200"
                  : "bg-slate-50/90 border-slate-200/80"
              }`}
            >
              <span
                className={`text-[11px] font-black uppercase tracking-wider block ${
                  isBlocked ? "text-amber-800" : "text-slate-700"
                }`}
              >
                {isBlocked ? "Blocking Dependencies" : "Items to be Removed"}
              </span>
              <ul className="space-y-1.5">
                {dependencies.map((dep, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs font-bold text-slate-700"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        isBlocked ? "bg-amber-500" : "bg-rose-500"
                      }`}
                    />
                    <span>{typeof dep === "string" ? dep : dep.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Guidance on what to do if blocked */}
          {isBlocked && resolutionText && (
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-blue-800 text-xs font-black">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span>Recommended Resolution</span>
              </div>
              <p className="text-[11px] text-blue-900/80 font-medium leading-relaxed">
                {resolutionText}
              </p>
            </div>
          )}

          {/* Warning disclaimer if allowed deletion */}
          {!isBlocked && warningMessage && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-rose-600 bg-rose-50/80 border border-rose-200/80 px-3 py-2 rounded-xl">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{warningMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            {isBlocked ? "Dismiss" : "Cancel"}
          </button>

          {isBlocked ? (
            resolutionAction && (
              <button
                type="button"
                onClick={() => {
                  resolutionAction.onClick();
                  onClose();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>{resolutionAction.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmLoading ? "Deleting..." : confirmText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
