import React, { useState, useRef, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import AIChatDrawer from "../ai/AIChatDrawer";

export default function AppLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  // Warp-out animation state: when true, robot plays exit before modal opens
  const [botWarping, setBotWarping] = useState(false);

  // Position & Drag State for Floating Robot Chatbot Button
  const [botPos, setBotPos] = useState(() => {
    try {
      const saved = localStorage.getItem("netsol_chatbot_pos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.left === "number" && typeof parsed.top === "number") {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load chatbot position:", e);
    }
    return null; // null defaults to CSS bottom-5 right-5
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
    hasMoved: false,
  });

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();

    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
      hasMoved: false,
    };

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - dragState.current.startX;
      const dy = moveEvent.clientY - dragState.current.startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragState.current.hasMoved = true;
        setIsDragging(true);
      }

      if (dragState.current.hasMoved) {
        const buttonWidth = rect.width || 96;
        const buttonHeight = rect.height || 96;
        const newLeft = Math.max(10, Math.min(window.innerWidth - buttonWidth - 10, dragState.current.initialLeft + dx));
        const newTop = Math.max(10, Math.min(window.innerHeight - buttonHeight - 10, dragState.current.initialTop + dy));
        setBotPos({ left: newLeft, top: newTop });
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      if (dragState.current.hasMoved) {
        setTimeout(() => setIsDragging(false), 50);
        setBotPos((latest) => {
          if (latest) {
            try { localStorage.setItem("netsol_chatbot_pos", JSON.stringify(latest)); } catch {}
          }
          return latest;
        });
      } else {
        setIsDragging(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Touch Drag Handlers
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();

    dragState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
      hasMoved: false,
    };

    const handleTouchMove = (moveEvent) => {
      if (moveEvent.touches.length !== 1) return;
      const t = moveEvent.touches[0];
      const dx = t.clientX - dragState.current.startX;
      const dy = t.clientY - dragState.current.startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragState.current.hasMoved = true;
        setIsDragging(true);
      }

      if (dragState.current.hasMoved) {
        const buttonWidth = rect.width || 96;
        const buttonHeight = rect.height || 96;
        const newLeft = Math.max(10, Math.min(window.innerWidth - buttonWidth - 10, dragState.current.initialLeft + dx));
        const newTop = Math.max(10, Math.min(window.innerHeight - buttonHeight - 10, dragState.current.initialTop + dy));
        setBotPos({ left: newLeft, top: newTop });
      }
    };

    const handleTouchEnd = () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);

      if (dragState.current.hasMoved) {
        setTimeout(() => setIsDragging(false), 50);
        setBotPos((latest) => {
          if (latest) {
            try { localStorage.setItem("netsol_chatbot_pos", JSON.stringify(latest)); } catch {}
          }
          return latest;
        });
      } else {
        setIsDragging(false);
      }
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
  };

  const handleBotClick = (e) => {
    if (dragState.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (aiChatOpen) {
      // Just close — no warp needed
      setAiChatOpen(false);
      return;
    }

    // Trigger warp-out animation, then open modal after animation completes
    setBotWarping(true);
    setTimeout(() => {
      setBotWarping(false);
      setAiChatOpen(true);
    }, 400); // matches warpOut duration
  };

  return (
    <>
      <style>{`
        @keyframes botWarpOut {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          30% {
            opacity: 0.95;
            transform: scale(1.12);
          }
          100% {
            opacity: 0;
            transform: scale(0);
          }
        }
        @keyframes botWarpIn {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          65% {
            opacity: 1;
            transform: scale(1.15);
          }
          85% {
            transform: scale(0.96);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes botIdleFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>

      <div className="min-h-screen bg-[#F4F7FB] flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white relative">
        <div className="flex flex-1 min-h-screen">
          {/* Desktop Collapsible Sidebar */}
          <div
            className={`hidden lg:block flex-shrink-0 h-screen sticky top-0 z-30 border-r border-slate-800/80 bg-[#0B132B] transition-all duration-300 ${
              sidebarCollapsed ? "w-20" : "w-64"
            }`}
          >
            <Sidebar
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Mobile Drawer Sidebar */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0B132B] shadow-2xl z-10 h-full">
                <Sidebar isMobile onCloseMobile={() => setMobileSidebarOpen(false)} />
              </div>
            </div>
          )}

          {/* Main Content Viewport */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            <Navbar onToggleSidebar={handleToggleSidebar} isSidebarCollapsed={sidebarCollapsed} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              <div className="max-w-7xl mx-auto space-y-6">{children}</div>
            </main>
          </div>
        </div>

        {/* Global AI Chat Tablet Modal */}
        <AIChatDrawer isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />

        {/* Floating Draggable Robot AI Assistant Button (Permanently High Resolution & Foreground z-index) */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleBotClick}
          title={aiChatOpen ? "Click to close NETSOL AI" : "Press & hold to drag • Click to open NETSOL AI"}
          aria-label="NETSOL AI Assistant"
          className={`fixed bottom-5 right-5 w-20 h-20 sm:w-24 sm:h-24 group flex items-center justify-center select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            zIndex: 100,
            ...(botPos ? { position: "fixed", left: `${botPos.left}px`, top: `${botPos.top}px`, right: "auto", bottom: "auto" } : {}),
            animation: "botIdleFloat 3s ease-in-out infinite",
            filter: isDragging ? "drop-shadow(0 0 14px rgba(99,102,241,0.42))" : "drop-shadow(0 6px 14px rgba(0,0,0,0.15))",
            WebkitTransform: "translateZ(0)",
            transform: "translateZ(0)",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        >
          <DotLottieReact
            src="/assets/animations/robot.lottie"
            loop
            autoplay
            className="w-full h-full pointer-events-none"
          />
          {/* Tooltip */}
          {!aiChatOpen && !isDragging && (
            <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-extrabold px-3 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none border border-slate-700/60">
              Click to chat with AI
            </span>
          )}
        </div>
      </div>
    </>
  );
}
