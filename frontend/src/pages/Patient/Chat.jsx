import { useState, useEffect, useRef } from "react";
import PatientLayout from "./components/PatientLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const myUserId = () => localStorage.getItem("userId");
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

function Avatar({ name, avatar, size = "md" }) {
  const sz = size === "lg" ? "w-12 h-12 text-lg" : "w-10 h-10 text-sm";
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sz} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white`}
      style={{ background: "linear-gradient(135deg,#E05C8A,#F4845F)" }}
    >
      {initials}
    </div>
  );
}

export default function PatientChat() {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [showList, setShowList] = useState(true); // mobile: toggle between list & thread
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetch(`${API}/api/messages/conversations`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        setConversations(Array.isArray(data) ? data : []);
        setLoadingConvos(false);
      })
      .catch(() => setLoadingConvos(false));

    // Connect socket for real-time DMs
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
    socketRef.current = window.io(socketUrl);
    const uid = myUserId();

    socketRef.current.on(`dm:${uid}`, (msg) => {
      // Update message thread if the sender is the active conversation
      setActiveConvo((current) => {
        if (current && msg.sender === current.partnerId) {
          setMessages((prev) => [...prev, msg]);
        } else {
          // Increment unread count in conversation list
          setConversations((prev) =>
            prev.map((c) =>
              c.partnerId === msg.sender
                ? { ...c, unread: (c.unread || 0) + 1, lastMessage: msg.content, lastAt: msg.createdAt }
                : c,
            ),
          );
        }
        return current;
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = (convo) => {
    setActiveConvo(convo);
    setShowList(false);
    setLoadingMsgs(true);
    setMessages([]);

    fetch(`${API}/api/messages/${convo.partnerId}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        setMessages(Array.isArray(data) ? data : []);
        setLoadingMsgs(false);
        // Clear unread for this conversation
        setConversations((prev) =>
          prev.map((c) => (c.partnerId === convo.partnerId ? { ...c, unread: 0 } : c)),
        );
      })
      .catch(() => setLoadingMsgs(false));
  };

  const handleSend = async () => {
    const text = newMsg.trim();
    if (!text || !activeConvo || sending) return;

    setSending(true);
    setNewMsg("");

    // Optimistic update
    const tempMsg = {
      _id: `temp-${Date.now()}`,
      sender: myUserId(),
      receiver: activeConvo.partnerId,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch(`${API}/api/messages/${activeConvo.partnerId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ content: text }),
      });
      const saved = await res.json();

      // Replace temp message with saved one
      setMessages((prev) =>
        prev.map((m) => (m._id === tempMsg._id ? saved : m)),
      );

      // Update conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.partnerId === activeConvo.partnerId
            ? { ...c, lastMessage: text, lastAt: saved.createdAt }
            : c,
        ),
      );

      // Relay via socket so receiver gets it in real-time
      if (socketRef.current) {
        socketRef.current.emit("dm:send", {
          receiverId: activeConvo.partnerId,
          message: saved,
        });
      }
    } catch {
      // Revert on failure
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
      setNewMsg(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const totalUnread = conversations.reduce((s, c) => s + (c.unread || 0), 0);
  const uid = myUserId();

  return (
    <PatientLayout title={`Messages${totalUnread > 0 ? ` (${totalUnread})` : ""}`}>
      <div className="h-[calc(100vh-8rem)] flex gap-0 bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
        {/* ── Conversation list ── */}
        <aside
          className={`w-full md:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col ${
            showList ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="p-4 border-b border-gray-100 bg-rose-50">
            <h2 className="text-base font-black text-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#E05C8A]">forum</span>
              Conversations
              {totalUnread > 0 && (
                <span className="ml-auto w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loadingConvos ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-4 border-[#E05C8A] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <span className="material-symbols-outlined text-4xl mb-2">chat_bubble</span>
                <p className="text-sm">No conversations yet.</p>
                <p className="text-xs mt-1">Book an appointment to message your doctor.</p>
              </div>
            ) : (
              conversations.map((convo) => (
                <button
                  key={convo.partnerId}
                  onClick={() => openConversation(convo)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-rose-50/60 transition-colors ${
                    activeConvo?.partnerId === convo.partnerId ? "bg-rose-50" : ""
                  }`}
                >
                  <Avatar name={convo.partnerName} avatar={convo.partnerAvatar} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {convo.partnerName}
                      </p>
                      {convo.lastAt && (
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {new Date(convo.lastAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {convo.specialty
                        ? `Dr. · ${convo.specialty}`
                        : convo.lastMessage || "Start a conversation"}
                    </p>
                  </div>
                  {convo.unread > 0 && (
                    <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center flex-shrink-0">
                      {convo.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ── Message thread ── */}
        <div
          className={`flex-1 flex flex-col ${
            !showList ? "flex" : "hidden md:flex"
          }`}
        >
          {!activeConvo ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl mb-3">chat</span>
                <p className="font-semibold">Select a conversation</p>
                <p className="text-sm mt-1">Choose a doctor from the list to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
                <button
                  className="md:hidden p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  onClick={() => setShowList(true)}
                >
                  <span className="material-symbols-outlined text-gray-500">arrow_back</span>
                </button>
                <Avatar name={activeConvo.partnerName} avatar={activeConvo.partnerAvatar} />
                <div>
                  <p className="font-bold text-gray-800 text-sm">{activeConvo.partnerName}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {activeConvo.specialty
                      ? `Doctor · ${activeConvo.specialty}`
                      : activeConvo.partnerRole}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-4 border-[#E05C8A] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No messages yet. Say hello!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = (msg.sender?._id || msg.sender) === uid;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                            isMine
                              ? "bg-gradient-to-br from-[#E05C8A] to-[#F4845F] text-white rounded-br-sm"
                              : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                          }`}
                        >
                          {msg.content}
                          <p
                            className={`text-[10px] mt-1 ${
                              isMine ? "text-white/70 text-right" : "text-gray-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder={`Message ${activeConvo.partnerName}…`}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-gray-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMsg.trim() || sending}
                    className="px-4 py-2.5 rounded-xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
                    style={{ background: "linear-gradient(135deg,#E05C8A,#F4845F)" }}
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
