import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPTS = {
  1: `You are a compassionate AI therapy facilitator for a mental health support group called "Support & Healing".
Members are experiencing difficult emotions — low mood, sadness, anxiety, or distress.
Your role:
- Be warm, empathetic, and non-judgmental
- Validate feelings without providing medical diagnoses
- Offer evidence-based coping strategies (breathing, grounding, journaling)
- Gently encourage peer connection and mutual support
- Recognize crisis language and provide resources when needed (Ethiopia crisis: +251-116-629-698)
- Keep responses SHORT (2–4 sentences) so the conversation keeps flowing naturally
- Never prescribe medication or diagnose conditions`,

  2: `You are a mindful AI therapy facilitator for a "Balance & Mindfulness" support group.
Members are in a neutral emotional state seeking stability and calm.
Your role:
- Offer mindfulness tips, breathing exercises, and grounding techniques
- Encourage reflection and self-awareness
- Celebrate small wins and progress
- Keep responses SHORT (2–4 sentences)
- Never diagnose or prescribe`,

  3: `You are an uplifting AI therapy facilitator for a "Positivity & Growth" support group.
Members are feeling good and want to build on that momentum.
Your role:
- Celebrate positive emotions and achievements
- Share growth mindset strategies
- Encourage peer sharing of what is working well
- Foster community and connection
- Keep responses SHORT (2–4 sentences)
- Never diagnose or prescribe`,
};

const CRISIS_KEYWORDS = [
  "suicide", "kill myself", "end my life", "want to die",
  "hurt myself", "self-harm", "no reason to live",
];
const SUPPORT_KEYWORDS = [
  "help", "sad", "anxious", "scared", "alone", "hopeless",
  "crisis", "panic", "depressed", "crying", "overwhelmed",
];

export function shouldAIRespond(text, countSinceLastAI) {
  const lower = text.toLowerCase();
  if (CRISIS_KEYWORDS.some((k) => lower.includes(k))) return true;
  if (SUPPORT_KEYWORDS.some((k) => lower.includes(k))) return true;
  if (countSinceLastAI >= 3) return true;
  return false;
}

export async function generateWelcomeMessage(moodGroup, userName) {
  const fallbacks = {
    1: `Welcome to the group, ${userName}. You're not alone here — we're all in this together. 💙`,
    2: `Welcome, ${userName}! This is a safe space for balance and reflection. Glad you're here. 🧘`,
    3: `Hey ${userName}, welcome! So great to have you join our positive community. 🌟`,
  };
  if (!process.env.ANTHROPIC_API_KEY) return fallbacks[moodGroup] || fallbacks[2];

  const groupNames = { 1: "Support & Healing", 2: "Balance & Mindfulness", 3: "Positivity & Growth" };
  const systemPrompt = SYSTEM_PROMPTS[moodGroup] || SYSTEM_PROMPTS[2];
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 128,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: `A new member named "${userName}" just joined the "${groupNames[moodGroup] || "Support"}" group. Write a warm, brief (1-2 sentence) welcome message addressed directly to them by name.`
      }]
    });
    return response.content[0]?.text || fallbacks[moodGroup] || fallbacks[2];
  } catch {
    return fallbacks[moodGroup] || fallbacks[2];
  }
}

export async function generateGroupAIResponse(moodGroup, recentMessages, newMessage) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return "I'm here with you. Please continue sharing — this is a safe space.";
  }

  const systemPrompt = SYSTEM_PROMPTS[moodGroup] || SYSTEM_PROMPTS[2];

  // Build conversation history, skipping leading AI messages
  let history = recentMessages
    .slice(-10)
    .map((m) => ({
      role: m.isAI ? "assistant" : "user",
      content: m.isAI ? m.text : `${m.senderName}: ${m.text}`,
    }));

  // Drop leading assistant turns (Claude requires user to go first)
  while (history.length > 0 && history[0].role === "assistant") {
    history.shift();
  }

  // Append the triggering message
  history.push({
    role: "user",
    content: `${newMessage.senderName}: ${newMessage.text}`,
  });

  if (history.length === 0) {
    history = [{ role: "user", content: `${newMessage.senderName}: ${newMessage.text}` }];
  }

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    system: systemPrompt,
    messages: history,
  });

  return response.content[0]?.text || "I'm here with you. Please continue sharing.";
}
