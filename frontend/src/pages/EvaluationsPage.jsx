import React, { useState, useEffect } from "react";
import { Award, Star, BookOpen, User, CheckCircle2 } from "lucide-react";
import { evaluationService } from "../services/evaluationService";
import { internshipService } from "../services/internshipService";
import { useAuth } from "../hooks/useAuth";
import AppLayout from "../components/common/AppLayout";
import StatusBadge from "../components/common/StatusBadge";
import EvaluationModal from "../components/mentor/EvaluationModal";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";

export default function EvaluationsPage() {
  const { isIntern, isMentor, isAdmin } = useAuth();
  const [internships, setInternships] = useState([]);
  const [evaluationsMap, setEvaluationsMap] = useState({}); // { [internshipId]: evalObj }
  const [selectedInternshipForEval, setSelectedInternshipForEval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await internshipService.getInternships();
      setInternships(list || []);

      // Load evaluations for each internship
      const evalPromises = (list || []).map(async (item) => {
        try {
          const evalRes = await evaluationService.getInternshipEvaluation(item.id);
          return { id: item.id, data: evalRes };
        } catch {
          return { id: item.id, data: null };
        }
      });

      const evalResults = await Promise.all(evalPromises);
      const map = {};
      evalResults.forEach((res) => {
        if (res.data) map[res.id] = res.data;
      });
      setEvaluationsMap(map);
    } catch (err) {
      console.error("Failed to load evaluations:", err);
      setError(err.message || "Failed to load evaluation records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {loading ? (
          <Loader message="Loading evaluation records..." />
        ) : internships.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No internship tracks found"
            description="Evaluations are attached to active 6-week internship tracks."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {internships.map((internship) => {
              const evalRecord = evaluationsMap[internship.id];
              return (
                <div
                  key={internship.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs">
                          {internship.intern?.profile?.full_name?.slice(0, 2) || "IN"}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">
                            {internship.intern?.profile?.full_name || internship.intern?.email}
                          </h4>
                          <p className="text-[11px] text-slate-500">{internship.department}</p>
                        </div>
                      </div>
                      <StatusBadge status={evalRecord ? "approved" : "pending"} size="xs" customLabel={evalRecord ? "Evaluated" : "Pending"} />
                    </div>

                    {evalRecord ? (
                      <div className="space-y-3 pt-2">
                        {/* Scores row */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100">
                            <p className="text-[10px] font-bold text-indigo-700 uppercase">Overall</p>
                            <p className="text-base font-black text-indigo-950 mt-0.5">{evalRecord.overall_rating}/10</p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-100">
                            <p className="text-[10px] font-bold text-blue-700 uppercase">Technical</p>
                            <p className="text-base font-black text-blue-950 mt-0.5">{evalRecord.technical_skills_rating}/5</p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-100">
                            <p className="text-[10px] font-bold text-purple-700 uppercase">Soft Skills</p>
                            <p className="text-base font-black text-purple-950 mt-0.5">{evalRecord.soft_skills_rating}/5</p>
                          </div>
                        </div>

                        {/* Recommendation */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">Recommendation:</span>
                          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md uppercase text-[10px]">
                            {evalRecord.recommendation}
                          </span>
                        </div>

                        {evalRecord.final_comments && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                            "{evalRecord.final_comments}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 py-4 text-center">
                        End-of-internship appraisal has not yet been submitted.
                      </p>
                    )}
                  </div>

                  {/* Actions for Mentor & Admin */}
                  {(isMentor || isAdmin) && (
                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => setSelectedInternshipForEval(internship)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/20 transition-colors"
                      >
                        {evalRecord ? "Edit Evaluation" : "Complete Evaluation"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Evaluation Modal */}
        {selectedInternshipForEval && (
          <EvaluationModal
            isOpen={!!selectedInternshipForEval}
            onClose={() => setSelectedInternshipForEval(null)}
            internship={selectedInternshipForEval}
            existingEvaluation={evaluationsMap[selectedInternshipForEval.id]}
            onEvaluationSaved={loadData}
          />
        )}
      </div>
    </AppLayout>
  );
}
