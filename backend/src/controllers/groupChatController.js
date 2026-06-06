import GroupChatRoom from "../models/GroupChatRoom.js";

export const GROUPS = {
  1: {
    name: "Support & Healing",
    description: "A safe space for those going through difficult times",
    emoji: "💙",
    welcomeText:
      "Welcome to the Support & Healing group 💙. I'm your AI therapy facilitator. This is a confidential, supportive space — feel free to share what's on your mind. Everyone here understands.",
  },
  2: {
    name: "Balance & Mindfulness",
    description: "Finding calm and equilibrium together",
    emoji: "🧘",
    welcomeText:
      "Welcome to the Balance & Mindfulness group 🧘. I'm your AI therapy facilitator. This is a calm space to reflect, share, and support each other on the path to inner balance.",
  },
  3: {
    name: "Positivity & Growth",
    description: "Celebrating wins and lifting each other higher",
    emoji: "🌟",
    welcomeText:
      "Welcome to the Positivity & Growth group 🌟. I'm your AI therapy facilitator. Let's celebrate your wins, share what's working, and lift each other to even greater heights!",
  },
};

export const getOrCreateRoom = async (req, res) => {
  try {
    const groupNum = parseInt(req.params.moodGroup, 10);
    if (![1, 2, 3].includes(groupNum)) {
      return res.status(400).json({ message: "Invalid group number. Must be 1, 2, or 3." });
    }

    const g = GROUPS[groupNum];
    let room = await GroupChatRoom.findOne({ moodGroup: groupNum });

    if (!room) {
      room = await GroupChatRoom.create({
        moodGroup: groupNum,
        name: g.name,
        description: g.description,
        messages: [
          {
            senderName: "AI Therapist",
            text: g.welcomeText,
            isAI: true,
            timestamp: new Date(),
          },
        ],
      });
    }

    res.json({
      roomId: room._id.toString(),
      moodGroup: groupNum,
      name: room.name,
      description: room.description,
      emoji: g.emoji,
      messages: room.messages.slice(-50),
    });
  } catch (err) {
    console.error("[GroupChat] getOrCreateRoom error:", err);
    res.status(500).json({ message: err.message });
  }
};
