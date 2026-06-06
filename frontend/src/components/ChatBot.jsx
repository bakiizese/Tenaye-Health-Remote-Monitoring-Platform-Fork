import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I'm your health assistant. I have access to your lab results and vitals. How can I help you today?",
};

export default function ChatBot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [premium, setPremium] = useState(null); // null = unchecked
  const [statusLoading, setStatusLoading] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Check premium status when the panel is first opened
  useEffect(() => {
    if (open && premium === null) {
      setStatusLoading(true);
      fetch(`${API_BASE_URL}/api/chat/status`, { headers: getAuthHeaders() })
        .then((r) => r.json())
        .then((d) => setPremium(d.premium === true))
        .catch(() => setPremium(false))
        .finally(() => setStatusLoading(false));
    }
  }, [open, premium]);

  // Scroll to latest message
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleToggle = () => setOpen((p) => !p);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: data.reply || "Sorry, I couldn't respond. Please try again.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: "Network error. Please check your connection and try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-[200] w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-rose-100 flex flex-col overflow-hidden"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 text-white shrink-0"
            style={{
              background: "linear-gradient(135deg,#E05C8A,#F4845F)",
            }}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-white text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-none">Health Assistant</p>
              <p className="text-white/70 text-[10px] mt-0.5">
                Powered by AI · Based on your health data
              </p>
            </div>
            <button
              onClick={handleToggle}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-white text-lg">
                close
              </span>
            </button>
          </div>

          {/* Body */}
          {statusLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#E05C8A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : premium === false ? (
            /* Locked / non-premium state */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: "linear-gradient(135deg,#E05C8A22,#F4845F22)",
                }}
              >
                <span
                  className="material-symbols-outlined text-3xl"
                  style={{ color: "#E05C8A" }}
                >
                  lock
                </span>
              </div>
              <h3 className="font-black text-gray-800 mb-2">Premium Only</h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                The AI Health Assistant is available to premium users only.
                Complete a consultation payment to unlock it.
              </p>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/patient/billing");
                }}
                className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl hover:scale-105 transition-all shadow-md"
                style={{
                  background: "linear-gradient(135deg,#E05C8A,#F4845F)",
                }}
              >
                <span className="material-symbols-outlined text-sm">
                  workspace_premium
                </span>
                Upgrade Plan
              </button>
            </div>
          ) : (
            /* Chat interface */
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5"
                        style={{
                          background: "linear-gradient(135deg,#E05C8A,#F4845F)",
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-white text-xs"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          smart_toy
                        </span>
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "text-white rounded-tr-sm"
                          : "bg-gray-100 text-gray-800 rounded-tl-sm"
                      }`}
                      style={
                        msg.role === "user"
                          ? {
                              background:
                                "linear-gradient(135deg,#E05C8A,#F4845F)",
                            }
                          : {}
                      }
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5"
                      style={{
                        background: "linear-gradient(135deg,#E05C8A,#F4845F)",
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-white text-xs"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        smart_toy
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 p-3 shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your health or nutrition…"
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E05C8A] transition-colors"
                    style={{ maxHeight: "96px" }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                    style={{
                      background: "linear-gradient(135deg,#E05C8A,#F4845F)",
                    }}
                  >
                    <span className="material-symbols-outlined text-lg">
                      send
                    </span>
                  </button>
                </div>
                <p className="text-[9px] text-gray-400 mt-1.5 text-center">
                  For informational purposes only · Not medical advice
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-[200] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all"
        style={{ background: "linear-gradient(135deg,#E05C8A,#F4845F)" }}
        title="Health Assistant"
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ fontVariationSettings: open ? "'FILL' 0" : "'FILL' 1" }}
        >
          {open ? "close" : "chat_bubble"}
        </span>
      </button>
    </>
  );
}
