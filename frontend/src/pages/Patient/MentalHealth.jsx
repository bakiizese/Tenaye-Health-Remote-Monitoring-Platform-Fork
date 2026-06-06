import { useState, useEffect, useRef } from "react";
import PatientLayout from "./components/PatientLayout";
import { getMyProfile } from "../../services/patientService";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

const MOODS = [
  { emoji: "😄", label: "Excellent", value: 5, color: "#10b981" },
  { emoji: "🙂", label: "Good",      value: 4, color: "#3b82f6" },
  { emoji: "😐", label: "Neutral",   value: 3, color: "#f59e0b" },
  { emoji: "😕", label: "Low",       value: 2, color: "#f97316" },
  { emoji: "😢", label: "Very Low",  value: 1, color: "#ef4444" },
];

function getMoodGroup(moodValue) {
  if (!moodValue) return { group: 2, name: "Balance & Mindfulness", emoji: "🧘" };
  if (moodValue <= 2) return { group: 1, name: "Support & Healing", emoji: "💙" };
  if (moodValue === 3) return { group: 2, name: "Balance & Mindfulness", emoji: "🧘" };
  return { group: 3, name: "Positivity & Growth", emoji: "🌟" };
}

function MoodSelector({ onSelect, selected }) {
  return (
    <div className="flex gap-3 justify-center flex-wrap">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onSelect(mood)}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all transform hover:scale-110 ${
            selected?.value === mood.value
              ? "bg-gradient-to-br from-purple-200 to-pink-200 ring-2 ring-purple-400 scale-110 shadow-lg"
              : "bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <span className="text-4xl">{mood.emoji}</span>
          <span className="text-xs font-bold text-gray-700">{mood.label}</span>
        </button>
      ))}
    </div>
  );
}

