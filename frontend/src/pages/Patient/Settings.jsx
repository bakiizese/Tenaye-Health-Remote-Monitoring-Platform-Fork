import { useState, useEffect } from "react";
import PatientLayout from "./components/PatientLayout";
import {
  getMyProfile,
  updateMyProfile,
  updateMyPassword,
} from "../../services/patientService";

function Toast({ message, type = "success", onClose }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-semibold ${type === "success" ? "bg-emerald-600" : "bg-red-600"}`}
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

export default function PatientSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    age: "",
    gender: "Male",
    address: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    getMyProfile().then((result) => {
      if (result.data) {
        const u = result.data;
        setProfile({
          full_name: u.full_name || "",
          email: u.email || "",
          phone: u.phone || "",
          age: u.age || "",
          gender: u.gender || "Male",
          address: u.address || "",
        });
      }
      setLoading(false);
    });
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateMyProfile({
      full_name: profile.full_name,
      phone: profile.phone,
      age: profile.age ? Number(profile.age) : undefined,
      gender: profile.gender,
      address: profile.address,
    });
    setSaving(false);
    if (result.error) {
      showToast(result.error, "error");
    } else {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...stored, full_name: profile.full_name }),
      );
      showToast("Profile updated successfully");
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwordForm.current)
      return showToast("Enter your current password", "error");
    if (passwordForm.newPass.length < 6)
      return showToast("New password must be at least 6 characters", "error");
    if (passwordForm.newPass !== passwordForm.confirm)
      return showToast("Passwords do not match", "error");
    setSaving(true);
    const result = await updateMyPassword(
      passwordForm.current,
      passwordForm.newPass,
    );
    setSaving(false);
    if (result.error) {
      showToast(result.error, "error");
    } else {
      setPasswordForm({ current: "", newPass: "", confirm: "" });
      showToast("Password updated successfully");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "person" },
    { id: "security", label: "Security", icon: "lock" },
  ];

  if (loading) {
    return (
      <PatientLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#E05C8A] border-t-transparent rounded-full animate-spin" />
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout title="Settings">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-6">
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
          {/* Sidebar */}
          <div className="lg:w-56 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#E05C8A] to-[#F4845F] text-white shadow-lg shadow-rose-200"
                      : "text-gray-500 hover:bg-[#fff5f7] hover:text-[#E05C8A]"
                  }`}
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

            <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E05C8A] to-[#F4845F] flex items-center justify-center mx-auto shadow-lg">
                <span className="material-symbols-outlined text-white text-2xl">
                  person
                </span>
              </div>
              <p className="font-black text-gray-800 mt-3">
                {profile.full_name || "—"}
              </p>
              <p className="text-xs text-gray-400">{profile.email}</p>
              <span className="mt-2 inline-block text-xs font-bold px-2.5 py-1 bg-rose-100 text-[#E05C8A] rounded-full">
                Patient
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                <h3 className="font-black text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#E05C8A]">
                    person
                  </span>
                  Personal Information
                </h3>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) =>
                          setProfile({ ...profile, full_name: e.target.value })
                        }
                        className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E05C8A] focus:ring-2 focus:ring-rose-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E05C8A] focus:ring-2 focus:ring-rose-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Age
                      </label>
                      <input
                        type="number"
                        value={profile.age}
                        onChange={(e) =>
                          setProfile({ ...profile, age: e.target.value })
                        }
                        className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E05C8A] focus:ring-2 focus:ring-rose-100 transition-all"
                      />
                    </div>
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
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Address
                      </label>
                      <input
                        type="text"
                        value={profile.address}
                        onChange={(e) =>
                          setProfile({ ...profile, address: e.target.value })
                        }
                        className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E05C8A] focus:ring-2 focus:ring-rose-100 transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#E05C8A] to-[#F4845F] text-white shadow-lg shadow-rose-200 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {saving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">
                          save
                        </span>{" "}
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                <h3 className="font-black text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#E05C8A]">
                    lock
                  </span>
                  Change Password
                </h3>
                <form
                  onSubmit={handlePasswordSave}
                  className="space-y-4 max-w-md"
                >
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
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#E05C8A] to-[#F4845F] text-white shadow-lg shadow-rose-200 hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                        Updating...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">
                          lock_reset
                        </span>{" "}
                        Update Password
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
