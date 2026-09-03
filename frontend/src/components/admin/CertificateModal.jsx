import React from "react";
import { Award, Printer, X, ExternalLink } from "lucide-react";
import Modal from "../common/Modal";
import CertificateDocument from "../common/CertificateDocument";

export default function CertificateModal({ isOpen, onClose, internData }) {
  if (!internData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleOpenInNewTab = () => {
    if (internData?.id) {
      window.open(`/certificate/${internData.id}`, "_blank");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="space-y-4">
        {/* Top Actions Bar (Hidden in Print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Official NETSOL Internship Certificate</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenInNewTab}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Full Tab</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Document Container */}
        <div className="bg-white shadow-2xl rounded-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none">
          <CertificateDocument internData={internData} />
        </div>
      </div>
    </Modal>
  );
}
