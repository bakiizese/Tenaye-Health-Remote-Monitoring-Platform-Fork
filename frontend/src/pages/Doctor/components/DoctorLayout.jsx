import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  getDoctorProfile,
  subscribeDoctorProfile,
  updateDoctorProfile,
} from "../store/doctorProfileStore";
import { getDoctorProfile as getDoctorProfileAPI } from "../../../services/doctorService";

// Toast component for real-time notifications
function Toast({ message, type = "info", onClose, action, actionLabel }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    info: "bg-blue-600",
    success: "bg-emerald-600",
    warning: "bg-amber-500",
    error: "bg-red-600",
  };

  const icons = {
    info: "info",
    success: "check_circle",
    warning: "warning",
    error: "error",
  };

  return (
    <div className="fixed top-20 right-4 z-[100] max-w-sm">
      <div
        className={`${colors[type]} text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-slide-in`}
      >
        <span className="material-symbols-outlined text-2xl shrink-0">
          {icons[type]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">{message}</p>
          {action && (
            <button
              onClick={action}
              className="mt-2 px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors"
            >
              {actionLabel || "View"}
            </button>
          )}
        </div>
        <button onClick={onClose} className="opacity-70 hover:opacity-100">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  );
}

const notifRoutes = {
  appointment: "/doctor/appointments",
  alert: "/doctor/vitals",
  lab: "/doctor/lab-orders",
  payment: "/doctor/earnings",
};
const navItems = [
  { path: "/doctor", label: "Dashboard", icon: "grid_view" },
  {
    path: "/doctor/appointments",
    label: "Appointments",
    icon: "calendar_today",
  },
  { path: "/doctor/patients", label: "My Patients", icon: "group" },
  { path: "/doctor/chat", label: "Messages", icon: "forum" },
  { path: "/doctor/prescriptions", label: "Prescriptions", icon: "medication" },
  { path: "/doctor/lab-orders", label: "Lab Orders", icon: "biotech" },
  { path: "/doctor/vitals", label: "Vital Alerts", icon: "monitor_heart" },
  { path: "/doctor/blogs", label: "My Blogs", icon: "article" },
  { path: "/doctor/earnings", label: "Earnings", icon: "payments" },
  { path: "/doctor/settings", label: "Settings", icon: "settings" },
];
const mockNotifs = [
  {
    id: 1,
    title: "New Appointment",
    message: "Bereket Tadesse booked for 10:00 AM",
    time: "5 mins ago",
    type: "appointment",
    unread: true,
  },
  {
    id: 2,
    title: "Critical Vital Alert",
    message: "Patient Sara — SpO2: 88%",
    time: "12 mins ago",
    type: "alert",
    unread: true,
  },
  {
    id: 3,
    title: "Lab Result Ready",
    message: "CBC results for Yonas Bekele are ready",
    time: "1 hour ago",
    type: "lab",
    unread: false,
  },
  {
    id: 4,
    title: "Payment Received",
    message: "600 ETB consultation fee received",
    time: "2 hours ago",
    type: "payment",
    unread: false,
  },
];
const nStyle = {
  alert: { icon: "emergency", bg: "bg-red-100", cl: "text-red-600" },
  appointment: {
    icon: "calendar_today",
    bg: "bg-teal-100",
    cl: "text-teal-600",
  },
  payment: { icon: "payments", bg: "bg-emerald-100", cl: "text-emerald-600" },
  lab: { icon: "biotech", bg: "bg-cyan-100", cl: "text-cyan-600" },
};

