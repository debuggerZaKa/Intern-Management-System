import React, { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Wifi, Sparkles } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { aiService } from "../../services/aiService";
import { useAuth } from "../../hooks/useAuth";

/* ─── Reusable Status Bar Components ────────────────────────────── */

function CellularBars() {
  const heights = [3.5, 5.5, 7.5, 10];
  return (
    <div style={{ display: "inline-flex", alignItems: "flex-end", gap: "1.5px", height: "10px", paddingBottom: "0.5px" }}>
      {heights.map((h, i) => (
        <span key={i} style={{ width: "2.5px", height: `${h}px`, background: "#0F172A", borderRadius: "0.5px", display: "block" }} />
      ))}
    </div>
  );
}

function BatteryIcon() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#0F172A" }}>100%</span>
      <div style={{ position: "relative", width: "20px", height: "10.5px", border: "1.5px solid #0F172A", borderRadius: "3px", padding: "1px", display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", height: "100%", background: "#10B981", borderRadius: "1px" }} />
        <div style={{ position: "absolute", right: "-3px", top: "2px", width: "2px", height: "4px", background: "#0F172A", borderRadius: "0 1px 1px 0" }} />
      </div>
    </div>
  );
}

function DeviceStatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <div style={{
      height: "32px", background: "#FFFFFF", borderBottom: "1px solid #E2E8F0",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", position: "relative", zIndex: 30, userSelect: "none", flexShrink: 0,
    }}>
      {/* Left: Time & Date */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#0F172A" }}>{time}</span>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748B" }}>{date}</span>
      </div>

      {/* Center: Dynamic Island / Camera Notch */}
      <div style={{ position: "absolute", top: "4px", left: "50%", transform: "translateX(-50%)", zIndex: 35 }}>
        <div style={{
          height: "22px", background: "#000000", borderRadius: "100px",
          padding: "0 12px", display: "inline-flex", alignItems: "center", gap: "10px",
        }}>
          {/* Camera lens module */}
          <div style={{
            position: "relative", width: "12px", height: "12px", borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #243047 0%, #131b2e 50%, #060a14 100%)",
            border: "1px solid rgba(255,255,255,0.32)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", width: "6px", height: "6px", borderRadius: "50%", background: "radial-gradient(circle, #020617 50%, #1e3a8a 100%)", border: "0.75px solid rgba(56,189,248,0.6)" }} />
            <div style={{ position: "absolute", top: "2px", left: "2.5px", width: "2.5px", height: "2.5px", borderRadius: "50%", background: "#38BDF8", boxShadow: "0 0 3px #38BDF8" }} />
          </div>
          {/* Sensor dot */}
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#090d18", border: "0.75px solid #283347" }} />
        </div>
      </div>

      {/* Right: Icons */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Wifi size={13} strokeWidth={2.4} style={{ color: "#0F172A" }} />
        <div style={{ display: "inline-flex", alignItems: "flex-end", gap: "3.5px" }}>
          <CellularBars />
          <CellularBars />
        </div>
        <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#0F172A", letterSpacing: "0.04em" }}>5G</span>
        <BatteryIcon />
      </div>
    </div>
  );
}

/* ─── Main AI Assistant Tablet Showcase ─────────────────────────── */

