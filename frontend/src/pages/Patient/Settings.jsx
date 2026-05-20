import { useState } from "react";
import PatientLayout from "./components/PatientLayout";
import { mockPatientProfile } from "./data/mockData";

export default function PatientSettings() {
  const [profile, setProfile] = useState(mockPatientProfile);
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [notifications, setNotifications] = useState({
    appointmentReminders: true,
    labResults: true,
    prescriptionExpiry: true,
    paymentConfirmations: true,
    healthTips: false,
    promotions: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "person" },
    { id: "security", label: "Security", icon: "lock" },
    { id: "notifications", label: "Notifications", icon: "notifications" },
    { id: "privacy", label: "Privacy", icon: "shield" },
  ];

  return (
    <PatientLayout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-black text-[#E05C8A] flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">settings</span>
            Settings
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Manage your account and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar tabs */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                    ${activeTab === tab.id ? "bg-gradient-to-r from-[#E05C8A] to-[#F4845F] text-white shadow-lg shadow-rose-200" : "text-gray-500 hover:bg-[#fff5f7] hover:text-[#E05C8A]"}`}
                >
                  <span
                    className={`material-symbols-outlined text-xl ${activeTab === tab.id ? "text-white" : "text-gray-400"}`}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Profile card */}
            <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E05C8A] to-[#F4845F] flex items-center justify-center mx-auto shadow-lg">
                <span className="material-symbols-outlined text-white text-2xl">
                  person
                </span>
              </div>
              <p className="font-black text-gray-800 mt-3">{profile.name}</p>
              <p className="text-xs text-gray-400">{profile.email}</p>
              <span className="mt-2 inline-block text-xs font-bold px-2.5 py-1 bg-rose-100 text-[#E05C8A] rounded-full">
                Patient
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                <h3 className="font-black text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#E05C8A]">
                    person
                  </span>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name", key: "name", type: "text" },
                    { label: "Email Address", key: "email", type: "email" },
                    { label: "Phone Number", key: "phone", type: "tel" },
                    { label: "Age", key: "age", type: "number" },
                    { label: "Address", key: "address", type: "text" },
                  ].map(({ label, key, type }) => (
                    <div
                      key={key}
                      className={key === "address" ? "sm:col-span-2" : ""}
                    >
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {label}
                      </label>
                      <input
                        type={type}
                        value={profile[key]}
                        onChange={(e) =>
                          setProfile({ ...profile, [key]: e.target.value })
                        }
                        className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E05C8A] focus:ring-2 focus:ring-rose-100 transition-all"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Gender
                    </label>
                    <select
                      value={profile.gender}
                      onChange={(e) =>
                        setProfile({ ...profile, gender: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E05C8A] bg-white"
                    >
                      {["Male", "Female"].map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Blood Type
                    </label>
                    <select
                      value={profile.bloodType}
                      onChange={(e) =>
                        setProfile({ ...profile, bloodType: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E05C8A] bg-white"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                        (b) => (
                          <option key={b}>{b}</option>
                        ),
                      )}
                    </select>
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Known Allergies
                  </label>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {profile.allergies.map((a) => (
                      <span
                        key={a}
                        className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-red-100 text-red-700 rounded-full"
                      >
                        {a}
                        <button
                          onClick={() =>
                            setProfile({
                              ...profile,
                              allergies: profile.allergies.filter(
                                (x) => x !== a,
                              ),
                            })
                          }
                          className="hover:text-red-900"
                        >
                          <span className="material-symbols-outlined text-sm">
                            close
                          </span>
                        </button>
                      </span>
                    ))}
                    <span className="text-xs text-gray-400 italic self-center">
                      Contact doctor to update allergies
                    </span>
                  </div>
                </div>

                {/* Emergency contact */}
                <div className="p-4 bg-[#fff5f7]/50 rounded-xl border border-rose-100">
                  <h4 className="text-sm font-black text-gray-700 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#E05C8A] text-lg">
                      emergency
                    </span>
                    Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Name", key: "name" },
                      { label: "Relation", key: "relation" },
                      { label: "Phone", key: "phone" },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label className="text-xs font-bold text-gray-400">
                          {label}
                        </label>
                        <input
                          value={profile.emergencyContact[key]}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              emergencyContact: {
                                ...profile.emergencyContact,
                                [key]: e.target.value,
                              },
                            })
                          }
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E05C8A] focus:ring-2 focus:ring-rose-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${saved ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-gradient-to-r from-[#E05C8A] to-[#F4845F] text-white shadow-rose-200 hover:scale-105"}`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {saved ? "check_circle" : "save"}
                  </span>
                  {saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            )}

            {/* Security tab */}
            {activeTab === "security" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                <h3 className="font-black text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#E05C8A]">
                    lock
                  </span>
                  Change Password
                </h3>
                <div className="space-y-4 max-w-md">
                  {[
                    { label: "Current Password", key: "current" },
                    { label: "New Password", key: "newPass" },
                    { label: "Confirm New Password", key: "confirm" },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {label}
                      </label>
                      <input
                        type="password"
                        value={passwordForm[key]}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            [key]: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E05C8A] focus:ring-2 focus:ring-rose-100"
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${saved ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-gradient-to-r from-[#E05C8A] to-[#F4845F] text-white shadow-rose-200 hover:scale-105"}`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {saved ? "check_circle" : "lock_reset"}
                    </span>
                    {saved ? "Updated!" : "Update Password"}
                  </button>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <h4 className="text-sm font-black text-amber-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">
                      security
                    </span>
                    Two-Factor Authentication
                  </h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Add an extra layer of security to your account.
                  </p>
                  <button className="mt-3 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-all">
                    Enable 2FA
                  </button>
                </div>
              </div>
            )}

            {/* Notifications tab */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h3 className="font-black text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#E05C8A]">
                    notifications
                  </span>
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  {Object.entries(notifications).map(([key, value]) => {
                    const labels = {
                      appointmentReminders: {
                        label: "Appointment Reminders",
                        desc: "Get notified before your appointments",
                        icon: "calendar_today",
                      },
                      labResults: {
                        label: "Lab Results",
                        desc: "Notify when lab results are ready",
                        icon: "biotech",
                      },
                      prescriptionExpiry: {
                        label: "Prescription Expiry",
                        desc: "Alert when prescriptions are about to expire",
                        icon: "medication",
                      },
                      paymentConfirmations: {
                        label: "Payment Confirmations",
                        desc: "Confirm successful payments",
                        icon: "payments",
                      },
                      healthTips: {
                        label: "Health Tips",
                        desc: "Receive weekly health tips from doctors",
                        icon: "tips_and_updates",
                      },
                      promotions: {
                        label: "Promotions",
                        desc: "Special offers and discounts",
                        icon: "local_offer",
                      },
                    };
                    const { label, desc, icon } = labels[key];
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-[#fff5f7]/30 rounded-xl border border-rose-50 hover:border-rose-200 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fff5f7] to-rose-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#E05C8A] text-lg">
                              {icon}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {label}
                            </p>
                            <p className="text-xs text-gray-400">{desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setNotifications({
                              ...notifications,
                              [key]: !value,
                            })
                          }
                          className={`relative w-12 h-6 rounded-full transition-all duration-300 ${value ? "bg-gradient-to-r from-[#E05C8A] to-[#F4845F]" : "bg-gray-200"}`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${value ? "left-6" : "left-0.5"}`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${saved ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-gradient-to-r from-[#E05C8A] to-[#F4845F] text-white shadow-rose-200 hover:scale-105"}`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {saved ? "check_circle" : "save"}
                  </span>
                  {saved ? "Saved!" : "Save Preferences"}
                </button>
              </div>
            )}

            {/* Privacy tab */}
            {activeTab === "privacy" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h3 className="font-black text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#E05C8A]">
                    shield
                  </span>
                  Privacy & Data
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      label: "Share Medical Records with Doctors",
                      desc: "Allow assigned doctors to view your full medical history",
                      enabled: true,
                    },
                    {
                      label: "Allow Anonymous Data for Research",
                      desc: "Help improve healthcare by sharing anonymized data",
                      enabled: false,
                    },
                    {
                      label: "Profile Visibility",
                      desc: "Allow doctors to see your profile before appointments",
                      enabled: true,
                    },
                  ].map(({ label, desc, enabled }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between p-4 bg-[#fff5f7]/30 rounded-xl border border-rose-50"
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {label}
                        </p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                      <button
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${enabled ? "bg-gradient-to-r from-[#E05C8A] to-[#F4845F]" : "bg-gray-200"}`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${enabled ? "left-6" : "left-0.5"}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100 mt-4">
                  <h4 className="text-sm font-black text-red-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600">
                      warning
                    </span>
                    Danger Zone
                  </h4>
                  <p className="text-xs text-red-600 mt-1">
                    Permanently delete your account and all associated data.
                  </p>
                  <button className="mt-3 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
