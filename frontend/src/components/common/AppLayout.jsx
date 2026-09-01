import React, { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import AIChatDrawer from "../ai/AIChatDrawer";

export default function AppLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white relative">
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Fixed Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0 border-r border-slate-800/80 bg-[#0B132B] z-30">
          <Sidebar />
        </div>

        {/* Mobile Drawer Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0B132B] shadow-2xl z-10 h-full">
              <Sidebar
                isMobile
                onCloseMobile={() => setMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <Navbar
            onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">{children}</div>
          </main>
        </div>
      </div>

      {/* Floating Robot AI Assistant Button on bottom right */}
      {!aiChatOpen && (
        <button
          onClick={() => setAiChatOpen(true)}
          title="Open AI Assistant"
          aria-label="Open AI Assistant"
          className="fixed bottom-5 right-5 z-40 w-20 h-20 sm:w-24 sm:h-24 hover:scale-110 active:scale-95 transition-all duration-300 drop-shadow-2xl cursor-pointer group flex items-center justify-center focus:outline-none"
        >
          <DotLottieReact
            src="/assets/animations/robot.lottie"
            loop
            autoplay
            className="w-full h-full pointer-events-none"
          />
          {/* Tooltip on hover */}
          <span className="absolute -top-8 right-2 bg-slate-900/90 text-white text-[11px] font-extrabold px-3 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none backdrop-blur-xs border border-slate-700/60">
            NETSOL AI Assistant
          </span>
        </button>
      )}

      {/* Global AI Chat Drawer */}
      <AIChatDrawer isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </div>
  );
}
