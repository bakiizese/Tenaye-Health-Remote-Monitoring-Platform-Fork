/**
 * PATIENT SERVICE
 *
 * All patient-related API calls.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// ─── DOCTORS ──────────────────────────────────────────────────────────────────

export const getDoctors = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/api/doctors?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch doctors");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getDoctorById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/doctors/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch doctor");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────

export const createAppointment = async (appointmentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(appointmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Return the actual error message from backend (e.g., slot already booked)
      return {
        data: null,
        error:
          data.message || `Failed to create appointment (${response.status})`,
      };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getMyAppointments = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/appointments/mine`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch appointments");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getDoctorAppointments = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/appointments/doctor`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch appointments");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Get booked time slots for a doctor on a specific date
// Used to prevent double-booking
export const getDoctorBookedSlots = async (doctorId, date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/appointments/doctor/booked-slots?doctorId=${doctorId}&date=${date}`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch booked slots");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// ─── PAYMENTS ────────────────────────────────────────────────────────────────

export const initiatePayment = async (paymentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/init`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to initiate payment");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const uploadReceipt = async (paymentId, file) => {
  try {
    const formData = new FormData();
    formData.append("receipt", file);
    formData.append("paymentId", paymentId);

    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/api/payments/upload-receipt`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload receipt");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const verifyChapaPayment = async (txRef) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/payments/verify-chapa/${txRef}`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to verify payment");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getPayments = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payments`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch payments");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// ─── PRESCRIPTIONS ────────────────────────────────────────────────────────────

export const getPatientPrescriptions = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/prescriptions/my-prescriptions`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch prescriptions");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const updatePrescriptionStatus = async (prescriptionId, status) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/prescriptions/${prescriptionId}/status`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update prescription status");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// ─── DOCTOR PATIENTS ────────────────────────────────────────────────────────────

export const getDoctorPatients = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/appointments/doctor/patients`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch doctor patients");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// ─── DOCTOR PRESCRIPTIONS ───────────────────────────────────────────────────────

export const createPrescription = async (prescriptionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/prescriptions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(prescriptionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create prescription");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getDoctorPrescriptions = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/prescriptions/doctor/mine`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch doctor prescriptions");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// ─── DOCTOR EARNINGS ───────────────────────────────────────────────────────────

export const getDoctorEarnings = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/payments/doctor/earnings`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch doctor earnings");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// ─── PRESCRIPTION PDF ─────────────────────────────────────────────────────────

export const downloadPrescriptionPDF = async (prescriptionId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/prescriptions/${prescriptionId}/download`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to download prescription PDF");
    }

    // Get the blob from response
    const blob = await response.blob();

    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prescription-${prescriptionId.slice(-8)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ─── PROFILE ──────────────────────────────────────────────────────────────────

export const getMyProfile = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message };
    return { data };
  } catch {
    return { error: "Failed to load profile" };
  }
};

export const updateMyProfile = async (profileData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message };
    return { data };
  } catch {
    return { error: "Failed to update profile" };
  }
};

export const updateMyPassword = async (currentPassword, newPassword) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me/password`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message };
    return { data };
  } catch {
    return { error: "Failed to update password" };
  }
};
