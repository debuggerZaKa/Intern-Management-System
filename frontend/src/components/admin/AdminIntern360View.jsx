import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  UserCheck,
  Briefcase,
  Code2,
  CheckSquare,
  FileText,
  Award,
  Sparkles,
  Github,
  ExternalLink,
  Clock,
  CheckCircle2,
  Brain,
  MessageSquare,
  User,
  Mail,
  Building,
  GraduationCap,
  AlertCircle,
  FolderGit2
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { mentorService } from "../../services/mentorService";
import { projectService } from "../../services/projectService";
import { evaluationService } from "../../services/evaluationService";
import StatusBadge from "../common/StatusBadge";
import Loader from "../common/Loader";
import ErrorMessage from "../common/ErrorMessage";

export default function AdminIntern360View({ internId, onBack }) {
  const [internUser, setInternUser] = useState(null);
  const [internship, setInternship] = useState(null);
  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDossierData = async () => {
    try {
      setLoading(true);

      // 1. Fetch all users to get full baseline user profile
      const allUsers = await adminService.getUsers();
      const targetUser = (allUsers || []).find((u) => u.id === internId);
      setInternUser(targetUser || null);

      // 2. Fetch projects
      let allProjects = [];
      try {
        allProjects = await projectService.getProjects();
      } catch (e) {
        allProjects = [];
      }

      // 3. Attempt to fetch active internship details
      let internshipData = null;
      try {
        internshipData = await mentorService.getAssignedInternDetails(internId);
        setInternship(internshipData);
      } catch (e) {
        setInternship(null);
      }

      // 4. Attempt to fetch reports, tasks, and evaluations if internship exists
      if (internshipData) {
        try {
          const reportsData = await mentorService.getAssignedInternReports(internId);
          setReports(reportsData || []);
        } catch (e) {
          setReports([]);
        }

        try {
          const tasksData = await mentorService.getAssignedInternTasks(internId);
          setTasks(tasksData || []);
        } catch (e) {
          setTasks([]);
        }

        const filteredProjects = (allProjects || []).filter(
          (p) => p.internship_id === internshipData.id
        );
        setProjects(filteredProjects);

        try {
          const evalData = await evaluationService.getInternshipEvaluation(internshipData.id);
          setEvaluation(evalData);
        } catch (e) {
          setEvaluation(null);
        }
      } else {
        setReports([]);
        setTasks([]);
        setProjects([]);
        setEvaluation(null);
      }
    } catch (err) {
      console.error("Failed to load intern profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (internId) {
      loadDossierData();
    }
  }, [internId]);

  if (loading) {
    return <Loader message="Generating 360° Management Dossier..." />;
  }

  const intern = internship?.intern || internUser;
  const mentor = internship?.mentor;
  const currentWeek = internship?.current_week || 1;
  const duration = internship?.duration_weeks || 6;
  const progressPercent = internship ? Math.min(100, Math.round((currentWeek / duration) * 100)) : 0;

  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const taskRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const totalLoggedHours = tasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Back Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Interns Roster</span>
        </button>

        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
          Executive Read-Only Dossier
        </span>
      </div>

      {/* Unpaired Notice Banner if no internship record exists */}
      {!internship && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Intern User Account Registered &bull; Pending Mentor Pairing</span>
          </div>
          <span className="text-[11px] text-amber-800 font-semibold bg-amber-100/80 px-2.5 py-1 rounded-lg">
            Unassigned Track
          </span>
        </div>
      )}

      {/* Intern Overview Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {intern?.profile?.full_name?.slice(0, 2) || intern?.email?.slice(0, 2) || "IN"}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {intern?.profile?.full_name || intern?.email}
              </h2>
              <StatusBadge status={internship?.status || intern?.status || "active"} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
              <span>{intern?.profile?.university || "University Student"} &bull; {intern?.profile?.degree || "CS Degree"} ({intern?.profile?.semester || "Enrolled"})</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {intern?.email} &bull; {intern?.profile?.phone || "No phone listed"} &bull; Track: <strong>{internship?.department || intern?.profile?.department || "Software Engineering"}</strong>
            </p>
          </div>
        </div>

        {/* Supervision Info */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 w-full lg:w-72">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supervising Mentor</span>
          <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-blue-600" />
            {mentor?.profile?.full_name || mentor?.email || "Unassigned"}
          </p>
          <p className="text-[11px] text-slate-500">{mentor?.profile?.department || "Pending mentor assignment"}</p>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Program Timeline</p>
          <p className="text-2xl font-black text-slate-900">{internship ? `Week ${currentWeek} of ${duration}` : "Not Started"}</p>
          <p className="text-[11px] text-blue-600 font-semibold">{progressPercent}% elapsed track</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Tasks Delivered</p>
          <p className="text-2xl font-black text-slate-900">{completedTasks} / {tasks.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold">{taskRate}% completion velocity</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Logged Hours</p>
          <p className="text-2xl font-black text-slate-900">{totalLoggedHours}h</p>
          <p className="text-[11px] text-indigo-600 font-semibold">Development effort</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Reports Submitted</p>
          <p className="text-2xl font-black text-slate-900">{reports.length} / 6</p>
          <p className="text-[11px] text-purple-600 font-semibold">Weekly progress entries</p>
        </div>
      </div>

      {/* Section 1: Assigned Engineering Projects */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-blue-600" />
            <span>Assigned Engineering Projects ({projects.length})</span>
          </h3>
        </div>

        {projects.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">No engineering projects attached to this track yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div key={proj.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900">{proj.title}</h4>
                  <StatusBadge status={proj.status || "not_started"} size="xs" />
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{proj.description}</p>
                {proj.technologies && (
                  <div className="flex flex-wrap gap-1">
                    {proj.technologies.split(",").map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white text-slate-700 font-semibold text-[10px] rounded border border-slate-200">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
                {proj.repo_url && (
                  <a
                    href={proj.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline pt-1"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Task Execution Deliverables */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>Task Deliverables & Progression ({tasks.length})</span>
          </h3>
        </div>

        {tasks.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">No tasks recorded for this intern yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div key={task.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-bold text-slate-800">{task.title}</p>
                  <p className="text-slate-400 text-[11px]">
                    Week {task.week_number} &bull; Priority: {task.priority} &bull; Logged: {task.actual_hours || 0}h
                  </p>
                </div>
                <StatusBadge status={task.status} size="xs" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Weekly Progress Reports & AI Insights */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Weekly Progress Reports & AI Analysis ({reports.length})</span>
          </h3>
        </div>

        {reports.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">No weekly progress reports submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                    Week {report.week_number} Report
                  </span>
                  <span className="text-slate-400 text-[11px]">Submitted</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="font-bold text-slate-700">Tasks Completed:</span>
                    <p className="text-slate-600">{report.tasks_completed_summary || "None reported."}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Learnings & Skills:</span>
                    <p className="text-slate-600">{report.learnings_and_skills || "None reported."}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 4: Final Evaluation Record */}
      {evaluation && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-blue-800/60 pb-3">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Final 6-Week End-of-Internship Evaluation</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
              <span className="text-blue-200 font-semibold">Overall Rating</span>
              <p className="text-2xl font-black text-white mt-1">{evaluation.overall_rating}/10</p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
              <span className="text-blue-200 font-semibold">Technical Rating</span>
              <p className="text-2xl font-black text-white mt-1">{evaluation.technical_skills_rating}/5</p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
              <span className="text-blue-200 font-semibold">Soft Skills Rating</span>
              <p className="text-2xl font-black text-white mt-1">{evaluation.soft_skills_rating}/5</p>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/40 text-xs font-bold text-emerald-300 flex justify-between">
            <span>Hiring Recommendation:</span>
            <span className="uppercase tracking-wider">{evaluation.recommendation}</span>
          </div>

          {evaluation.final_comments && (
            <p className="text-xs text-blue-100 italic leading-relaxed">
              "{evaluation.final_comments}"
            </p>
          )}
        </div>
      )}
    </div>
  );
}
