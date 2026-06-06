import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import VideoCall from "../pages/Consultation/VideoCall";
import StreamVideoCall from "../pages/Consultation/StreamVideoCall";
import DoctorApply from "../pages/Auth/DoctorApply";

// ─── ADMIN ────────────────────────────────────────────────────────────────────
import AdminDashboard from "../pages/Admin/Dashboard";
import AdminUsers from "../pages/Admin/Users";
import AdminDoctors from "../pages/Admin/Doctors";
import AdminAppointments from "../pages/Admin/Appointments";
import AdminMedicalRecords from "../pages/Admin/MedicalRecords";
import AdminBlogs from "../pages/Admin/Blogs";
import AdminPayments from "../pages/Admin/Payments";
import AdminNotifications from "../pages/Admin/Notifications";
import AdminSettings from "../pages/Admin/Settings";
import AdminSearchResults from "../pages/Admin/SearchResults";

// ─── DOCTOR ───────────────────────────────────────────────────────────────────
import DoctorDashboard from "../pages/Doctor/Dashboard";
import DoctorAppointments from "../pages/Doctor/Appointments";
import DoctorPatients from "../pages/Doctor/Patients";
import DoctorPrescriptions from "../pages/Doctor/Prescriptions";
import DoctorLabOrders from "../pages/Doctor/LabOrders";
import DoctorVitals from "../pages/Doctor/Vitals";
import DoctorBlogs from "../pages/Doctor/Blogs";
import DoctorEarnings from "../pages/Doctor/Earnings";
import DoctorSettings from "../pages/Doctor/Settings";

// ─── PATIENT ──────────────────────────────────────────────────────────────────
import PatientDashboard from "../pages/Patient/Dashboard";
import PatientDoctors from "../pages/Patient/Doctors";
import PatientAppointments from "../pages/Patient/Appointments";
import PatientPrescriptions from "../pages/Patient/Prescriptions";
import PatientLabResults from "../pages/Patient/LabResults";
import PatientVitals from "../pages/Patient/Vitals";
import PatientBilling from "../pages/Patient/Billing";
import PatientBlogs from "../pages/Patient/Blogs";
import PatientSettings from "../pages/Patient/Settings";
import PatientNutrition from "../pages/Patient/Nutrition";
import PatientMentalHealth from "../pages/Patient/MentalHealth";
import PatientChat from "../pages/Patient/Chat";
import PatientFitness from "../pages/Patient/Fitness";
import DoctorChat from "../pages/Doctor/Chat";
import PaymentSuccess from "../pages/Patient/PaymentSuccess";
import PaymentFailed from "../pages/Patient/PaymentFailed";

