import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorLayout from "./components/DoctorLayout";
import {
  getDoctorProfile as getDoctorProfileAPI,
  updateDoctorProfile as updateDoctorProfileAPI,
} from "../../services/doctorService";
import {
  getDoctorProfile,
  updateDoctorProfile,
} from "./store/doctorProfileStore";

function Toast({ message, type = "success", onClose }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-100 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-semibold
      ${type === "success" ? "bg-emerald-600" : "bg-red-600"}`}
    >
      <span className="material-symbols-outlined text-lg">
        {type === "success" ? "check_circle" : "cancel"}
      </span>
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIME_SLOTS = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
];

export default function DoctorSettings() {
  const navigate = useNavigate();
  const stored = getDoctorProfile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: stored.name,
    email: stored.email,
    phone: stored.phone,
    specialty: stored.specialty,
    subSpecialty: stored.subSpecialty,
    hospital: stored.hospital,
    experience: stored.experience,
    education: stored.education,
    consultationFee: stored.consultationFee?.replace(" ETB", "") || "",
    availability: [], // Array of { day, slots: [] }
    licenseNo: stored.licenseNo,
    bio: stored.bio,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [notifications, setNotifications] = useState({
    appointments: true,
    vitals: true,
    payments: false,
    messages: true,
  });

  const [toast, setToast] = useState(null);
  const [activeDay, setActiveDay] = useState("Monday");

  // Load doctor profile from API on mount
  useEffect(() => {
    const loadProfile = async () => {
      const result = await getDoctorProfileAPI();
      if (result.data) {
        const doctor = result.data;
        setProfile({
          name: doctor.user?.full_name || stored.name,
          email: doctor.user?.email || stored.email,
          phone: doctor.user?.phone || stored.phone,
          specialty: doctor.specialty || stored.specialty,
          subSpecialty: doctor.sub_specialty || stored.subSpecialty,
          hospital: doctor.hospital || stored.hospital,
          experience: doctor.experience_years || stored.experience,
          education: doctor.education || stored.education,
          consultationFee:
            doctor.consultation_fee?.toString() ||
            stored.consultationFee?.replace(" ETB", "") ||
            "",
          availability: doctor.availability || [],
          licenseNo: doctor.license_no || stored.licenseNo,
          bio: doctor.bio || stored.bio,
        });
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle a time slot for a specific day
  const toggleSlot = (day, slot) => {
    setProfile((prev) => {
      const existingDay = prev.availability.find((a) => a.day === day);
      let newAvailability;

      if (existingDay) {
        const hasSlot = existingDay.slots.includes(slot);
        const newSlots = hasSlot
          ? existingDay.slots.filter((s) => s !== slot)
          : [...existingDay.slots, slot].sort();

        if (newSlots.length === 0) {
          // Remove day if no slots
          newAvailability = prev.availability.filter((a) => a.day !== day);
        } else {
          newAvailability = prev.availability.map((a) =>
            a.day === day ? { ...a, slots: newSlots } : a,
          );
        }
      } else {
        newAvailability = [...prev.availability, { day, slots: [slot] }];
      }

      return { ...prev, availability: newAvailability };
    });
  };

  // Check if a slot is selected for a day
  const isSlotSelected = (day, slot) => {
    const daySchedule = profile.availability.find((a) => a.day === day);
    return daySchedule?.slots.includes(slot) || false;
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const result = await updateDoctorProfileAPI({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      specialty: profile.specialty,
      subSpecialty: profile.subSpecialty,
      hospital: profile.hospital,
      experience: profile.experience,
      education: profile.education,
      consultation_fee: parseInt(profile.consultationFee) || 0,
      availability: profile.availability,
      license_no: profile.licenseNo,
      bio: profile.bio,
    });

    setSaving(false);

    if (result.error) {
      showToast(result.error, "error");
    } else {
      // Update store (persists to localStorage.doctorProfile)
      updateDoctorProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        specialty: profile.specialty,
        subSpecialty: profile.subSpecialty,
        hospital: profile.hospital,
        experience: profile.experience,
        education: profile.education,
        consultationFee: `${profile.consultationFee} ETB`,
        availability: profile.availability,
        licenseNo: profile.licenseNo,
        bio: profile.bio,
      });
      // Also update localStorage.user so name persists after re-login
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...stored, full_name: profile.name }),
        );
      } catch {}
      showToast("Profile updated successfully");
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwords.current) {
      showToast("Enter your current password", "error");
      return;
    }
    if (passwords.newPass.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showToast("Passwords do not match", "error");
      return;
    }
    setSaving(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/auth/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPasswords({ current: "", newPass: "", confirm: "" });
      showToast("Password changed successfully");
    } catch (err) {
      showToast(err.message || "Failed to update password", "error");
    } finally {
      setSaving(false);
    }
  };

  const notificationRoutes = {
    appointments: "/doctor/appointments",
    vitals: "/doctor/vitals",
    payments: "/doctor/earnings",
    messages: "/doctor/appointments",
  };

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (loading) {
    return (
      <DoctorLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#0D7377] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout title="Settings">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-6 max-w-2xl">
        {/* Live preview card */}
        <div className="bg-gradient-to-br from-[#0D7377] to-[#14A085] rounded-2xl p-5 text-white flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-black shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-black truncate">{profile.name || "—"}</p>
            <p className="text-sm opacity-80 truncate">
              {profile.specialty || "—"}
              {profile.subSpecialty ? ` · ${profile.subSpecialty}` : ""}
            </p>
            <p className="text-xs opacity-60 mt-0.5 truncate">
              {profile.hospital || "—"}
            </p>
          </div>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 mb-5">
            Profile Information
          </h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "name", label: "Full Name" },
                { key: "email", label: "Email", type: "email" },
                { key: "phone", label: "Phone" },
                { key: "specialty", label: "Specialty" },
                { key: "subSpecialty", label: "Sub-Specialty" },
                { key: "hospital", label: "Hospital" },
                { key: "experience", label: "Experience" },
                { key: "education", label: "Education" },
                { key: "consultationFee", label: "Consultation Fee (ETB)" },
                { key: "licenseNo", label: "License No." },
              ].map(({ key, label, type = "text" }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={profile[key]}
                    onChange={(e) =>
                      setProfile({ ...profile, [key]: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/20"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                Bio
              </label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/20 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#0D7377] text-white rounded-xl font-bold text-sm hover:bg-[#0a5c60] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Availability Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 mb-1">
            Availability Schedule
          </h2>
          <p className="text-xs text-gray-400 mb-5">
            Select the days and time slots when you're available for
            appointments
          </p>

          {/* Day tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {DAYS.map((day) => {
              const hasSlots = profile.availability.some(
                (a) => a.day === day && a.slots.length > 0,
              );
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeDay === day
                      ? "bg-[#0D7377] text-white"
                      : hasSlots
                        ? "bg-[#0D7377]/10 text-[#0D7377] border border-[#0D7377]/20"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  {day.slice(0, 3)}
                  {hasSlots && <span className="ml-1">●</span>}
                </button>
              );
            })}
          </div>

          {/* Time slots grid */}
          <div className="border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-700">
                {activeDay}
              </span>
              <span className="text-xs text-gray-400">
                {profile.availability.find((a) => a.day === activeDay)?.slots
                  .length || 0}{" "}
                slots selected
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
              {TIME_SLOTS.map((slot) => {
                const selected = isSlotSelected(activeDay, slot);
                return (
                  <button
                    key={slot}
                    onClick={() => toggleSlot(activeDay, slot)}
                    className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                      selected
                        ? "bg-[#0D7377] text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Current Schedule Summary:
            </p>
            {profile.availability.length === 0 ? (
              <p className="text-xs text-gray-400">
                No availability set. Patients won't be able to book
                appointments.
              </p>
            ) : (
              <div className="space-y-1">
                {profile.availability
                  .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day))
                  .map((a) => (
                    <div
                      key={a.day}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="font-medium text-gray-700 w-20">
                        {a.day}:
                      </span>
                      <span className="text-gray-600">
                        {a.slots.join(", ")}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 mb-5">
            Change Password
          </h2>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            {[
              { key: "current", label: "Current Password" },
              { key: "newPass", label: "New Password" },
              { key: "confirm", label: "Confirm New Password" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  {label}
                </label>
                <input
                  type="password"
                  value={passwords[key]}
                  onChange={(e) =>
                    setPasswords({ ...passwords, [key]: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/20"
                />
              </div>
            ))}
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0D7377] text-white rounded-xl font-bold text-sm hover:bg-[#0a5c60] transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 mb-1">
            Notification Preferences
          </h2>
          <p className="text-xs text-gray-400 mb-5">
            Click a row to navigate to that section
          </p>
          <div className="space-y-1">
            {[
              {
                key: "appointments",
                label: "New Appointments",
                desc: "Get notified when a patient books",
                icon: "calendar_today",
              },
              {
                key: "vitals",
                label: "Vital Alerts",
                desc: "Critical patient vital notifications",
                icon: "monitor_heart",
              },
              {
                key: "payments",
                label: "Payment Received",
                desc: "Notify on successful payments",
                icon: "payments",
              },
              {
                key: "messages",
                label: "New Messages",
                desc: "Chat and consultation messages",
                icon: "chat",
              },
            ].map(({ key, label, desc, icon }) => (
              <div
                key={key}
                className="flex items-center gap-4 py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => navigate(notificationRoutes[key])}
              >
                <div className="w-9 h-9 rounded-xl bg-[#f0fafa] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#0D7377] text-lg">
                    {icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-[#0D7377] transition-colors">
                    {label}
                  </p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotifications((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }));
                  }}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                    notifications[key] ? "bg-[#0D7377]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      notifications[key] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="material-symbols-outlined text-gray-300 text-base group-hover:text-[#0D7377] transition-colors">
                  chevron_right
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
