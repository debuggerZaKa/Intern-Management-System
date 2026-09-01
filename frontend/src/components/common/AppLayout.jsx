import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import AIChatDrawer from "../ai/AIChatDrawer";

export default function AppLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Fixed Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0 border-r border-slate-200/80 bg-white z-30">
          <Sidebar onOpenAIChat={() => setAiChatOpen(true)} />
        </div>

        {/* Mobile Drawer Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 h-full">
              <Sidebar
                isMobile
                onCloseMobile={() => setMobileSidebarOpen(false)}
                onOpenAIChat={() => {
                  setMobileSidebarOpen(false);
                  setAiChatOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <Navbar
            onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            onOpenAIChat={() => setAiChatOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">{children}</div>
          </main>
        </div>
      </div>

      {/* Global AI Chat Drawer */}
      <AIChatDrawer isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </div>
  );
}
