import Anthropic from "@anthropic-ai/sdk";
import LabOrder from "../models/LabOrder.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// GET /api/nutrition/recommendations
// Fetches the patient's completed lab orders and returns AI-generated nutrition advice
export const getNutritionRecommendations = async (req, res) => {
  try {
    const labOrders = await LabOrder.find({
      patient: req.user._id,
      status: "completed",
    })
      .sort({ ordered_at: -1 })
      .limit(10)
      .lean();

    if (labOrders.length === 0) {
      return res.json({ hasData: false, recommendations: null, labOrders: [] });
    }

    // Build a readable summary of lab results for Claude
    const labSummary = labOrders
      .map((l) => `- ${l.test_name}: ${l.result || "result not entered"}`)
      .join("\n");

    const prompt = `You are a clinical nutritionist AI. A patient has the following lab results:

${labSummary}

Based on these results, provide a structured nutrition analysis. Respond ONLY with valid JSON in exactly this format (no markdown, no extra text):
{
  "summary": "A 2-3 sentence overall assessment of the patient's nutritional status based on these results.",
  "markers": [
    {
      "name": "Test name from the lab result",
      "value": "The result value as a string",
      "status": "normal | low | high | borderline",
      "advice": "One specific dietary recommendation for this marker."
    }
  ],
  "foods_to_include": ["Food 1", "Food 2", "Food 3", "Food 4", "Food 5"],
  "foods_to_limit": ["Food 1", "Food 2", "Food 3"],
  "key_nutrients": ["Nutrient 1 (reason)", "Nutrient 2 (reason)", "Nutrient 3 (reason)"],
  "general_advice": "2-3 sentences of general lifestyle and dietary advice based on the combined results."
}`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content[0]?.text || "{}";

    let recommendations;
    try {
      recommendations = JSON.parse(raw);
    } catch {
      // Claude returned non-JSON — wrap it gracefully
      recommendations = {
        summary: raw,
        markers: [],
        foods_to_include: [],
        foods_to_limit: [],
        key_nutrients: [],
        general_advice: "",
      };
    }

    res.json({ hasData: true, recommendations, labOrders });
  } catch (err) {
    console.error("[Nutrition] recommendations error:", err);
    res.status(500).json({ message: "Failed to generate nutrition recommendations" });
  }
};
