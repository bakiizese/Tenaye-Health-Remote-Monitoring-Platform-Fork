// Simple pub/sub store for doctor profile — shared between Settings and DoctorLayout
import { mockDoctorProfile } from "../data/mockData";

// Try to load saved profile from localStorage first, then fall back to logged-in user, then mock
function loadInitialState() {
  try {
    const saved = localStorage.getItem("doctorProfile");
    if (saved) return JSON.parse(saved);
  } catch {}
  // Fall back to the logged-in user's name from login response
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.full_name) {
      return { ...mockDoctorProfile, name: user.full_name };
    }
  } catch {}
  return null;
}

const saved = loadInitialState();

let state = {
  name: saved?.name || mockDoctorProfile.name,
  specialty: saved?.specialty || mockDoctorProfile.specialty,
  subSpecialty: saved?.subSpecialty || mockDoctorProfile.subSpecialty,
  email: saved?.email || mockDoctorProfile.email,
  phone: saved?.phone || mockDoctorProfile.phone,
  experience: saved?.experience || mockDoctorProfile.experience,
  education: saved?.education || mockDoctorProfile.education,
  languages: saved?.languages || mockDoctorProfile.languages,
  consultationFee: saved?.consultationFee || mockDoctorProfile.consultationFee,
  rating: saved?.rating || mockDoctorProfile.rating,
  totalReviews: saved?.totalReviews || mockDoctorProfile.totalReviews,
  totalPatients: saved?.totalPatients || mockDoctorProfile.totalPatients,
  bio: saved?.bio || mockDoctorProfile.bio,
  availability: saved?.availability || mockDoctorProfile.availability,
  hospital: saved?.hospital || mockDoctorProfile.hospital,
  licenseNo: saved?.licenseNo || mockDoctorProfile.licenseNo,
};

const listeners = new Set();

export function getDoctorProfile() {
  return { ...state };
}

export function updateDoctorProfile(updates) {
  state = { ...state, ...updates };
  // Persist to localStorage so it survives page refresh
  try {
    localStorage.setItem("doctorProfile", JSON.stringify(state));
  } catch {}
  listeners.forEach((fn) => fn({ ...state }));
}

export function subscribeDoctorProfile(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
