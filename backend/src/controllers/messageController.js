import Message from "../models/Message.js";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

// GET /api/messages/conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const msgs = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "full_name avatar_url role")
      .populate("receiver", "full_name avatar_url role")
      .lean();

    const partnerMap = new Map();

    for (const msg of msgs) {
      const isMe = msg.sender._id.toString() === userId.toString();
      const partner = isMe ? msg.receiver : msg.sender;
      const pid = partner._id.toString();

      if (!partnerMap.has(pid)) {
        partnerMap.set(pid, {
          partnerId: pid,
          partnerName: partner.full_name,
          partnerAvatar: partner.avatar_url || null,
          partnerRole: partner.role,
          lastMessage: msg.content,
          lastAt: msg.createdAt,
          unread: 0,
        });
      }
      // Count unread messages coming TO the current user
      if (msg.receiver._id.toString() === userId.toString() && !msg.read) {
        partnerMap.get(pid).unread += 1;
      }
    }

    const conversations = Array.from(partnerMap.values());

    // For patients: also show doctors from appointments even if never messaged
    if (req.user.role === "patient") {
      const doctorDocIds = await Appointment.find({ patient: userId }).distinct("doctor");
      const doctors = await Doctor.find({
        _id: { $in: doctorDocIds },
        status: "approved",
      })
        .populate("user", "full_name avatar_url")
        .lean();

      for (const doc of doctors) {
        if (!doc.user) continue;
        const uid = doc.user._id.toString();
        if (!partnerMap.has(uid)) {
          conversations.push({
            partnerId: uid,
            partnerName: doc.user.full_name,
            partnerAvatar: doc.user.avatar_url || null,
            partnerRole: "doctor",
            specialty: doc.specialty,
            lastMessage: null,
            lastAt: null,
            unread: 0,
          });
        } else {
          partnerMap.get(uid).specialty = doc.specialty;
        }
      }
    }

    // For doctors: also show patients from appointments even if never messaged
    if (req.user.role === "doctor") {
      const doctorDoc = await Doctor.findOne({ user: userId }).lean();
      if (doctorDoc) {
        const patientIds = await Appointment.find({ doctor: doctorDoc._id }).distinct("patient");
        const patients = await User.find({ _id: { $in: patientIds }, role: "patient" })
          .select("full_name avatar_url role")
          .lean();

        for (const patient of patients) {
          const uid = patient._id.toString();
          if (!partnerMap.has(uid)) {
            conversations.push({
              partnerId: uid,
              partnerName: patient.full_name,
              partnerAvatar: patient.avatar_url || null,
              partnerRole: "patient",
              lastMessage: null,
              lastAt: null,
              unread: 0,
            });
          }
        }
      }
    }

    conversations.sort((a, b) => {
      if (!a.lastAt && !b.lastAt) return 0;
      if (!a.lastAt) return 1;
      if (!b.lastAt) return -1;
      return new Date(b.lastAt) - new Date(a.lastAt);
    });

    res.json(conversations);
  } catch (err) {
    console.error("[Messages] getConversations error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/messages/:partnerId
export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { partnerId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: partnerId },
        { sender: partnerId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    // Mark incoming messages as read
    await Message.updateMany(
      { sender: partnerId, receiver: userId, read: false },
      { read: true },
    );

    res.json(messages);
  } catch (err) {
    console.error("[Messages] getMessages error:", err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/messages/:receiverId
export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: req.params.receiverId,
      content: content.trim(),
    });

    const populated = await Message.findById(message._id)
      .populate("sender", "full_name avatar_url")
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    console.error("[Messages] sendMessage error:", err);
    res.status(500).json({ message: err.message });
  }
};