export default function DoctorLayout({
  children,
  title,
  activeCall,
  onStartCall,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState(mockNotifs);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(getDoctorProfile());
  const [toast, setToast] = useState(null);
  const socketRef = useRef(null);

  // Logout handler
  const handleLogout = () => {
    // Remove auth tokens (customize as needed)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login
    navigate("/auth/login");
  };

  useEffect(() => {
    const u = subscribeDoctorProfile(setProfile);
    // Load real profile from API and update store
    getDoctorProfileAPI().then((result) => {
      if (result.data) {
        const doctor = result.data;
        const updated = {
          name: doctor.user?.full_name
            ? `Dr. ${doctor.user.full_name}`
            : profile.name,
          specialty: doctor.specialty || profile.specialty,
          email: doctor.user?.email || profile.email,
          phone: doctor.user?.phone || profile.phone,
          hospital: doctor.hospital || profile.hospital,
          consultationFee: doctor.consultation_fee
            ? `${doctor.consultation_fee} ETB`
            : profile.consultationFee,
          licenseNo: doctor.license_no || profile.licenseNo,
          bio: doctor.bio || profile.bio,
          experience: doctor.experience_years || profile.experience,
        };
        updateDoctorProfile(updated);
      }
    });
    return u;
  }, []);

  // Initialize Socket.io connection for real-time notifications
  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
    socketRef.current = window.io(socketUrl);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Handle Start Call button click - notify patient
  const handleStartCall = (appointmentId, patientId, patientName) => {
    if (socketRef.current && patientId) {
      socketRef.current.emit("call-started", {
        patientId,
        doctorId: localStorage.getItem("userId"),
        doctorName: profile.name,
        appointmentId,
        timestamp: new Date().toISOString(),
      });

      setToast({
        message: `Notifying ${patientName} that you've started the call...`,
        type: "success",
      });

      // Also call the prop callback if provided
      if (onStartCall) {
        onStartCall(appointmentId);
      }
    }
  };

  const unread = notifs.filter((n) => n.unread).length;
  const markRead = (id) =>
    setNotifs((p) => p.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  const markAll = () =>
    setNotifs((p) => p.map((n) => ({ ...n, unread: false })));

  // Expose handleStartCall via window for global access from appointment pages
  useEffect(() => {
    window.doctorStartCall = handleStartCall;
    return () => {
      delete window.doctorStartCall;
    };
  }, [profile.name]);

  const isActive = (path) =>
    path === "/doctor"
      ? location.pathname === "/doctor"
      : location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-[#f0fafa]">
      {/* Real-time toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          action={toast.action}
          actionLabel={toast.actionLabel}
          onClose={() => setToast(null)}
        />
      )}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — dark teal gradient */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{
          background:
            "linear-gradient(160deg,#083d40 0%,#0D7377 60%,#0f8a7a 100%)",
        }}
      >
        {/* Logo */}
        <div className="px-6 py-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
            <span className="material-symbols-outlined text-white text-xl">
              stethoscope
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-white tracking-tight">
              Tenaye Health
            </h1>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">
              Doctor Portal
            </p>
          </div>
          <button
            className="lg:hidden p-1 rounded-lg hover:bg-white/10 text-white/60"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive(item.path) ? "bg-white/20 text-white border border-white/20 shadow-sm" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
            >
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
              {isActive(item.path) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4ecca3] animate-pulse" />
              )}
            </Link>
          ))}
        </nav>

        {/* Profile card */}
        <button
          onClick={() => setShowProfile(true)}
          className="mx-4 mb-5 p-4 bg-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/20 transition-colors text-left border border-white/10"
        >
          <div className="w-10 h-10 rounded-full bg-[#4ecca3] flex items-center justify-center text-[#083d40] font-black text-sm shrink-0">
            {profile.name
              ? profile.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "DR"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="font-bold text-sm text-white truncate">
              {profile.name}
            </p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider truncate">
              {profile.specialty}
            </p>
          </div>
          <span className="material-symbols-outlined text-white/40 text-base shrink-0">
            open_in_new
          </span>
        </button>
      </aside>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div
              className="p-6 text-white"
              style={{
                background: "linear-gradient(135deg,#083d40,#0D7377,#14A085)",
              }}
            >
              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
              >
                <span className="material-symbols-outlined text-white text-lg">
                  close
                </span>
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-black">
                  {profile.name.split(" ")[1]?.[0] ?? "D"}
                </div>
                <div>
                  <h3 className="text-xl font-black">{profile.name}</h3>
                  <p className="text-sm opacity-80">{profile.specialty}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {[
                { label: "Email", value: profile.email, icon: "mail" },
                { label: "Phone", value: profile.phone, icon: "phone" },
                {
                  label: "Hospital",
                  value: profile.hospital,
                  icon: "local_hospital",
                },
                {
                  label: "Experience",
                  value: profile.experience,
                  icon: "workspace_premium",
                },
                {
                  label: "Fee",
                  value: profile.consultationFee,
                  icon: "payments",
                },
                { label: "License", value: profile.licenseNo, icon: "badge" },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0"
                >
                  <span className="material-symbols-outlined text-[#0D7377] text-lg mt-0.5 shrink-0">
                    {icon}
                  </span>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
              <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
                <p className="text-xs font-bold text-[#0D7377] uppercase tracking-wider mb-2">
                  About
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowProfile(false)}
                className="w-full py-3 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                style={{
                  background: "linear-gradient(135deg,#0D7377,#14A085)",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-72 w-full">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-teal-100 shadow-sm flex items-center h-16 px-4 md:px-8 gap-4">
          <button
            className="p-2 rounded-xl hover:bg-teal-50 text-gray-600 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <div className="flex-1">
            <h2 className="text-base md:text-lg font-black text-[#0D7377] truncate">
              {title}
            </h2>
            <p className="text-xs text-gray-400 hidden sm:block">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  navigate(
                    `/doctor/search?q=${encodeURIComponent(searchQuery)}`,
                  );
                  setSearchQuery("");
                }
              }}
              className="relative hidden md:block"
            >
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                search
              </span>
              <input
                className="pl-10 pr-4 py-2 bg-teal-50 border border-teal-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 w-48 lg:w-56 placeholder:text-gray-400"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2.5 rounded-xl hover:bg-teal-50 transition-colors group"
              >
                <span className="material-symbols-outlined text-gray-500 group-hover:text-[#0D7377] transition-colors">
                  notifications
                </span>
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                    {unread}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-teal-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-teal-50">
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">
                        Notifications
                      </h4>
                      <p className="text-xs text-gray-400">{unread} unread</p>
                    </div>
                    <button
                      onClick={markAll}
                      className="text-xs text-[#0D7377] font-bold hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {notifs.map((n) => {
                      const s = nStyle[n.type] || {
                        icon: "notifications",
                        bg: "bg-gray-100",
                        cl: "text-gray-500",
                      };
                      return (
                        <button
                          key={n.id}
                          onClick={() => {
                            markRead(n.id);
                            setShowNotifs(false);
                            navigate(notifRoutes[n.type] ?? "/doctor");
                          }}
                          className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-teal-50/50 transition-colors text-left ${n.unread ? "bg-teal-50/30" : ""}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${s.bg}`}
                          >
                            <span
                              className={`material-symbols-outlined text-sm ${s.cl}`}
                            >
                              {s.icon}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-bold ${n.unread ? "text-[#0D7377]" : "text-gray-800"}`}
                            >
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {n.time}
                            </p>
                          </div>
                          {n.unread && (
                            <span className="w-2 h-2 rounded-full bg-[#0D7377] shrink-0 mt-1.5 animate-pulse" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs border border-red-100 hover:bg-red-100 transition-all mr-1"
              title="Logout"
            >
              Logout
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#083d40] font-black text-sm shadow-md hover:scale-110 transition-transform"
              style={{ background: "linear-gradient(135deg,#4ecca3,#14A085)" }}
            >
              {profile.name
                ? profile.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "DR"}
            </button>
          </div>
        </header>
        <div className="p-4 md:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