const P = ({ children, ...props }) => (
  <ProtectedRoute {...props}>{children}</ProtectedRoute>
);
const Guest = ({ children }) => (
  <ProtectedRoute guestOnly>{children}</ProtectedRoute>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Default ── */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/dashboard" element={<Navigate to="/patient" replace />} />

      {/* ── Public ── */}
      <Route path="/home" element={<Home />} />
      <Route
        path="/login"
        element={
          <Guest>
            <Login />
          </Guest>
        }
      />
      <Route
        path="/register"
        element={
          <Guest>
            <Register />
          </Guest>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/doctor-apply" element={<DoctorApply />} />

      {/* ── Admin ── */}
      <Route
        path="/admin"
        element={
          <P allowedRoles={["admin"]}>
            <AdminDashboard />
          </P>
        }
      />
      <Route
        path="/admin/search"
        element={
          <P allowedRoles={["admin"]}>
            <AdminSearchResults />
          </P>
        }
      />
      <Route
        path="/admin/users"
        element={
          <P allowedRoles={["admin"]}>
            <AdminUsers />
          </P>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <P allowedRoles={["admin"]}>
            <AdminDoctors />
          </P>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <P allowedRoles={["admin"]}>
            <AdminAppointments />
          </P>
        }
      />
      <Route
        path="/admin/medical-records"
        element={
          <P allowedRoles={["admin"]}>
            <AdminMedicalRecords />
          </P>
        }
      />
      <Route
        path="/admin/blogs"
        element={
          <P allowedRoles={["admin"]}>
            <AdminBlogs />
          </P>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <P allowedRoles={["admin"]}>
            <AdminPayments />
          </P>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <P allowedRoles={["admin"]}>
            <AdminNotifications />
          </P>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <P allowedRoles={["admin"]}>
            <AdminSettings />
          </P>
        }
      />

      {/* ── Doctor ── */}
      {/* NOTE FOR TEAMMATE: /doctor route is not showing dashboard — check DoctorLayout nav */}
      <Route
        path="/doctor"
        element={
          <P allowedRoles={["doctor"]}>
            <DoctorDashboard />
          </P>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <P allowedRoles={["doctor"]}>
            <DoctorAppointments />
          </P>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <P allowedRoles={["doctor"]}>
            <DoctorPatients />
          </P>
        }
      />
      <Route
        path="/doctor/chat"
        element={
          <P allowedRoles={["doctor"]}>
            <DoctorChat />
          </P>
        }
      />
      <Route
        path="/doctor/prescriptions"
        element={
          <P allowedRoles={["doctor"]}>
            <DoctorPrescriptions />
          </P>
        }
      />
      <Route
        path="/doctor/lab-orders"
        element={
          <P allowedRoles={["doctor"]}>
            <DoctorLabOrders />
          </P>
        }
      />
      <Route
        path="/doctor/vitals"
        element={
          <P allowedRoles={["doctor"]}>
            <DoctorVitals />
          </P>
        }
      />
      <Route
        path="/doctor/blogs"
        element={
          <P allowedRoles={["doctor"]}>
            <DoctorBlogs />
          </P>
        }
      />
      <Route
        path="/doctor/earnings"
        element={
          <P allowedRoles={["doctor"]}>
            <DoctorEarnings />
          </P>
        }
      />
      <Route
        path="/doctor/settings"
        element={
          <P allowedRoles={["doctor"]}>
            <DoctorSettings />
          </P>
        }
      />

      {/* ── Patient ── */}
      <Route
        path="/patient"
        element={
          <P allowedRoles={["patient"]}>
            <PatientDashboard />
          </P>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <P allowedRoles={["patient"]}>
            <PatientAppointments />
          </P>
        }
      />
      <Route
        path="/patient/doctors"
        element={
          <P allowedRoles={["patient"]}>
            <PatientDoctors />
          </P>
        }
      />
      <Route
        path="/patient/prescriptions"
        element={
          <P allowedRoles={["patient"]}>
            <PatientPrescriptions />
          </P>
        }
      />
      <Route
        path="/patient/lab-results"
        element={
          <P allowedRoles={["patient"]}>
            <PatientLabResults />
          </P>
        }
      />
      <Route
        path="/patient/fitness"
        element={
          <P allowedRoles={["patient"]}>
            <PatientFitness />
          </P>
        }
      />
      <Route
        path="/patient/vitals"
        element={
          <P allowedRoles={["patient"]}>
            <PatientVitals />
          </P>
        }
      />
      <Route
        path="/patient/billing"
        element={
          <P allowedRoles={["patient"]}>
            <PatientBilling />
          </P>
        }
      />
      <Route
        path="/patient/blogs"
        element={
          <P allowedRoles={["patient"]}>
            <PatientBlogs />
          </P>
        }
      />
      <Route
        path="/patient/chat"
        element={
          <P allowedRoles={["patient"]}>
            <PatientChat />
          </P>
        }
      />
      <Route
        path="/patient/nutrition"
        element={
          <P allowedRoles={["patient"]}>
            <PatientNutrition />
          </P>
        }
      />
      <Route
        path="/patient/mental-health"
        element={
          <P allowedRoles={["patient"]}>
            <PatientMentalHealth />
          </P>
        }
      />
      <Route
        path="/patient/settings"
        element={
          <P allowedRoles={["patient"]}>
            <PatientSettings />
          </P>
        }
      />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failed" element={<PaymentFailed />} />
      <Route path="/consultation/:roomId" element={<P><VideoCall /></P>} />

      {/* ── 404 ── */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
