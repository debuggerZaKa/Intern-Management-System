import React, { useState } from "react";
import {
  Search,
  Bell,
  LayoutGrid,
  BookOpen,
  FlaskConical,
  Rocket,
  Briefcase,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ExternalLink,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Sparkles,
  Calendar as CalendarIcon,
  FileText,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function DashboardPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedDate, setSelectedDate] = useState(8);
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <div className="min-h-screen bg-[#F0F3F8] p-3 sm:p-5 font-sans text-slate-800 flex flex-col items-center justify-center selection:bg-blue-500 selection:text-white">
      
      {/* Outer App Frame Container */}
      <div className="w-full max-w-[1520px] bg-[#F5F7FB] rounded-[32px] border border-slate-200/80 shadow-[0_20px_50px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col">
        
        {/* Top Header Bar */}
        <header className="px-6 py-4 flex items-center justify-between gap-4 border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-6 flex-1">
            {/* Logo Badge */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 font-black text-xl">
                N
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">NETSOL</span>
                <span className="text-[10px] block font-bold text-blue-600 uppercase tracking-widest -mt-1">Intern Portal</span>
              </div>
            </div>

            {/* Search Pill Input */}
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search modules, tasks, weekly reports, blockers..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm placeholder:text-slate-400 text-slate-700 transition-all"
              />
            </div>
          </div>

          {/* User Profile & Notifications */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center relative shadow-sm hover:bg-slate-50 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2 right-2 ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-800 p-0.5 shadow-sm flex-shrink-0 overflow-hidden ring-2 ring-blue-500/20">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                  alt="Intern Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="hidden md:block text-left text-xs leading-tight">
                <p className="font-bold text-slate-900">Ahmed Khan</p>
                <p className="text-[11px] text-slate-400">Intern &bull; FAST NUCES</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Layout with Slim Left Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Slim Left Icon Sidebar */}
          <aside className="w-16 bg-white/60 border-r border-slate-200/60 py-6 flex flex-col items-center justify-between flex-shrink-0">
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setActiveNav("dashboard")}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  activeNav === "dashboard"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }`}
                title="Dashboard"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setActiveNav("courses")}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  activeNav === "courses"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }`}
                title="Modules & Projects"
              >
                <BookOpen className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveNav("labs")}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  activeNav === "labs"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }`}
                title="Tasks & Kanban"
              >
                <FlaskConical className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveNav("milestones")}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  activeNav === "milestones"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }`}
                title="Milestones"
              >
                <Rocket className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveNav("briefcase")}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  activeNav === "briefcase"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }`}
                title="Reports"
              >
                <Briefcase className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveNav("mentors")}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  activeNav === "mentors"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }`}
                title="Mentor Reviews"
              >
                <Users className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button className="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </aside>

          {/* Main Dashboard Workspace */}
          <div className="flex-1 p-5 md:p-6 overflow-y-auto space-y-6">
            
            {/* TOP ROW: Live Mentor Session Preview (Left 8 cols) + Circular Completion Arc (Right 4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Wide Deep Navy Hero Card: Live Mentor Review Session */}
              <div className="lg:col-span-8 bg-gradient-to-r from-[#0C234E] via-[#0E2C60] to-[#12397B] rounded-3xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  {/* Left: Video / Mentor Thumbnail preview */}
                  <div className="flex items-center gap-4">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-xl ring-2 ring-white/10 flex-shrink-0 bg-slate-800 relative group">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=320&auto=format&fit=crop&q=80"
                        alt="Mentor Live"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="px-2 py-0.5 bg-rose-600/90 text-white font-bold text-[9px] rounded-full uppercase tracking-wider animate-pulse">
                          Live Review
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold tracking-tight text-white">Backend RBAC & Architecture Review</h2>
                        <ExternalLink className="w-3.5 h-3.5 text-blue-300 hover:text-white cursor-pointer" />
                      </div>
                      <p className="text-xs text-blue-200 mt-0.5">Mentor: <span className="font-semibold text-white">Dr. Sarah Tariq</span> &bull; Lead Systems Architect</p>
                      <p className="text-[11px] text-blue-300/80 mt-2 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Today &bull; 02:00 PM - 03:00 PM (Week 3 Milestone)
                      </p>
                    </div>
                  </div>

                  {/* Header Timestamp Pill */}
                  <span className="text-[11px] font-medium bg-white/10 text-blue-100 border border-white/10 px-3 py-1 rounded-full flex-shrink-0">
                    Aug 28, 2026 &bull; 02:05 PM
                  </span>
                </div>

                {/* Scrubber Waveform / Timeline Audio Controls */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  {/* Segmented Timeline Waveform Blocks */}
                  <div className="flex items-center gap-1.5 h-6 mb-2">
                    {[35, 45, 60, 80, 100, 90, 70, 50, 65, 85, 40, 30].map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          i === 5 ? "bg-blue-400 ring-2 ring-white h-7" : i < 5 ? "bg-blue-400/80" : "bg-white/20"
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>

                  {/* Time Markers */}
                  <div className="flex justify-between text-[10px] text-blue-300/80 font-mono">
                    <span>00:00</span>
                    <span>02:00</span>
                    <span>04:00</span>
                    <span className="text-white font-bold">06:00 (Current)</span>
                    <span>08:00</span>
                    <span>10:00</span>
                  </div>

                  {/* Media playback controls */}
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <button className="text-blue-200 hover:text-white transition-colors">
                      <Repeat className="w-3.5 h-3.5" />
                    </button>
                    <button className="text-blue-200 hover:text-white transition-colors">
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-8 h-8 rounded-full bg-white text-blue-950 flex items-center justify-center shadow-lg hover:scale-105 transition-transform font-bold"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                    <button className="text-blue-200 hover:text-white transition-colors">
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Top Right Card: Multi-Ring Radial Completion Gauge */}
              <div className="lg:col-span-4 bg-gradient-to-b from-[#0B1E3F] to-[#0A1730] rounded-3xl p-5 text-white shadow-md flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Internship Completion</h3>
                  <p className="text-[11px] text-blue-200/70 mt-0.5">Overall 6-week deliverables</p>

                  <div className="flex items-center gap-3 mt-3 text-[11px]">
                    <span className="flex items-center gap-1.5 text-blue-300">
                      <span className="w-2 h-2 rounded-full bg-[#1E6BFF]" /> Completed
                    </span>
                    <span className="flex items-center gap-1.5 text-sky-300">
                      <span className="w-2 h-2 rounded-full bg-[#00D2FF]" /> In Progress
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-slate-500" /> Pending
                    </span>
                  </div>
                </div>

                {/* Multi-ring Concentric Semicircles SVG */}
                <div className="relative flex items-center justify-center my-2">
                  <svg className="w-48 h-28" viewBox="0 0 200 110">
                    {/* Outer Ring */}
                    <path
                      d="M 15 105 A 85 85 0 0 1 185 105"
                      fill="none"
                      stroke="#142B58"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 15 105 A 85 85 0 0 1 145 35"
                      fill="none"
                      stroke="#1E6BFF"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />

                    {/* Middle Ring */}
                    <path
                      d="M 35 105 A 65 65 0 0 1 165 105"
                      fill="none"
                      stroke="#142B58"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 35 105 A 65 65 0 0 1 125 50"
                      fill="none"
                      stroke="#00D2FF"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />

                    {/* Inner Ring */}
                    <path
                      d="M 55 105 A 45 45 0 0 1 145 105"
                      fill="none"
                      stroke="#142B58"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 55 105 A 45 45 0 0 1 100 62"
                      fill="none"
                      stroke="#0099FF"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />

                    {/* Labels */}
                    <text x="50" y="85" fill="#FFFFFF" fontSize="10" fontWeight="bold">48%</text>
                    <text x="130" y="80" fill="#00D2FF" fontSize="10" fontWeight="bold">30%</text>
                    <text x="160" y="65" fill="#93C5FD" fontSize="9" fontWeight="bold">22%</text>
                  </svg>
                </div>

                <div className="text-center pt-1 border-t border-white/10 flex justify-between text-xs text-blue-200">
                  <span>Cycle: <strong className="text-white">Week 3 of 6</strong></span>
                  <span className="text-emerald-400 font-semibold">On Track</span>
                </div>
              </div>

            </div>

            {/* MIDDLE ROW: 2x2 Mini Metrics (4 cols) + Course/Projects Carousel (4 cols) + Schedule & Calendar (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left 4 cols: 2x2 Mini Stat Sparkline Cards */}
              <div className="lg:col-span-4 grid grid-cols-2 gap-3.5">
                
                {/* Card 1: Tasks Done */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[120px]">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tasks Delivered</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">12</p>
                  </div>
                  {/* Vertical mini-bar chart */}
                  <div className="flex items-end gap-1 h-8 pt-1">
                    {[40, 60, 30, 80, 100, 70, 90, 50, 85, 95].map((val, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-blue-500/80 rounded-t-sm"
                        style={{ height: `${val}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Card 2: Certifications / Skills */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[120px]">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Skills Certified</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">8</p>
                  </div>
                  {/* Smooth wavy line */}
                  <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 30">
                    <path
                      d="M 0 20 Q 25 5, 50 18 T 100 10"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Card 3: Blockers Resolved */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[120px]">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Blockers Solved</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">12</p>
                  </div>
                  {/* Step chart */}
                  <div className="flex items-end justify-between border-b border-slate-200 pb-1 text-[9px] text-slate-400">
                    <span className="border-l-2 border-blue-500 pl-1">26 Aug</span>
                    <span className="text-emerald-600 font-bold">100%</span>
                  </div>
                </div>

                {/* Card 4: Reports Submitted */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[120px]">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Weekly Reports</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">3 <span className="text-xs font-normal text-slate-400">/ 6</span></p>
                  </div>
                  {/* Blue curved arc meter */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Reviewed</span>
                    <span className="font-bold text-blue-600">3/6</span>
                  </div>
                </div>

              </div>

              {/* Middle 4 cols: Assigned Projects / Courses Horizontal Cards */}
              <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Assigned Projects</h3>
                    <p className="text-[11px] text-slate-400">2 Active Repositories</p>
                  </div>
                  <button className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
                    View All
                  </button>
                </div>

                {/* Project cards carousel simulation */}
                <div className="grid grid-cols-2 gap-3 relative">
                  
                  {/* Card 1: FastApi RBAC */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 hover:shadow-md transition-shadow relative group">
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold text-xs">
                        Py
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 mt-2">FastAPI RBAC Core</h4>
                    <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Advanced Module</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                      <div className="bg-blue-600 h-1.5 rounded-full w-[65%]" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mt-1 block">65% Done</span>

                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200/60">
                      <div className="w-4 h-4 rounded-full bg-blue-500 text-[8px] text-white flex items-center justify-center font-bold">ST</div>
                      <span className="text-[10px] text-slate-500">Dr. Sarah Tariq</span>
                    </div>
                  </div>

                  {/* Card 2: PostgreSQL Schema */}
                  <div className="bg-white border-2 border-blue-500 rounded-2xl p-3.5 shadow-lg relative -rotate-1 hover:rotate-0 transition-transform">
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        Pg
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 mt-2">Postgres Migrations</h4>
                    <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Database 18</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                      <div className="bg-blue-600 h-1.5 rounded-full w-[85%]" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 mt-1 block">85% Complete</span>

                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200/60">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-[8px] text-white flex items-center justify-center font-bold">AK</div>
                      <span className="text-[10px] text-slate-700 font-semibold">Ahmed Khan</span>
                    </div>
                  </div>

                </div>

                <p className="text-[11px] text-slate-400 text-center mt-3">Next review scheduled for tomorrow at 10:00 AM</p>
              </div>

              {/* Right 4 cols: My Schedule & Calendar */}
              <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">My Schedule</h3>
                      <p className="text-[11px] text-slate-400">Track milestones & reviews</p>
                    </div>
                    <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
                  </div>

                  {/* Calendar Widget */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2 px-1">
                      <ChevronLeft className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                      <span>August 2026</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1">
                      <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-700">
                      <span className="text-slate-300 p-1">27</span>
                      <span className="text-slate-300 p-1">28</span>
                      <span className="text-slate-300 p-1">29</span>
                      <span className="text-slate-300 p-1">30</span>
                      <span className="p-1">1</span>
                      <span className="p-1">2</span>
                      <span className="p-1">3</span>
                      <span className="p-1">4</span>
                      <span className="p-1">5</span>
                      <span className="p-1">6</span>
                      <span className="p-1">7</span>
                      <span className="p-1 rounded-full bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30">8</span>
                      <span className="p-1">9</span>
                      <span className="p-1">10</span>
                      <span className="p-1">11</span>
                      <span className="p-1">12</span>
                      <span className="p-1">13</span>
                      <span className="p-1">14</span>
                      <span className="p-1">15</span>
                      <span className="p-1">16</span>
                      <span className="p-1">17</span>
                    </div>
                  </div>
                </div>

                {/* Upcoming Events Pills */}
                <div className="space-y-2 mt-4">
                  <div className="p-2.5 rounded-2xl bg-blue-600 text-white flex items-center gap-3 shadow-md shadow-blue-500/20">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left text-xs leading-tight">
                      <p className="font-bold">Weekly Mentor Review</p>
                      <p className="text-[10px] text-blue-100">10:00 AM &bull; Dr. Sarah Tariq</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-[#D8F231] text-slate-900 flex items-center gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-slate-900" />
                    </div>
                    <div className="text-left text-xs leading-tight">
                      <p className="font-bold">Week 3 Report Deadline</p>
                      <p className="text-[10px] text-slate-700">11:00 AM &bull; Sprint Check-in</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* BOTTOM ROW: Skill Progress (4 cols) + AI Insights Meter (4 cols) + Activity Analytics (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Card 1: Skill Progress Graph in Deep Navy */}
              <div className="lg:col-span-4 bg-gradient-to-br from-[#0B1E3F] to-[#0E2C60] rounded-3xl p-5 text-white shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Skill Progress</span>
                  </div>
                  <p className="text-3xl font-black mt-2">% 74</p>
                  <p className="text-[11px] text-blue-200/70 mt-0.5">Growth vs. last week</p>
                </div>

                {/* Visual Branch Nodes */}
                <div className="my-4 relative flex items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#D8F231] text-slate-950 font-black text-xs shadow-md">
                    FastAPI
                  </span>
                  <div className="w-6 h-0.5 bg-blue-400/40" />
                  <span className="px-2.5 py-1 rounded-full bg-blue-500 text-white font-bold text-xs">
                    Postgres
                  </span>
                  <div className="w-6 h-0.5 bg-blue-400/40" />
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500 text-white font-bold text-xs">
                    RBAC
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs text-blue-200">
                  <span>Cycle: 26 Aug - 26 Sep</span>
                  <span className="font-semibold text-white">962 mins active</span>
                </div>
              </div>

              {/* Card 2: AI Tips & Report Quality Speedometer */}
              <div className="lg:col-span-4 bg-gradient-to-br from-[#0B1E3F] to-[#0E2C60] rounded-3xl p-5 text-white shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Insights Engine</span>
                  </div>
                  <p className="text-xs text-blue-200/90 mt-1">Automatic report synthesis & blocker detection</p>
                </div>

                {/* Speedometer Gauge Arc */}
                <div className="relative flex flex-col items-center justify-center my-1">
                  <svg className="w-44 h-24" viewBox="0 0 200 110">
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#142B58"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 20 100 A 80 80 0 0 1 155 45"
                      fill="none"
                      stroke="url(#aiGradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00E5FF" />
                        <stop offset="100%" stopColor="#D8F231" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <p className="text-lg font-black text-white -mt-10">82% Quality</p>
                  <p className="text-[10px] text-blue-200">Exceeding sprint benchmark</p>
                </div>

                <button className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate AI Summary Report
                </button>
              </div>

              {/* Card 3: Weekly Output & Activity Bar Chart */}
              <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Analytics Statistic</h3>
                    <p className="text-[11px] text-slate-400">Daily learning & code output</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                    Last Week
                  </span>
                </div>

                {/* Colored Pill Bar Chart */}
                <div className="flex items-end justify-between gap-2 h-28 my-2 px-2">
                  {[
                    { day: "Sun", h: 30, color: "bg-slate-200" },
                    { day: "Mon", h: 50, color: "bg-blue-400" },
                    { day: "Tue", h: 95, color: "bg-[#D8F231]" },
                    { day: "Wed", h: 65, color: "bg-blue-400" },
                    { day: "Thu", h: 85, color: "bg-[#D8F231]" },
                    { day: "Fri", h: 70, color: "bg-blue-600" },
                    { day: "Sat", h: 25, color: "bg-slate-200" },
                  ].map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className={`w-full rounded-full transition-all duration-500 shadow-sm ${item.color}`}
                        style={{ height: `${item.h}%` }}
                      />
                      <span className="text-[10px] font-semibold text-slate-400">{item.day}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4 text-[10px] font-semibold text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#D8F231]" /> Output Peak
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600" /> Active Dev
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
