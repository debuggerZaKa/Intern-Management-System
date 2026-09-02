import React, { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import { aiService } from "../../services/aiService";
import { useAuth } from "../../hooks/useAuth";

export default function AIChatDrawer({ isOpen, onClose, selectedInternId = null }) {
  const { user, isIntern } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: `Hello ${user?.profile?.full_name?.split(" ")[0] || "there"}! I am your NETSOL AI Assistant. How can I assist you with internship analytics, weekly reports, or task progress today?`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestedPrompts = isIntern
    ? [
        "How can I structure my weekly report?",
        "What are best practices for resolving blockers?",
        "Give me tips on demonstrating engineering impact.",
      ]
    : [
        "Which interns have critical blockers?",
        "Summarize recent performance trends.",
        "How should I evaluate weekly engineering goals?",
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await aiService.chat(query, selectedInternId);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: response.response || response.message || "I processed your request.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI Chat error:", err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        isError: true,
        text:
          err.message ||
          "Sorry, I encountered an issue communicating with the AI service. Please verify your connection or try again shortly.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dynamic Keyframes for smooth animations */}
      <style>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0.9;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .ai-drawer-slide {
          animation: slideInFromRight 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .ai-backdrop-fade {
          animation: fadeInBackdrop 0.25s ease-out forwards;
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        className="ai-backdrop-fade absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="ai-drawer-slide w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Clean Header (Original Logo + Text + Polished Cross Button) */}
          <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src="/netsol_icon.png"
                alt="NETSOL"
                className="w-6 h-6 object-contain"
              />
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                NETSOL AI Assistant
              </h2>
            </div>

            {/* Polished Cross Button */}
            <button
              onClick={onClose}
              aria-label="Close AI Assistant"
              className="group flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-all duration-150 border border-transparent hover:border-slate-200"
            >
              <X className="w-4 h-4 transition-transform duration-150 group-hover:scale-110" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 shadow-xs text-[10px] font-black mt-0.5">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20 rounded-tr-none"
                      : msg.isError
                      ? "bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-none"
                      : "bg-[#2C2C2E] text-slate-100 border border-slate-700/50 shadow-sm rounded-tl-none whitespace-pre-wrap"
                  }`}
                >
                  {msg.text}
                  <span
                    className={`block text-[9px] mt-1.5 ${
                      msg.sender === "user" ? "text-blue-100 text-right" : "text-slate-400 text-left"
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5 shadow-xs">
                    {user?.profile?.full_name?.slice(0, 1)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start items-center text-xs text-slate-500">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 shadow-xs text-[10px] font-black">
                  AI
                </div>
                <div className="bg-[#2C2C2E] text-slate-200 border border-slate-700/50 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  <span className="text-[11px]">Analyzing internship records...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-white/90 backdrop-blur-xs flex-shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Quick Questions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  disabled={loading}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/70 transition-all text-left truncate max-w-full font-medium disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2 flex-shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask NETSOL AI about reports, blockers, interns..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-100/80 border border-slate-200 rounded-full focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-full transition-all shadow-sm shadow-blue-500/20 disabled:shadow-none flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
