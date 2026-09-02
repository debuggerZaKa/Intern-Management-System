import React from "react";
import { Award, Calendar, CheckCircle2, Download, Printer, X, ShieldCheck, Building } from "lucide-react";
import Modal from "../common/Modal";

export default function CertificateModal({ isOpen, onClose, internData }) {
  if (!internData) return null;

  const internName = internData.intern?.profile?.full_name || internData.intern?.email || "Engineering Intern";
  const department = internData.department || internData.intern?.profile?.department || "Software Engineering";
  const durationWeeks = internData.duration_weeks || 6;
  const startDate = internData.start_date || "2026-06-01";
  const endDate = internData.end_date || "2026-07-15";
  const certId = `NETSOL-CERT-${new Date().getFullYear()}-${String(internData.id || 101).padStart(5, "0")}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="space-y-4 print:p-0">
        {/* Modal Top Actions (Hidden when printing) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-900">Certificate of Completion</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Certificate Container */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-2 rounded-3xl shadow-xl border border-blue-500/30 font-sans print:m-0 print:border-none print:shadow-none">
          <div className="bg-white rounded-2xl p-8 sm:p-12 border-4 border-double border-amber-400/80 relative overflow-hidden text-center space-y-6">
            
            {/* Background Seal Watermark Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
              <Award className="w-96 h-96 text-blue-900" />
            </div>

            {/* Certificate Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 flex items-center justify-center p-2 shadow-xs">
                  <img src="/netsol_icon.png" alt="NetSol" className="w-full h-full object-contain brightness-0 invert" />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-slate-900 text-sm tracking-wider uppercase">NetSol Technologies</h4>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Enterprise Internship Program</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Certificate ID</span>
                <span className="text-xs font-mono font-bold text-slate-700">{certId}</span>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="py-2 space-y-1">
              <span className="text-xs font-bold text-amber-600 tracking-widest uppercase bg-amber-50 px-4 py-1 rounded-full border border-amber-200 inline-block">
                Official Recognition
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-serif pt-2">
                Certificate of Completion
              </h1>
              <p className="text-xs text-slate-500 font-semibold tracking-wide">
                This certificate is proudly awarded to
              </p>
            </div>

            {/* Candidate Name */}
            <div className="py-2">
              <h2 className="text-2xl sm:text-3xl font-black text-blue-700 border-b-2 border-slate-200 inline-block px-8 pb-1 tracking-tight">
                {internName}
              </h2>
            </div>

            {/* Citation Text */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl mx-auto font-medium">
              In recognition of successful completion of the intensive <strong className="text-slate-900 font-extrabold">{durationWeeks}-Week Engineering Internship Track</strong> within the <strong className="text-slate-900 font-extrabold">{department}</strong> department, demonstrating exceptional technical competency, software deliverables, and professional dedication.
            </p>

            {/* Program Dates */}
            <div className="inline-flex items-center gap-6 px-6 py-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Start Date: <strong className="text-slate-900">{startDate}</strong></span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>End Date: <strong className="text-slate-900">{endDate}</strong></span>
              </div>
            </div>

            {/* Signatures & Seal Footer */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-4 items-end">
              {/* Left Signature */}
              <div className="text-center space-y-1">
                <div className="h-10 border-b border-slate-400 w-36 mx-auto flex items-end justify-center pb-1">
                  <span className="font-serif italic font-bold text-slate-700 text-sm">Corporate HR</span>
                </div>
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Head of People & HR</p>
                <p className="text-[9px] text-slate-400">NetSol Technologies Ltd.</p>
              </div>

              {/* Middle Official Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-lg border-4 border-white">
                  <Award className="w-8 h-8" />
                </div>
                <span className="text-[9px] font-extrabold text-amber-700 uppercase tracking-widest mt-1">Verified Certificate</span>
              </div>

              {/* Right Signature */}
              <div className="text-center space-y-1">
                <div className="h-10 border-b border-slate-400 w-36 mx-auto flex items-end justify-center pb-1">
                  <span className="font-serif italic font-bold text-slate-700 text-sm">Eng. Leadership</span>
                </div>
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">VP Software Engineering</p>
                <p className="text-[9px] text-slate-400">NetSol Technologies Ltd.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Modal>
  );
}