export default function AIChatDrawer({ isOpen, onClose, selectedInternId = null }) {
  const { user, isIntern } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: `Hey ${user?.profile?.full_name?.split(" ")[0] || "there"} 👋\nI'm your NETSOL AI Assistant powered by Llama 3.3.\n\nAsk me anything about reports, interns, blockers, or performance trends.`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestedPrompts = isIntern
    ? ["Structure my weekly report?", "Tips to resolve blockers?", "Demonstrate engineering impact?"]
    : ["Which interns have blockers?", "Summarize performance trends.", "Evaluate weekly goals?"];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setMessages((prev) => [...prev, {
      id: Date.now().toString(), sender: "user", text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
    setInput("");
    setLoading(true);

    try {
      const response = await aiService.chat(query, selectedInternId);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), sender: "ai",
        text: response.response || response.message || "I processed your request.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), sender: "ai", isError: true,
        text: err.message || "Connection issue. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tabletSlideUp {
          0%   { opacity: 0; transform: translateY(60px) scale(0.96); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes botWarpIn {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          65% {
            opacity: 1;
            transform: scale(1.18);
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
          50%       { transform: translateY(-4px); }
        }
        .ai-chat-scrollbar::-webkit-scrollbar { width: 5px; }
        .ai-chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .ai-chat-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        .ai-prompt-btn:hover { background: #EEF2FF !important; color: #4F46E5 !important; border-color: #C7D2FE !important; }
      `}</style>

      {/* ── Blurred Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(15,23,42,0.55)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          animation: "fadeInBg 0.25s ease forwards",
        }}
      />

      {/* ── Showcase Stage Container (Perfectly Centered) ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 51,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        pointerEvents: "none",
      }}>

        {/* ── Hardware Tablet Chassis ── */}
        <div style={{
          position: "relative",
          width: "100%",
          maxWidth: "1140px",
          height: "min(720px, 88vh)",
          background: "linear-gradient(145deg, #2a2a2e 0%, #1c1c1f 50%, #26262a 100%)",
          borderRadius: "28px",
          padding: "8px",
          boxShadow: [
            "0 0 0 1.5px rgba(255,255,255,0.22)",
            "0 0 0 5px #181E2E",
            "0 0 0 6.5px rgba(255,255,255,0.08)",
            "0 -14px 40px rgba(37,99,235,0.45)",
            "-18px 0 45px rgba(30,64,175,0.42)",
            "18px 0 45px rgba(30,64,175,0.42)",
            "0 0 70px rgba(56,114,245,0.35)",
            "0 30px 80px rgba(0,0,0,0.7)",
          ].join(", "),
          display: "flex", flexDirection: "column",
          animation: "tabletSlideUp 0.45s cubic-bezier(0.16,1,0.3,1) forwards",
          pointerEvents: "all",
          userSelect: "none",
        }}>

          {/* Ambient backlight glow */}
          <div style={{
            position: "absolute",
            inset: "-20px",
            background: "radial-gradient(ellipse at 50% 20%, rgba(37,99,235,0.55) 0%, rgba(30,58,138,0.3) 45%, transparent 75%)",
            filter: "blur(50px)",
            pointerEvents: "none",
            zIndex: -1,
          }} />

          {/* Physical Buttons on Frame */}
          <div style={{ position: "absolute", top: "-5px", right: "120px", width: "64px", height: "5px", background: "#060910", border: "1px solid #1E293B", borderRadius: "3px 3px 0 0", boxShadow: "0 0 0 1px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.3)" }} />
          <div style={{ position: "absolute", left: "-5px", top: "90px", width: "5px", height: "48px", background: "#060910", border: "1px solid #1E293B", borderRadius: "3px 0 0 3px", boxShadow: "0 0 0 1px rgba(0,0,0,0.85), inset 1px 0 0 rgba(255,255,255,0.3)" }} />
          <div style={{ position: "absolute", left: "-5px", top: "148px", width: "5px", height: "48px", background: "#060910", border: "1px solid #1E293B", borderRadius: "3px 0 0 3px", boxShadow: "0 0 0 1px rgba(0,0,0,0.85), inset 1px 0 0 rgba(255,255,255,0.3)" }} />
          <div style={{ position: "absolute", top: "-4px", left: "60px", width: "5px", height: "3px", background: "#111726" }} />
          <div style={{ position: "absolute", top: "-4px", right: "60px", width: "5px", height: "3px", background: "#111726" }} />

          {/* ── Tablet Display Screen ── */}
          <div style={{
            flex: 1, borderRadius: "22px", overflow: "hidden",
            background: "#F2F3F7", position: "relative",
            boxShadow: "inset 0 0 0 1.5px rgba(0,0,0,0.2), inset 0 0 0 3px rgba(255,255,255,0.05)",
            display: "flex", flexDirection: "column",
          }}>

            {/* Glass specular sheen */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 25, borderRadius: "22px",
              background: "linear-gradient(118deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 24%, transparent 45%)",
            }} />

            {/* iOS Status Bar */}
            <DeviceStatusBar />

            {/* ── App Header (Centered Clean Title with NETSOL Logo) ── */}
            <div style={{
              position: "relative", background: "#FFFFFF",
              borderBottom: "1px solid rgba(226,232,240,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "12px 24px", minHeight: "54px", flexShrink: 0,
              zIndex: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img
                  src="/netsol_icon.png"
                  alt="NETSOL"
                  style={{ width: "24px", height: "24px", objectFit: "contain" }}
                />
                <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em" }}>
                  NETSOL AI Assistant
                </h2>
              </div>
            </div>

            {/* ── Messages Scroll Area ── */}
            <div
              className="ai-chat-scrollbar"
              style={{ flex: 1, overflowY: "auto", padding: "20px 28px", display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: "flex", alignItems: "flex-end", gap: "12px", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>

                  {/* AI avatar */}
                  {msg.sender === "ai" && (
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #334155, #0F172A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "10px", fontWeight: 900, color: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", marginBottom: "2px" }}>AI</div>
                  )}

                  <div style={{ maxWidth: "80%", display: "flex", flexDirection: "column", gap: "3px" }}>
                    <div style={{
                      borderRadius: msg.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      padding: "12px 18px", fontSize: "12.5px", lineHeight: "1.6", fontWeight: 500,
                      whiteSpace: "pre-wrap",
                      ...(msg.sender === "user"
                        ? { background: "#2563EB", color: "#fff", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }
                        : msg.isError
                        ? { background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }
                        : { background: "#2C2C2E", color: "#F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }
                      ),
                    }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: "9.5px", color: "#94A3B8", fontWeight: 400, paddingLeft: "4px", paddingRight: "4px", textAlign: msg.sender === "user" ? "right" : "left" }}>
                      {msg.time}
                    </span>
                  </div>

                  {/* User avatar */}
                  {msg.sender === "user" && (
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "10px", fontWeight: 900, color: "#fff", boxShadow: "0 2px 8px rgba(37,99,235,0.35)", marginBottom: "2px" }}>
                      {user?.profile?.full_name?.slice(0, 1)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing animation */}
              {loading && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "linear-gradient(135deg, #334155, #0F172A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "9px", fontWeight: 900, color: "#fff" }}>AI</div>
                  <div style={{ background: "#2C2C2E", borderRadius: "18px 18px 18px 4px", padding: "12px 18px", display: "flex", alignItems: "center", gap: "6px" }}>
                    {[0, 120, 240].map((delay, i) => (
                      <span key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#64748B", display: "inline-block", animation: `bounce 1s ${delay}ms infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Prompts ── */}
            <div style={{ padding: "8px 20px", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)", borderTop: "1px solid rgba(226,232,240,0.6)", flexShrink: 0 }}>
              <p style={{ margin: "0 0 6px", fontSize: "8.5px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Quick Questions</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {suggestedPrompts.map((p, i) => (
                  <button
                    key={i}
                    className="ai-prompt-btn"
                    onClick={() => handleSend(p)}
                    disabled={loading}
                    style={{ fontSize: "11px", padding: "6px 14px", borderRadius: "20px", background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0", cursor: "pointer", fontWeight: 600, transition: "all 0.15s", opacity: loading ? 0.4 : 1 }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Input Bar ── */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              style={{
                padding: "12px 20px 14px",
                background: "#FFFFFF",
                borderTop: "1px solid rgba(226,232,240,0.7)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexShrink: 0,
              }}
            >
              {/* Message Input Field */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask NETSOL AI about reports, blockers, interns..."
                disabled={loading}
                style={{
                  flex: 1,
                  height: "44px",
                  padding: "0 20px",
                  fontSize: "12px",
                  background: "#F2F3F7",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: "22px",
                  outline: "none",
                  fontWeight: 500,
                  color: "#1E293B",
                  fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => e.target.style.borderColor = "#6366F1"}
                onBlur={e => e.target.style.borderColor = "#E2E8F0"}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || loading}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: input.trim() ? "#2563EB" : "#E2E8F0",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim() ? "pointer" : "default",
                  flexShrink: 0,
                  transition: "all 0.2s",
                  boxShadow: input.trim() ? "0 4px 14px rgba(37,99,235,0.35)" : "none",
                }}
              >
                {loading ? <Loader2 size={16} color="#fff" style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} color={input.trim() ? "#fff" : "#94A3B8"} />}
              </button>
            </form>

            {/* Home indicator bar */}
            <div style={{ background: "#FFFFFF", display: "flex", justifyContent: "center", padding: "4px 0 8px", flexShrink: 0 }}>
              <div style={{ width: "90px", height: "4px", borderRadius: "100px", background: "#CBD5E1" }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