function MoodChart({ moodHistory }) {
  if (moodHistory.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl mb-2">psychology</span>
          <p>No mood data yet. Start tracking to see your progress!</p>
        </div>
      </div>
    );
  }
  const maxValue = 5;
  const chartHeight = 200;
  const displayData = moodHistory.slice(-7);
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2 h-64 bg-gradient-to-b from-purple-50 to-white rounded-2xl p-6">
        {displayData.map((entry, idx) => {
          const height = (entry.value / maxValue) * chartHeight;
          const mood = MOODS.find((m) => m.value === entry.value);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg transition-all hover:shadow-lg"
                style={{ height: `${height}px`, backgroundColor: mood?.color, cursor: "pointer" }}
                title={`${new Date(entry.date).toLocaleDateString()}: ${mood?.label}`}
              />
              <span className="text-lg">{mood?.emoji}</span>
              <span className="text-xs text-gray-500 text-center">
                {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
          <p className="text-xs text-emerald-600 font-bold">Best Mood</p>
          <p className="text-2xl mt-1">
            {MOODS.find((m) => m.value === Math.max(...displayData.map((d) => d.value)))?.emoji}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 border border-red-100">
          <p className="text-xs text-red-600 font-bold">Lowest Mood</p>
          <p className="text-2xl mt-1">
            {MOODS.find((m) => m.value === Math.min(...displayData.map((d) => d.value)))?.emoji}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <p className="text-xs text-blue-600 font-bold">Average</p>
          <p className="text-2xl mt-1">
            {(displayData.reduce((sum, d) => sum + d.value, 0) / displayData.length).toFixed(1)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
          <p className="text-xs text-purple-600 font-bold">Trend</p>
          <p className="text-lg mt-1">
            {displayData[displayData.length - 1].value > displayData[0].value ? (
              <span className="text-emerald-600">📈 Improving</span>
            ) : displayData[displayData.length - 1].value < displayData[0].value ? (
              <span className="text-red-600">📉 Declining</span>
            ) : (
              <span className="text-yellow-600">→ Stable</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function AIRecommendation({ mood }) {
  const REC = {
    5: { title: "Maintain Your Momentum 🌟", tips: ["Continue the activities that made you feel this great", "Share your positive energy with others around you", "Document what worked today for future reference", "Consider helping someone else — it reinforces positivity", "Stay hydrated and maintain healthy sleep patterns"] },
    4: { title: "Build on This Positive Energy 🌱", tips: ["Engage in activities that bring you joy", "Connect with friends or family you care about", "Take time for self-care and relaxation", "Practice gratitude for three things today", "Exercise or take a walk in nature if possible"] },
    3: { title: "Balance and Self-Care 🧘", tips: ["Try a mindfulness or meditation session", "Take breaks between tasks", "Reach out to someone you trust", "Engage in a hobby or creative activity", "Limit screen time and negative news"] },
    2: { title: "Reach Out for Support 🤝", tips: ["Talk to someone you trust about how you're feeling", "Practice deep breathing exercises", "Avoid making major decisions today", "Do something small that brings comfort", "Consider speaking with a mental health professional"] },
    1: { title: "You're Not Alone — Get Help 💙", tips: ["Reach out to a trusted friend, family member, or counselor immediately", "Call a mental health helpline if you need someone to talk to", "Practice basic self-care: eat, drink water, rest", "Avoid isolation — join a support group", "Consider professional mental health support"] },
  };
  const rec = REC[mood?.value] || REC[3];
  const icons = ["favorite", "spa", "psychology", "group", "emergency_share"];
  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-6">
      <h3 className="text-lg font-bold text-purple-900 mb-4">{rec.title}</h3>
      <ul className="space-y-3">
        {rec.tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
            <span className="material-symbols-outlined text-purple-600 mt-0.5">{icons[i]}</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Inline AI Group Therapy Chat ─────────────────────────────────────────────
function InlineGroupChat({ moodGroup, moodGroupName, moodEmoji, userEmail }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiTyping, setAiTyping] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const userName = userEmail?.split("@")[0] || localStorage.getItem("userName") || "Anonymous";

  useEffect(() => {
    fetch(`${API}/api/group-chat/room/${moodGroup}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (!r.ok) throw new Error("Could not load the support group."); return r.json(); })
      .then((data) => {
        setRoomId(data.roomId);
        setMessages(data.messages.map((m) => ({
          id: m._id,
          senderName: m.senderName,
          text: m.text,
          isAI: m.isAI,
          timestamp: new Date(m.timestamp),
        })));
        setLoading(false);

        const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
        socketRef.current = window.io(socketUrl);
        socketRef.current.emit("group-chat:join", { roomId: data.roomId, userId, userName });

        socketRef.current.on("group-chat:message", (msg) => {
          setAiTyping(false);
          setMessages((prev) => [
            ...prev,
            { id: msg._id || Date.now(), senderName: msg.senderName, text: msg.text, isAI: msg.isAI, timestamp: new Date(msg.timestamp) },
          ]);
        });
        socketRef.current.on("group-chat:typing", () => setAiTyping(true));
        socketRef.current.on("group-chat:typing-stop", () => setAiTyping(false));
        socketRef.current.on("group-chat:participants", ({ count }) => setParticipantCount(count));
      })
      .catch((err) => { setError(err.message); setLoading(false); });

    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, aiTyping]);

  const handleSend = () => {
    const text = newMessage.trim();
    if (!text || !roomId || !socketRef.current) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), senderName: userName, text, isAI: false, timestamp: new Date(), isMine: true },
    ]);
    setNewMessage("");
    inputRef.current?.focus();
    socketRef.current.emit("group-chat:message", { roomId, text, userId, userName });
  };

  if (loading) return (
    <div className="bg-white rounded-2xl border-2 border-purple-200 p-8 flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600 font-semibold text-sm">Joining your support group…</p>
    </div>
  );

  if (error) return (
    <div className="bg-white rounded-2xl border-2 border-red-200 p-8 flex flex-col items-center gap-4">
      <span className="material-symbols-outlined text-4xl text-red-400">error</span>
      <p className="text-gray-700 text-center text-sm">{error}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border-2 border-purple-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl flex-shrink-0">
          {moodEmoji}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base">{moodGroupName}</h3>
          <p className="text-xs text-white/80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {participantCount} {participantCount === 1 ? "person" : "people"} online · AI Therapist active
          </p>
        </div>
        <span className="text-[11px] bg-white/20 px-2.5 py-1 rounded-full font-semibold">Free</span>
      </div>

      {/* Messages */}
      <div className="overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ height: "380px" }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <span className="text-4xl">💬</span>
              <p className="text-sm mt-2 font-semibold">Be the first to share in this group</p>
              <p className="text-xs mt-1 text-gray-400">The AI therapist will greet you shortly</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.isMine ? "flex-row-reverse" : ""}`}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 shadow-sm"
                style={{ backgroundColor: msg.isAI ? "#ede9fe" : msg.isMine ? "#fce7f3" : "#e0e7ff" }}
              >
                {msg.isAI ? "🤖" : msg.isMine ? "😊" : "🤍"}
              </div>
              <div className={`flex-1 min-w-0 flex flex-col ${msg.isMine ? "items-end" : ""}`}>
                <div className={`flex items-center gap-2 mb-1 ${msg.isMine ? "flex-row-reverse" : ""}`}>
                  <span className="font-bold text-gray-800 text-xs">{msg.isMine ? "You" : msg.senderName}</span>
                  {msg.isAI && (
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                      AI Therapist
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl text-sm max-w-xs md:max-w-sm break-words leading-relaxed ${
                    msg.isAI
                      ? "bg-purple-50 border border-purple-200 text-gray-800 rounded-tl-sm"
                      : msg.isMine
                      ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-tr-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))
        )}
        {aiTyping && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg flex-shrink-0">🤖</div>
            <div className="flex flex-col">
              <span className="text-[10px] text-purple-700 font-bold mb-1">AI Therapist</span>
              <div className="bg-purple-50 border border-purple-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                {[0, 150, 300].map((d) => (
                  <div key={d} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Share your thoughts with the group…"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-gray-50"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">lock</span>
          Conversations are confidential and AI-moderated for your safety
        </p>
      </div>
    </div>
  );
}

function GroupInvitationModal({ onClose, mood }) {
  const [emails, setEmails] = useState("");
  const [sent, setSent] = useState(false);
  const handleInvite = () => {
    if (!emails.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); setEmails(""); onClose(); }, 2000);
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white rounded-t-2xl">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined">person_add</span>
            Invite to Support Group
          </h3>
          <p className="text-sm text-white/80 mt-1">Invite friends to join the {mood?.label} support group</p>
        </div>
        <div className="p-6 space-y-4">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <span className="material-symbols-outlined text-5xl text-emerald-500">check_circle</span>
              <p className="font-bold text-gray-700">Invitations sent!</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Addresses (comma-separated)</label>
                <textarea
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder="friend@email.com, another@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows="4"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleInvite} className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:scale-105 transition-transform">Send Invitations</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PatientMentalHealth() {
  const [profile, setProfile] = useState(null);
  const [todayMood, setTodayMood] = useState(null);
  const [moodDescription, setMoodDescription] = useState("");
  const [moodLogged, setMoodLogged] = useState(false);
  const [moodHistory, setMoodHistory] = useState([
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), value: 2 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), value: 3 },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), value: 3 },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), value: 4 },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), value: 4 },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), value: 3 },
  ]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile().then((result) => {
      if (result.data) setProfile(result.data);
      setLoading(false);
    });
  }, []);

  const handleMoodSubmit = () => {
    if (!todayMood) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setMoodHistory((prev) => {
      const idx = prev.findIndex((m) => { const d = new Date(m.date); d.setHours(0,0,0,0); return d.getTime() === today.getTime(); });
      const entry = { date: new Date(), value: todayMood.value };
      if (idx >= 0) { const updated = [...prev]; updated[idx] = entry; return updated; }
      return [...prev, entry];
    });
    setMoodLogged(true);
    setTimeout(() => setMoodLogged(false), 3000);
    setMoodDescription("");
  };

  if (loading) return (
    <PatientLayout title="Mental Health">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#E05C8A] border-t-transparent rounded-full animate-spin" />
      </div>
    </PatientLayout>
  );

  const moodGroup = getMoodGroup(todayMood?.value);

  return (
    <PatientLayout title="Mental Health">
      {showInviteModal && (
        <GroupInvitationModal onClose={() => setShowInviteModal(false)} mood={todayMood} />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white" style={{ background: "linear-gradient(135deg,#7c3aed 0%,#a855f7 55%,#ec4899 100%)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 bg-white/5" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-white/80" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">Daily Tracker · AI-Powered Support</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black">Mental Health Tracker</h2>
            <p className="text-white/70 mt-1 text-sm">Track your mood, get AI support, and connect with peers in your community</p>
          </div>
        </div>

        {/* Daily Mood Tracker */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600">sentiment_satisfied</span>
            How are you feeling today?
          </h3>
          <div className="space-y-4">
            <MoodSelector onSelect={setTodayMood} selected={todayMood} />
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">What's on your mind? (Optional)</label>
              <textarea
                value={moodDescription}
                onChange={(e) => setMoodDescription(e.target.value)}
                placeholder="Describe what you're feeling and why..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows="3"
              />
            </div>
            {moodLogged && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                Mood logged — {todayMood?.emoji} {todayMood?.label}. You&apos;ve been matched to your support group below!
              </div>
            )}
            <button
              onClick={handleMoodSubmit}
              disabled={!todayMood}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all ${todayMood ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 cursor-pointer" : "bg-gray-300 cursor-not-allowed"}`}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">save</span>
                Log My Mood & Join Support Group
              </span>
            </button>
          </div>
        </div>

        {/* Mood History */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">trending_up</span>
            Your Mood Journey
          </h3>
          <MoodChart moodHistory={moodHistory} />
        </div>

        {/* AI Recommendation */}
        {todayMood && (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600">lightbulb</span>
              AI-Powered Recommendations
              <span className="text-xs font-normal bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Based on Your Mood</span>
            </h3>
            <AIRecommendation mood={todayMood} />
          </div>
        )}

        {/* ── Inline AI Group Chat (auto-joined based on mood) ── */}
        {todayMood && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">group</span>
                Your Support Community
                <span className="text-xs font-normal bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Free</span>
                <span className="text-xs font-normal bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Auto-Joined
                </span>
              </h3>
              <button
                onClick={() => setShowInviteModal(true)}
                className="text-sm px-3 py-1.5 bg-white border-2 border-purple-400 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                Invite Friends
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Matched to <strong>{moodGroup.emoji} {moodGroup.name}</strong> — peers sharing your emotional state. The AI therapist will personally welcome you and facilitate the conversation.
            </p>
            <InlineGroupChat
              moodGroup={moodGroup.group}
              moodGroupName={moodGroup.name}
              moodEmoji={moodGroup.emoji}
              userEmail={profile?.email}
            />
          </div>
        )}

        {/* Crisis Resources */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-700 flex items-start gap-2">
            <span className="material-symbols-outlined text-sm mt-0.5">emergency_share</span>
            <span>
              <strong>Need Immediate Help?</strong> If you're experiencing a mental health crisis, contact a professional immediately. Ethiopia crisis line: <strong>+251-116-629-698</strong>. This tool is for tracking and support, not emergency care.
            </span>
          </p>
        </div>
      </div>
    </PatientLayout>
  );
}
