import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PatientLayout from "./components/PatientLayout";
import { getMyAppointments, getPayments } from "../../services/patientService";

// Stream Video and Chat SDKs (loaded via CDN)
const StreamVideo = window?.StreamVideo?.StreamVideoClient;
const StreamChat = window?.StreamChat?.StreamChat;

const statusColors = {
  upcoming: "bg-rose-100 text-rose-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-gray-100 text-gray-500",
};

// Circular ring card — unique to Patient
function RingCard({ label, value, unit, max, color, icon, status, statusOk }) {
  const r = 26,
    circ = 2 * Math.PI * r;
  const dash = Math.min(value / max, 1) * circ;
  return (
    <div className="bg-white rounded-2xl p-4 border border-rose-100 hover:border-rose-300 hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer group">
      <div className="relative w-16 h-16 mb-2">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke="#fce7eb"
            strokeWidth="5"
          />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-base"
            style={{ color }}
          >
            {icon}
          </span>
        </div>
      </div>
      <p className="text-base font-black text-gray-800">
        {value}
        <span className="text-[10px] font-normal text-gray-400 ml-0.5">
          {unit}
        </span>
      </p>
      <p className="text-[10px] font-bold text-gray-500 mt-0.5">{label}</p>
      {status && (
        <span
          className={`text-[10px] mt-1 font-bold px-2 py-0.5 rounded-full ${statusOk ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
        >
          {status}
        </span>
      )}
    </div>
  );
}

// Flat colored metric tile — no orbs
function MetricTile({ label, value, icon, color, bg, trend, trendUp = true }) {
  return (
    <div
      className={`${bg} rounded-2xl p-5 border border-white hover:shadow-md transition-all cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: color + "22" }}
        >
          <span className="material-symbols-outlined text-xl" style={{ color }}>
            {icon}
          </span>
        </div>
        {trend && (
          <span
            className={`text-xs font-bold flex items-center gap-0.5 ${trendUp ? "text-emerald-600" : "text-red-500"}`}
          >
            <span className="material-symbols-outlined text-sm">
              {trendUp ? "arrow_upward" : "arrow_downward"}
            </span>
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 font-semibold mt-0.5">{label}</p>
    </div>
  );
}

// Dual-line vitals chart — unique to Patient
function VitalsChart({ data }) {
  if (!data.length) return null;
  const hrPts = data.map((v, i) => [
    (i / (data.length - 1)) * 360 + 20,
    90 - ((v.hr - 75) / 15) * 60,
  ]);
  const spoPts = data.map((v, i) => [
    (i / (data.length - 1)) * 360 + 20,
    90 - ((v.spo2 - 94) / 6) * 60,
  ]);
  const hrPath = hrPts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
    .join(" ");
  const spoPath = spoPts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
    .join(" ");
  return (
    <svg className="w-full" viewBox="0 0 400 110" preserveAspectRatio="none">
      <defs>
        <linearGradient id="hrFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E05C8A" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#E05C8A" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[30, 60, 90].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="400"
          y2={y}
          stroke="#fce7eb"
          strokeWidth="1"
        />
      ))}
      <path
        d={hrPath + ` L${hrPts[hrPts.length - 1][0]},100 L${hrPts[0][0]},100 Z`}
        fill="url(#hrFill)"
      />
      <path
        d={hrPath}
        fill="none"
        stroke="#E05C8A"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={spoPath}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4 2"
      />
      {hrPts.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="3.5"
          fill="#E05C8A"
          stroke="white"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, _setUserName] = useState(
    () => localStorage.getItem("userName") || "Patient",
  );
  const [counters, setCounters] = useState({
    appointments: 0,
    prescriptions: 0,
    labs: 0,
    spent: 0,
  });

  // Get user name from localStorage — handled by lazy useState initializer above

  // SOS Emergency State (UI not yet implemented)
  // eslint-disable-next-line no-unused-vars
  const [sosActive, setSosActive] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [sosStatus, setSosStatus] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [inCall, setInCall] = useState(false);
  const [callId, setCallId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [paymentVerified, setPaymentVerified] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [paymentLoading, setPaymentLoading] = useState(false);
  const videoContainerRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);
  const videoClientRef = useRef(null);
  const chatClientRef = useRef(null);
  const callRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
    socketRef.current = window.io(socketUrl);

    // Listen for SOS acceptance
    const userId = localStorage.getItem("userId");
    if (userId) {
      socketRef.current.on(`sos-accepted-${userId}`, () => {
        setSosStatus("Doctor has joined the call!");
      });

      socketRef.current.on(`sos-declined-${userId}`, () => {
        setSosStatus(
          "Doctor is unavailable. Please try again or contact emergency services.",
        );
        setTimeout(() => {
          setSosActive(false);
          setSosStatus("");
        }, 5000);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Verify payment before enabling video/chat
  const verifyPayment = async () => {
    try {
      setPaymentLoading(true);
      setSosStatus("Verifying payment...");

      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      // Check if user has valid payment or subscription
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/payments/verify-sos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId, serviceType: "sos_emergency" }),
        },
      );

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Payment verification failed" }));
        throw new Error(errorData.message || "Payment verification failed");
      }

      const data = await res.json();

      if (data.verified) {
        setPaymentVerified(true);
        setSosStatus("Payment verified. Initializing emergency call...");
        return true;
      } else {
        setSosStatus(
          "Payment required. Please complete payment to access emergency services.",
        );
        return false;
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setSosStatus(`Payment error: ${error.message}. Please contact support.`);
      return false;
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle SOS Emergency Button
  // eslint-disable-next-line no-unused-vars
  const handleSOS = async () => {
    try {
      setSosActive(true);
      setSosStatus("Connecting to emergency services...");

      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName") || "Patient";

      if (!token || !userId) {
        setSosStatus("Please log in to use emergency services.");
        return;
      }

      // Step 1: Verify payment first
      const isPaymentVerified = await verifyPayment();
      if (!isPaymentVerified) {
        return; // Stop here if payment not verified
      }

      // Step 2: Get Stream token (with error handling)
      let streamTokenData;
      try {
        const streamTokenRes = await fetch(
          `${import.meta.env.VITE_API_URL}/stream/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId }),
          },
        );

        if (!streamTokenRes.ok) {
          const errorText = await streamTokenRes.text();
          throw new Error(
            `Stream token error: ${streamTokenRes.status} ${errorText}`,
          );
        }

        streamTokenData = await streamTokenRes.json();
      } catch (tokenError) {
        console.error("Stream token error:", tokenError);
        setSosStatus(
          "Video service temporarily unavailable. Chat-only mode enabled.",
        );
        // Continue with chat-only mode
      }

      // Get assigned doctor (from most recent appointment or default)
      const assignedDoctorId =
        localStorage.getItem("assignedDoctorId") || appointments[0]?.doctorId;

      if (!assignedDoctorId) {
        setSosStatus(
          "No assigned doctor found. Please contact emergency services: 911",
        );
        return;
      }

      // Step 3: Create Stream call
      let callData;
      try {
        const callRes = await fetch(
          `${import.meta.env.VITE_API_URL}/stream/create-call`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              patientId: userId,
              doctorId: assignedDoctorId,
            }),
          },
        );

        if (!callRes.ok) {
          const errorText = await callRes.text();
          throw new Error(
            `Call creation error: ${callRes.status} ${errorText}`,
          );
        }

        callData = await callRes.json();
      } catch (callError) {
        console.error("Call creation error:", callError);
        setSosStatus(
          "Failed to create emergency call. Please contact emergency services: 911",
        );
        return;
      }

      if (!callData?.callId) {
        setSosStatus(
          "Failed to create emergency call. Please contact emergency services: 911",
        );
        return;
      }

      setCallId(callData.callId);
      setInCall(true);
      setSosStatus("Emergency call initiated. Waiting for doctor...");

      // Step 4: Initialize Stream Video (only after payment verified)
      if (StreamVideo && streamTokenData?.apiKey && streamTokenData?.token) {
        try {
          const client = new StreamVideo(streamTokenData.apiKey, {
            token: streamTokenData.token,
            user: { id: userId, name: userName },
          });
          videoClientRef.current = client;

          const call = client.call("default", callData.callId);
          callRef.current = call;
          await call.join({ create: false });

          // Render video
          if (videoContainerRef.current) {
            call.camera.enable();
            call.microphone.enable();
          }
        } catch (videoError) {
          console.error("Video initialization error:", videoError);
          setSosStatus("Video unavailable. Using chat-only mode.");
        }
      }

      // Step 5: Initialize Stream Chat (only after payment verified)
      if (StreamChat && streamTokenData?.apiKey && streamTokenData?.token) {
        try {
          const chatClient = StreamChat.getInstance(streamTokenData.apiKey);
          await chatClient.connectUser(
            { id: userId, name: userName },
            streamTokenData.token,
          );
          chatClientRef.current = chatClient;

          const channel = chatClient.channel("messaging", callData.callId, {
            name: `Emergency Call - ${callData.callId}`,
          });
          await channel.watch();

          // Listen for messages
          channel.on("message.new", (event) => {
            setMessages((prev) => [
              ...prev,
              {
                id: event.message.id,
                text: event.message.text,
                user: event.message.user.name,
                timestamp: new Date(
                  event.message.created_at,
                ).toLocaleTimeString(),
              },
            ]);
          });
        } catch (chatError) {
          console.error("Chat initialization error:", chatError);
          setSosStatus("Chat unavailable. Please wait for doctor to call you.");
        }
      }

      // Emit SOS alert via Socket.io
      if (socketRef.current) {
        socketRef.current.emit("sos-triggered", {
          patientId: userId,
          doctorId: assignedDoctorId,
          patientName: userName,
          callId: callData.callId,
        });
      }
    } catch (error) {
      console.error("SOS Error:", error);
      setSosStatus(
        `Failed to connect: ${error.message}. Please call emergency services: 911`,
      );
    }
  };

  // End SOS Call
  // eslint-disable-next-line no-unused-vars
  const endSOSCall = async () => {
    try {
      const token = localStorage.getItem("token");

      // End Stream call
      if (callRef.current) {
        await callRef.current.leave();
      }

      // Disconnect chat
      if (chatClientRef.current) {
        await chatClientRef.current.disconnectUser();
      }

      // Notify backend
      if (callId) {
        await fetch(`${import.meta.env.VITE_API_URL}/stream/end-call`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ callId }),
        });

        // Emit end event
        socketRef.current.emit("sos-ended", {
          callId,
          patientId: localStorage.getItem("userId"),
        });
      }

      setInCall(false);
      setSosActive(false);
      setSosStatus("");
      setCallId(null);
      setMessages([]);
      setPaymentVerified(false);
    } catch (error) {
      console.error("End call error:", error);
    }
  };

  // Send chat message
  // eslint-disable-next-line no-unused-vars
  const sendMessage = async () => {
    if (!newMessage.trim() || !callId) return;

    try {
      const _userId = localStorage.getItem("userId");
      const channel = chatClientRef.current?.channel("messaging", callId);
      if (channel) {
        await channel.sendMessage({ text: newMessage });
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: newMessage,
            user: "You",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  // Fetch real data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch appointments
        const appointmentsResult = await getMyAppointments();
        const appointmentsData = appointmentsResult.data || [];

        // Fetch payments for spending stats
        const paymentsResult = await getPayments();
        const paymentsData = paymentsResult.data || [];

        // Calculate stats from real data
        const upcomingAppointments = appointmentsData.filter(
          (a) => a.status === "upcoming",
        ).length;
        const totalSpent = paymentsData
          .filter((p) => p.status === "paid")
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        setStats({
          upcomingAppointments,
          activePrescriptions: 0, // Will be updated when prescriptions API is available
          pendingLabResults: 0, // Will be updated when lab results API is available
          totalSpent,
        });

        setAppointments(
          appointmentsData.filter((a) => a.status === "upcoming").slice(0, 3),
        );
        setActivity([]); // Activity feed will be populated when API is available
        setVitals([]); // Vitals will be populated when API is available
        setPrescriptions([]); // Prescriptions will be populated when API is available
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!stats) return;
    const steps = 40,
      iv = 1200 / steps;
    let s = 0;
    const t = setInterval(() => {
      s++;
      const e = 1 - Math.pow(1 - s / steps, 3);
      setCounters({
        appointments: Math.round(stats.upcomingAppointments * e),
        prescriptions: Math.round(stats.activePrescriptions * e),
        labs: Math.round(stats.pendingLabResults * e),
        spent: Math.round(stats.totalSpent * e),
      });
      if (s >= steps) clearInterval(t);
    }, iv);
    return () => clearInterval(t);
  }, [stats]);

  if (loading)
    return (
      <PatientLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-[#E05C8A] border-t-transparent rounded-full animate-spin" />
        </div>
      </PatientLayout>
    );

  const lv = vitals[0];

  return (
    <PatientLayout title="Dashboard">
      <div className="space-y-6">
        {/* ── Welcome Banner ── */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white"
          style={{
            background:
              "linear-gradient(135deg,#c94b7a 0%,#E05C8A 55%,#F4845F 100%)",
          }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full -mr-24 -mt-24 bg-white/5" />
          <div className="absolute bottom-0 left-20 w-48 h-48 rounded-full -mb-20 bg-white/5" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="material-symbols-outlined text-white/80 text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
                <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                  Your Health Portal ·{" "}
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black">
                Welcome back, {userName} 👋
              </h2>
              <p className="text-white/70 mt-1.5 text-sm">
                You have{" "}
                <span className="text-white font-bold">
                  {counters.appointments} upcoming appointment
                  {counters.appointments !== 1 ? "s" : ""}
                </span>{" "}
                · Stay on top of your health
              </p>
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm text-white/80">
                    medication
                  </span>
                  {counters.prescriptions} Active Rx
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm text-white/80">
                    biotech
                  </span>
                  {counters.labs} Pending Lab{counters.labs !== 1 ? "s" : ""}
                </div>
                {lv && (
                  <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 text-xs font-semibold">
                    <span className="material-symbols-outlined text-sm text-white/80">
                      monitor_heart
                    </span>
                    HR: {lv.hr} BPM
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate("/patient/doctors")}
              className="flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 text-white rounded-xl text-sm font-bold border border-white/20 hover:scale-105 transition-all self-start md:self-auto backdrop-blur-sm"
            >
              <span className="material-symbols-outlined text-sm">
                add_circle
              </span>
              Book Appointment
            </button>
          </div>
        </div>

        {/* ── Flat metric tiles — no orbs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricTile
            label="Upcoming Appointments"
            value={counters.appointments}
            icon="calendar_today"
            color="#E05C8A"
            bg="bg-rose-50"
            trend={
              counters.appointments > 0
                ? `${counters.appointments} upcoming`
                : "No upcoming"
            }
          />
          <MetricTile
            label="Active Prescriptions"
            value={counters.prescriptions}
            icon="medication"
            color="#d97706"
            bg="bg-amber-50"
            trend={
              counters.prescriptions > 0
                ? `${counters.prescriptions} active`
                : "No active"
            }
          />
          <MetricTile
            label="Pending Lab Results"
            value={counters.labs}
            icon="biotech"
            color="#7c3aed"
            bg="bg-violet-50"
            trend={
              counters.labs > 0 ? `${counters.labs} pending` : "No pending"
            }
          />
          <MetricTile
            label="Total Spent (ETB)"
            value={counters.spent.toLocaleString()}
            icon="payments"
            color="#059669"
            bg="bg-emerald-50"
            trend={
              counters.spent > 0 ? "Payments up to date" : "No payments yet"
            }
          />
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Dual-line vitals chart */}
            <div className="bg-white rounded-2xl border border-rose-100 hover:shadow-lg transition-all p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#E05C8A]">
                      monitor_heart
                    </span>
                    Vitals Overview
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {vitals.length > 0
                      ? "Heart rate & SpO₂ — last 7 readings"
                      : "No vitals recorded yet"}
                  </p>
                </div>
                {vitals.length > 0 && (
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-[#E05C8A] font-bold">
                      <span className="w-4 h-0.5 bg-[#E05C8A] inline-block rounded" />
                      HR
                    </span>
                    <span className="flex items-center gap-1.5 text-blue-500 font-bold">
                      <span className="w-4 h-0.5 border-t-2 border-dashed border-blue-400 inline-block" />
                      SpO₂
                    </span>
                  </div>
                )}
              </div>
              {vitals.length > 0 ? (
                <>
                  <div className="h-28">
                    <VitalsChart data={vitals} />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] font-bold text-gray-400 px-5">
                    {vitals.map((v) => (
                      <span key={v.date}>{v.date}</span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-28 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-3xl mb-2">
                      monitor_heart
                    </span>
                    <p className="text-xs">Vitals data will appear here</p>
                  </div>
                </div>
              )}
              {vitals.length > 0 && (
                <div className="flex justify-between mt-3 text-xs text-gray-400">
                  <span>
                    HR:{" "}
                    <span className="font-bold text-[#E05C8A]">
                      {Math.min(...vitals.map((v) => v.hr))}–
                      {Math.max(...vitals.map((v) => v.hr))} BPM
                    </span>
                  </span>
                  <span>
                    SpO₂:{" "}
                    <span className="font-bold text-blue-500">
                      {Math.min(...vitals.map((v) => v.spo2))}–
                      {Math.max(...vitals.map((v) => v.spo2))}%
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Vital rings */}
            {lv && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#E05C8A] text-lg">
                      vital_signs
                    </span>
                    Latest Readings — {lv.date}
                  </h3>
                  <button
                    onClick={() => navigate("/patient/vitals")}
                    className="text-xs text-[#E05C8A] font-bold hover:underline"
                  >
                    View history →
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <RingCard
                    label="Heart Rate"
                    value={lv.hr}
                    unit="BPM"
                    max={120}
                    color="#E05C8A"
                    icon="monitor_heart"
                    status={lv.hr < 100 ? "Normal" : "High"}
                    statusOk={lv.hr < 100}
                  />
                  <RingCard
                    label="SpO₂"
                    value={lv.spo2}
                    unit="%"
                    max={100}
                    color="#3b82f6"
                    icon="air"
                    status={lv.spo2 >= 95 ? "Normal" : "Low"}
                    statusOk={lv.spo2 >= 95}
                  />
                  <RingCard
                    label="Temperature"
                    value={lv.temp}
                    unit="°C"
                    max={42}
                    color="#f59e0b"
                    icon="thermostat"
                    status={lv.temp <= 37.5 ? "Normal" : "Elevated"}
                    statusOk={lv.temp <= 37.5}
                  />
                  <RingCard
                    label="Weight"
                    value={lv.weight}
                    unit="kg"
                    max={100}
                    color="#8b5cf6"
                    icon="scale"
                    status="Stable"
                    statusOk={true}
                  />
                </div>
              </div>
            )}

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-2xl border border-rose-100 hover:shadow-lg transition-all p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#E05C8A]">
                    today
                  </span>
                  Upcoming Appointments
                </h3>
                <span
                  className="text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md animate-pulse"
                  style={{
                    background: "linear-gradient(135deg,#E05C8A,#F4845F)",
                  }}
                >
                  {appointments.length} Scheduled
                </span>
              </div>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-gray-200">
                    calendar_today
                  </span>
                  <p className="text-gray-400 text-sm mt-2">
                    No upcoming appointments
                  </p>
                  <button
                    onClick={() => navigate("/patient/doctors")}
                    className="mt-3 px-4 py-2 text-white text-xs font-bold rounded-xl hover:scale-105 transition-all"
                    style={{
                      background: "linear-gradient(135deg,#E05C8A,#F4845F)",
                    }}
                  >
                    Find a Doctor
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => {
                    const scheduledDate = new Date(apt.scheduled_at);
                    const timeStr = scheduledDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <div
                        key={apt._id}
                        className="flex items-center gap-4 p-3 rounded-xl border border-rose-100 hover:border-rose-300 hover:bg-rose-50/30 transition-all group"
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 text-white"
                          style={{
                            background:
                              "linear-gradient(135deg,#E05C8A,#F4845F)",
                          }}
                        >
                          <span className="text-sm font-black leading-none">
                            {scheduledDate.getDate()}
                          </span>
                          <span className="text-[10px] opacity-80">
                            {scheduledDate.toLocaleString("en-US", {
                              month: "short",
                            })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800">
                            {apt.doctor?.user?.full_name || "Doctor"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {timeStr} · {apt.doctor?.specialty || "General"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[apt.status]}`}
                          >
                            {apt.status}
                          </span>
                          <button
                            onClick={() => navigate("/patient/appointments")}
                            className="p-1.5 rounded-lg text-white hover:opacity-90 transition-colors"
                            style={{
                              background:
                                "linear-gradient(135deg,#E05C8A,#F4845F)",
                            }}
                          >
                            <span className="material-symbols-outlined text-sm">
                              arrow_forward
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <button
                onClick={() => navigate("/patient/appointments")}
                className="w-full mt-4 py-2.5 bg-rose-50 text-[#E05C8A] text-xs font-bold rounded-xl hover:bg-rose-100 transition-all uppercase tracking-widest border border-rose-100"
              >
                View All Appointments
              </button>
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-5">
            {/* Health Score — unique to Patient */}
            <div
              className="rounded-2xl p-5 text-white relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg,#c94b7a 0%,#E05C8A 60%,#F4845F 100%)",
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-10 -mt-10 bg-white/10" />
              <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">
                Health Score
              </p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black">78</span>
                <span className="text-white/70 text-sm mb-1">/ 100</span>
              </div>
              <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: "78%" }}
                />
              </div>
              <p className="text-xs text-white/70 mt-2">
                Good — keep up your healthy habits
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Activity", val: "Good" },
                  { label: "Sleep", val: "Fair" },
                  { label: "Vitals", val: "Watch" },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-white/15 rounded-xl py-2">
                    <p className="text-xs font-black">{val}</p>
                    <p className="text-[10px] text-white/60">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Prescriptions */}
            <div className="bg-white rounded-2xl border border-rose-100 hover:shadow-lg transition-all p-5">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E05C8A]">
                  medication
                </span>
                Active Prescriptions
              </h3>
              <div className="space-y-2">
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-rose-50/50 border border-rose-50 hover:border-rose-200 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#E05C8A] text-base">
                        medication
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {rx.medication}
                      </p>
                      <p className="text-[10px] text-gray-400">{rx.dosage}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-amber-600 block">
                        Exp {rx.expiryDate.slice(5)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        {rx.refills}R left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/patient/prescriptions")}
                className="w-full mt-3 py-2 bg-rose-50 text-[#E05C8A] text-xs font-bold rounded-xl hover:bg-rose-100 transition-all border border-rose-100"
              >
                View All
              </button>
            </div>

            {/* Nutrition Snapshot */}
            <div className="bg-white rounded-2xl border border-emerald-100 hover:shadow-lg transition-all p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500">
                    nutrition
                  </span>
                  Nutrition Snapshot
                </h3>
                <button
                  onClick={() => navigate("/patient/nutrition")}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Blood Glucose", icon: "water_drop", unit: "mg/dL", color: "#E05C8A", bg: "bg-rose-50" },
                  { label: "Blood Pressure", icon: "favorite", unit: "mmHg", color: "#3b82f6", bg: "bg-blue-50" },
                  { label: "Body Weight", icon: "scale", unit: "kg", color: "#8b5cf6", bg: "bg-violet-50" },
                ].map(({ label, icon, unit, color, bg }) => (
                  <div key={label} className={`flex items-center gap-3 p-2.5 rounded-xl ${bg} border border-white`}>
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-base" style={{ color }}>
                        {icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-700">{label}</p>
                      <p className="text-[10px] text-gray-400">{unit}</p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">— Log in Vitals</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/patient/nutrition")}
                className="w-full mt-3 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100"
              >
                View Nutrition Insights
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-rose-100 hover:shadow-lg transition-all p-5">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E05C8A]">
                  history
                </span>
                Recent Activity
              </h3>
              <div className="space-y-3">
                {activity.map((a) => (
                  <div key={a.id} className="flex gap-3 group">
                    <div className="w-7 h-7 rounded-full bg-rose-50 border-2 border-rose-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-rose-300 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-[#E05C8A] block" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 leading-snug">
                        {a.text}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {a.sub}
                      </p>
                      <span className="text-[10px] text-rose-500 font-semibold">
                        {a.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-rose-100 p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E05C8A]">
                  bolt
                </span>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Find Doctor",
                    icon: "medical_services",
                    path: "/patient/doctors",
                  },
                  {
                    label: "Lab Results",
                    icon: "biotech",
                    path: "/patient/lab-results",
                  },
                  {
                    label: "My Vitals",
                    icon: "monitor_heart",
                    path: "/patient/vitals",
                  },
                  {
                    label: "Billing",
                    icon: "payments",
                    path: "/patient/billing",
                  },
                ].map(({ label, icon, path }) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className="flex flex-col items-center gap-1 p-3 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all hover:scale-105 border border-rose-100 group"
                  >
                    <span className="material-symbols-outlined text-[#E05C8A] text-xl group-hover:scale-110 transition-transform">
                      {icon}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-600">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
