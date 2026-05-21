import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: "grid_view" },
  { path: "/admin/users", label: "Users", icon: "group" },
  { path: "/admin/doctors", label: "Doctors", icon: "medical_services" },
  {
    path: "/admin/appointments",
    label: "Appointments",
    icon: "calendar_today",
  },
  {
    path: "/admin/medical-records",
    label: "Medical Records",
    icon: "folder_shared",
  },
  { path: "/admin/blogs", label: "Blog Management", icon: "article" },
  { path: "/admin/payments", label: "Payments", icon: "payments" },
  {
    path: "/admin/notifications",
    label: "Notifications",
    icon: "notifications",
  },
  { path: "/admin/settings", label: "Settings", icon: "settings" },
];

// Mock notifications for the dropdown
const mockNotifications = [
  {
    id: 1,
    title: "New Doctor Application",
    message: "Dr. Sarah Johnson applied for verification",
    time: "5 mins ago",
    type: "doctor",
    unread: true,
  },
  {
    id: 2,
    title: "Critical Vital Alert",
    message: "Patient Bereket - SpO2: 88%",
    time: "12 mins ago",
    type: "alert",
    unread: true,
  },
  {
    id: 3,
    title: "Payment Received",
    message: "1,200 ETB from Alem Tadesse",
    time: "1 hour ago",
    type: "payment",
    unread: false,
  },
  {
    id: 4,
    title: "Appointment Cancelled",
    message: "Appointment #APT-1234 was cancelled",
    time: "2 hours ago",
    type: "appointment",
    unread: false,
  },
];

export default function AdminLayout({ children, title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
    setShowNotifications(false);
  }, [location.pathname]);

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => setSidebarOpen(false);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page with query parameter
      navigate(`/admin/search?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(""); // Clear search after submitting
    }
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="flex min-h-screen bg-[#fff7fa]">
      {/* ── Overlay (mobile only) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-72 bg-white shadow-lg z-50
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo + close button (close only visible on mobile) */}
        <div className="px-6 py-6 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-[#7B2D8B] rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">
              favorite
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#7B2D8B]">Tenaye Health</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              Admin Console
            </p>
          </div>
          {/* Close button — mobile only */}
          <button
            className="lg:hidden p-1 rounded-lg hover:bg-purple-50 text-gray-500 transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable Nav */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl mx-2 transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#7B2D8B] text-white shadow-lg shadow-purple-200"
                      : "text-gray-500 hover:bg-purple-50 hover:translate-x-1"
                  }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Profile — always visible at bottom */}
        <div className="shrink-0 mx-4 mb-6 p-4 bg-[#fdf0f9] rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7B2D8B] flex items-center justify-center text-white font-bold text-sm shrink-0">
            A
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-800 truncate">
              Admin User
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              System Administrator
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-xl bg-white text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-72 w-full">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl shadow-sm flex items-center h-16 px-4 md:px-8 gap-4">
          {/* Burger button */}
          <button
            className="p-2 rounded-xl hover:bg-purple-50 text-gray-600 transition-colors lg:hidden shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          <h2 className="text-base md:text-lg font-bold text-[#7B2D8B] flex-1 truncate">
            {title}
          </h2>

          <div className="flex items-center gap-2 md:gap-4">
            <Link
              to="/doctor-apply"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-[#7B2D8B]/20 bg-[#fdf0f9] text-[#7B2D8B] text-sm font-semibold hover:bg-[#f7edf5] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                medical_services
              </span>
              Apply for Doctor
            </Link>

            {/* Search — hidden on small screens */}
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                search
              </span>
              <input
                className="pl-10 pr-4 py-2 bg-[#fdf0f9] border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 w-48 lg:w-56"
                placeholder="Search..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Notification bell with dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full hover:bg-purple-50 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-gray-500">
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 z-40 md:hidden"
                    onClick={() => setShowNotifications(false)}
                  />

                  <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800">
                          Notifications
                        </h3>
                        <p className="text-xs text-gray-400">
                          {unreadCount} unread
                        </p>
                      </div>
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[#7B2D8B] font-semibold hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <span className="material-symbols-outlined text-5xl text-gray-200 block mb-2">
                            notifications_off
                          </span>
                          <p className="text-sm text-gray-400">
                            No notifications
                          </p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markAsRead(notif.id);
                              setShowNotifications(false);
                              // Navigate based on notification type
                              if (notif.type === "doctor")
                                navigate("/admin/doctors");
                              else if (notif.type === "alert")
                                navigate("/admin/medical-records");
                              else if (notif.type === "payment")
                                navigate("/admin/payments");
                              else if (notif.type === "appointment")
                                navigate("/admin/appointments");
                            }}
                            className={`p-4 border-b border-gray-50 hover:bg-purple-50/50 cursor-pointer transition-colors ${
                              notif.unread ? "bg-purple-50/30" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                  notif.type === "alert"
                                    ? "bg-red-100"
                                    : notif.type === "doctor"
                                      ? "bg-purple-100"
                                      : notif.type === "payment"
                                        ? "bg-emerald-100"
                                        : "bg-blue-100"
                                }`}
                              >
                                <span
                                  className={`material-symbols-outlined text-sm ${
                                    notif.type === "alert"
                                      ? "text-red-600"
                                      : notif.type === "doctor"
                                        ? "text-purple-600"
                                        : notif.type === "payment"
                                          ? "text-emerald-600"
                                          : "text-blue-600"
                                  }`}
                                >
                                  {notif.type === "alert"
                                    ? "emergency"
                                    : notif.type === "doctor"
                                      ? "medical_services"
                                      : notif.type === "payment"
                                        ? "payments"
                                        : "calendar_today"}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {notif.time}
                                </p>
                              </div>
                              {notif.unread && (
                                <span className="w-2 h-2 bg-[#7B2D8B] rounded-full shrink-0 mt-2"></span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate("/admin/notifications");
                        }}
                        className="w-full py-2 text-sm font-semibold text-[#7B2D8B] hover:bg-purple-50 rounded-xl transition-colors"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
