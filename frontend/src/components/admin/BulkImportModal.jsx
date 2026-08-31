import React, { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import Modal from "../common/Modal";
import { adminService } from "../../services/adminService";
import ErrorMessage from "../common/ErrorMessage";

export default function BulkImportModal({ isOpen, onClose, onImportCompleted }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a .csv or .xlsx file to upload.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await adminService.bulkImportInterns(file);
      setResult(res);
      onImportCompleted?.();
    } catch (err) {
      console.error("Bulk import failed:", err);
      setError(err.message || "Failed to process bulk import.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Import Interns"
      subtitle="Upload a CSV or Excel (.xlsx) file with intern information"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {result ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Import Completed Successfully</span>
            </div>
            <p className="text-xs text-emerald-700">
              {result.message || `Processed ${result.imported_count || 0} intern accounts.`}
            </p>
            {result.errors && result.errors.length > 0 && (
              <div className="mt-2 text-[11px] bg-white/80 p-2.5 rounded-xl border border-emerald-200 text-slate-700">
                <p className="font-semibold text-amber-800 mb-1">Warnings/Skipped rows:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {result.errors.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                id="bulk-import-file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="bulk-import-file" className="cursor-pointer block">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {file ? file.name : "Click to choose CSV or Excel file"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supported columns: <code className="text-slate-600 font-mono">email, full_name, password, department, university</code>
                </p>
              </label>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                Imported interns will be created with status <code className="font-semibold">active</code> and the <code className="font-semibold">intern</code> role.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || loading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
              >
                {loading ? "Uploading & Importing..." : "Start Import"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
