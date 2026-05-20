import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

// GET /api/doctors/profile - Get current doctor's profile
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate(
      "user",
      "full_name avatar_url email phone",
    );
    if (!doctor)
      return res.status(404).json({ message: "Doctor profile not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/doctors/profile - Update current doctor's profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const {
      specialty,
      subSpecialty,
      hospital,
      experience,
      education,
      consultation_fee,
      availability,
      bio,
      license_no,
    } = req.body;

    // Find doctor by user ID
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor)
      return res.status(404).json({ message: "Doctor profile not found" });

    // Update doctor fields
    if (specialty !== undefined) doctor.specialty = specialty;
    if (subSpecialty !== undefined) doctor.sub_specialty = subSpecialty;
    if (hospital !== undefined) doctor.hospital = hospital;
    if (experience !== undefined) doctor.experience_years = experience;
    if (education !== undefined) doctor.education = education;
    if (consultation_fee !== undefined)
      doctor.consultation_fee = consultation_fee;
    if (availability !== undefined) doctor.availability = availability;
    if (bio !== undefined) doctor.bio = bio;
    if (license_no !== undefined) doctor.license_no = license_no;

    await doctor.save();

    // Update user fields if provided
    const userUpdate = {};
    if (req.body.name !== undefined) userUpdate.full_name = req.body.name;
    if (req.body.phone !== undefined) userUpdate.phone = req.body.phone;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdate);
    }

    // Return updated doctor with user info
    const updatedDoctor = await Doctor.findById(doctor._id).populate(
      "user",
      "full_name avatar_url email phone",
    );

    res.json(updatedDoctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const { specialty, search } = req.query;
    const filter = { status: "approved", is_verified: true };
    if (specialty) filter.specialty = specialty;
    const doctors = await Doctor.find(filter)
      .populate("user", "full_name avatar_url")
      .sort({ rating: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "user",
      "full_name avatar_url email",
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
