import Anthropic from "@anthropic-ai/sdk";
import Payment from "../models/Payment.js";
import Tracker from "../models/Tracker.js";
import LabOrder from "../models/LabOrder.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Check if the patient has made at least one paid payment (premium access)
export const getChatStatus = async (req, res) => {
  try {
    const paid = await Payment.findOne({
      patient: req.user._id,
      status: "paid",
    });
    res.json({ premium: !!paid });
  } catch (err) {
    console.error("[Chat] getChatStatus error:", err);
    res.status(500).json({ message: "Failed to check premium status" });
  }
};

// Send a message to the AI health assistant and get a reply
export const sendChatMessage = async (req, res) => {
  try {
    // Re-check premium on every message (prevents bypassing the frontend gate)
    const paid = await Payment.findOne({
      patient: req.user._id,
      status: "paid",
    });
    if (!paid) {
      return res
        .status(403)
        .json({ message: "Premium subscription required to use the health assistant." });
    }

    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Gather patient context: recent trackers + completed lab orders
    const [trackers, labOrders] = await Promise.all([
      Tracker.find({ patient: req.user._id })
        .sort({ recorded_at: -1 })
        .limit(10)
        .lean(),
      LabOrder.find({ patient: req.user._id, status: "completed" })
        .limit(5)
        .lean(),
    ]);

    // Build a concise context string for the system prompt
    const trackerSummary =
      trackers.length > 0
        ? trackers
            .map(
              (t) =>
                `${t.tracker_type}: ${t.value} ${t.unit || ""} (recorded ${new Date(t.recorded_at).toLocaleDateString()})`,
            )
            .join("; ")
        : "No tracker data available.";

    const labSummary =
      labOrders.length > 0
        ? labOrders
            .map((l) => `${l.test_name}: ${l.result || "result pending"}`)
            .join("; ")
        : "No completed lab results available.";

    const systemPrompt = `You are a health information assistant for Tenaye Health, an Ethiopian telemedicine platform. You provide helpful, evidence-based health and nutrition information to patients.

Patient's recent health data:
- Tracker readings: ${trackerSummary}
- Lab results: ${labSummary}

Guidelines:
- Answer health, nutrition, and wellness questions in a clear, friendly, and concise way.
- Use the patient's health data when relevant to personalize your answers.
- Always recommend consulting a doctor or nutritionist for medical decisions.
- Keep responses under 200 words unless the question requires more detail.
- Do not diagnose conditions or prescribe treatments.
- If asked about something outside health/nutrition, politely redirect to health topics.`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: message.trim() }],
    });

    const reply = response.content[0]?.text || "I'm sorry, I couldn't generate a response. Please try again.";
    res.json({ reply });
  } catch (err) {
    console.error("[Chat] sendChatMessage error:", err);
    res.status(500).json({ message: "Failed to get a response. Please try again." });
  }
};
