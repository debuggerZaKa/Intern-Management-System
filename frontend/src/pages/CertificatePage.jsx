import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Printer, ArrowLeft, X, Award, CheckCircle2 } from "lucide-react";
import { internshipService } from "../services/internshipService";
import CertificateDocument from "../components/common/CertificateDocument";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";

export default function CertificatePage() {
  const { internshipId } = useParams();
  const [searchParams] = useSearchParams();
  const idFromQuery = searchParams.get("id");
  const targetId = internshipId || idFromQuery;

  const [internData, setInternData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        setLoading(true);
        setError(null);
        let data = null;

        if (targetId) {
          data = await internshipService.getInternshipById(targetId);
        } else {
          data = await internshipService.getActiveInternship();
        }

        setInternData(data);
      } catch (err) {
        console.error("Failed to load certificate:", err);
        setError(err.message || "Failed to load official certificate record.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateData();
  }, [targetId]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      window.close();
      // fallback if window.close is blocked
      window.history.back();
    } else {
      window.close();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader message="Loading official certificate record..." />
      </div>
    );
  }

  if (error || !internData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full space-y-4 text-center">
          <ErrorMessage message={error || "Certificate record not found."} />
          <button
            onClick={handleClose}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-800/90 py-8 px-4 sm:px-6 print:p-0 print:m-0 print:bg-white flex flex-col items-center">
      
      {/* Top Floating Action Bar (Hidden in Print) */}
      <div className="w-full max-w-[800px] mb-6 flex items-center justify-between gap-4 bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-2xl shadow-xl border border-white/20 print:hidden sticky top-4 z-50 animate-fadeIn">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
              Official NETSOL Internship Certificate
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold">
              Recipient: {internData.intern?.profile?.full_name || internData.intern?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            title="Print or Save as PDF"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>

          <button
            onClick={handleClose}
            title="Close Certificate View"
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* A4 Letterhead Certificate Container */}
      <div className="bg-white shadow-2xl rounded-sm border border-slate-300 print:border-none print:shadow-none print:rounded-none w-full max-w-[800px] overflow-hidden">
        <CertificateDocument internData={internData} />
      </div>

    </div>
  );
}
