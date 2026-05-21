import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import {
  getPatients,
  getDoctors,
  getAllAppointments,
  getAllPayments,
} from "../../services/adminService";

export default function AdminSearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("search") || "";
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({
    users: [],
    doctors: [],
    appointments: [],
    payments: [],
  });

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const searchLower = query.toLowerCase();

      // Fetch all data
      const [usersRes, doctorsRes, appointmentsRes, paymentsRes] =
        await Promise.all([
          getPatients(),
          getDoctors(),
          getAllAppointments(),
          getAllPayments(),
        ]);

      // Filter results
      const filteredUsers = (usersRes.data || []).filter(
        (u) =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower),
      );

      const filteredDoctors = (doctorsRes.data || []).filter(
        (d) =>
          d.name.toLowerCase().includes(searchLower) ||
          d.specialty.toLowerCase().includes(searchLower),
      );

      const filteredAppointments = (appointmentsRes.data || []).filter(
        (a) =>
          a.patient.toLowerCase().includes(searchLower) ||
          a.doctor.toLowerCase().includes(searchLower) ||
          a.id.toLowerCase().includes(searchLower),
      );

      const filteredPayments = (paymentsRes.data || []).filter(
        (p) =>
          p.patient.toLowerCase().includes(searchLower) ||
          p.doctor.toLowerCase().includes(searchLower) ||
          p.id.toLowerCase().includes(searchLower),
      );

      setResults({
        users: filteredUsers,
        doctors: filteredDoctors,
        appointments: filteredAppointments,
        payments: filteredPayments,
      });
      setLoading(false);
    };

    search();
  }, [query]);

  const totalResults =
    results.users.length +
    results.doctors.length +
    results.appointments.length +
    results.payments.length;

  const filters = [
    { id: "all", label: "All", count: totalResults },
    { id: "users", label: "Patients", count: results.users.length },
    { id: "doctors", label: "Doctors", count: results.doctors.length },
    {
      id: "appointments",
      label: "Appointments",
      count: results.appointments.length,
    },
    { id: "payments", label: "Payments", count: results.payments.length },
  ];

  const showUsers = activeFilter === "all" || activeFilter === "users";
  const showDoctors = activeFilter === "all" || activeFilter === "doctors";
  const showAppointments =
    activeFilter === "all" || activeFilter === "appointments";
  const showPayments = activeFilter === "all" || activeFilter === "payments";

  if (loading) {
    return (
      <AdminLayout title="Search Results">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#7B2D8B] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Search Results">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-[#7B2D8B]">Search Results</h2>
        <p className="text-gray-400 mt-1">
          {totalResults} results for "
          <span className="font-semibold text-gray-600">{query}</span>"
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeFilter === f.id
                ? "bg-[#7B2D8B] text-white shadow-lg shadow-purple-200"
                : "bg-white border border-gray-200 text-gray-600 hover:border-[#7B2D8B] hover:text-[#7B2D8B]"
            }`}
          >
            {f.label}
            <span
              className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeFilter === f.id ? "bg-white/20" : "bg-gray-100"}`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {totalResults === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-200 block mb-4">
            search_off
          </span>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No results found
          </h3>
          <p className="text-gray-400">Try searching with different keywords</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Users Results */}
          {showUsers && results.users.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#7B2D8B]">
                    group
                  </span>
                  Patients ({results.users.length})
                </h3>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="text-xs text-[#7B2D8B] font-semibold hover:underline"
                >
                  View All Patients
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {results.users.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="p-4 hover:bg-purple-50/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#7B2D8B] flex items-center justify-center text-white font-bold text-sm">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctors Results */}
          {showDoctors && results.doctors.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#7B2D8B]">
                    medical_services
                  </span>
                  Doctors ({results.doctors.length})
                </h3>
                <button
                  onClick={() => navigate("/admin/doctors")}
                  className="text-xs text-[#7B2D8B] font-semibold hover:underline"
                >
                  View All Doctors
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {results.doctors.slice(0, 5).map((doctor) => (
                  <div
                    key={doctor.id}
                    className="p-4 hover:bg-purple-50/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#7B2D8B] flex items-center justify-center text-white font-bold text-sm">
                        {doctor.name.split(" ")[1]?.[0] || "D"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{doctor.name}</p>
                        <p className="text-xs text-gray-400">
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointments Results */}
          {showAppointments && results.appointments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#7B2D8B]">
                    calendar_today
                  </span>
                  Appointments ({results.appointments.length})
                </h3>
                <button
                  onClick={() => navigate("/admin/appointments")}
                  className="text-xs text-[#7B2D8B] font-semibold hover:underline"
                >
                  View All Appointments
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {results.appointments.slice(0, 5).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 hover:bg-purple-50/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-800">
                          {apt.patient} → {apt.doctor}
                        </p>
                        <p className="text-xs text-gray-400">
                          {apt.date} at {apt.time}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-gray-400">
                        {apt.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments Results */}
          {showPayments && results.payments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#7B2D8B]">
                    payments
                  </span>
                  Payments ({results.payments.length})
                </h3>
                <button
                  onClick={() => navigate("/admin/payments")}
                  className="text-xs text-[#7B2D8B] font-semibold hover:underline"
                >
                  View All Payments
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {results.payments.slice(0, 5).map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 hover:bg-purple-50/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-800">
                          {payment.patient}
                        </p>
                        <p className="text-xs text-gray-400">
                          {payment.amount} ETB via {payment.gateway}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-gray-400">
                        {payment.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
