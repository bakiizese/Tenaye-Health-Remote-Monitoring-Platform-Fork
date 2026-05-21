/**
 * StreamVideoCall.jsx — Stream Video SDK integration
 *
 * Uses Stream's React SDK for reliable video calls with:
 * - Automatic quality adaptation
 * - Screen sharing
 * - Chat messaging
 * - Recording support
 */

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

// Stream Chat SDK
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { StreamChat } from "stream-chat";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
// Helper to build API URL with /api prefix if needed
const buildApiUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  // Ensure baseUrl has /api prefix
  const normalizedBase = baseUrl.endsWith("/api") 
    ? baseUrl 
    : `${baseUrl}/api`;
  return `${normalizedBase}${path}`;
};

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem("token");

// Get current user ID from JWT token
const getCurrentUser = () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
};

// Fetch Stream token from backend
const fetchStreamToken = async (userId) => {
  const response = await fetch(buildApiUrl("/stream/token"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error("Failed to get Stream token");
  }

  const data = await response.json();
  return data.token;
};

// Heart rate display component (simplified without rPPG for now)
function HeartRateDisplay({ bpm, confidence }) {
  const colors = {
    high: "text-emerald-400",
    medium: "text-amber-400",
    low: "text-red-400",
  };

  return (
    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
      <span className="material-symbols-outlined text-red-400 text-lg">favorite</span>
      <span className={`font-bold text-lg ${colors[confidence] || "text-gray-400"}`}>
        {bpm || "--"}
      </span>
      <span className="text-gray-400 text-sm">BPM</span>
    </div>
  );
}

// Custom call UI layout with chat
function CallUILayout({ onEndCall, chatClient, channel }) {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const [showChat, setShowChat] = useState(false);

  if (callingState === CallingState.LEFT) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <span className="material-symbols-outlined text-6xl mb-4 text-emerald-400">check_circle</span>
        <p className="text-xl font-semibold">Call Ended</p>
        <p className="text-gray-400 mt-2">Returning to appointments...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main video area */}
      <div className="flex-1 flex flex-col">
        {/* Header with stats and participants */}
        <div className="flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <CallStatsButton />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-lg transition-colors ${showChat ? "bg-[#0D7377] text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
            >
              <span className="material-symbols-outlined">chat</span>
            </button>
            <CallParticipantsList />
          </div>
        </div>

        {/* Video area */}
        <div className="flex-1 relative">
          <SpeakerLayout participantsBarPosition="bottom" />
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-900/50 backdrop-blur-sm">
          <CallControls onHangup={onEndCall} />
        </div>
      </div>

      {/* Chat panel */}
      {showChat && chatClient && channel && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <Chat client={chatClient} theme="messaging light">
            <Channel channel={channel}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        </div>
      )}
    </div>
  );
}

export default function StreamVideoCall() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heartRate, setHeartRate] = useState({ bpm: null, confidence: null });

  // Get appointment and user info from navigation state
  const { appointment, userRole } = location.state || {};
  const currentUser = getCurrentUser();

  useEffect(() => {
    const initStream = async () => {
      try {
        if (!currentUser) {
          throw new Error("Not authenticated");
        }

        // Get Stream token from backend
        const streamToken = await fetchStreamToken(currentUser._id);

        // Initialize Stream client
        const streamClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          token: streamToken,
          user: {
            id: currentUser._id,
            name: currentUser.full_name || currentUser.email,
            role: userRole || currentUser.role,
          },
        });

        setClient(streamClient);

        // Get or create the call
        const callType = "default";
        const callId = roomId || `appointment_${Date.now()}`;

        const streamCall = streamClient.call(callType, callId);

        // Check if call exists, if not create it
        try {
          await streamCall.get();
        } catch {
          // Call doesn't exist, create it
          await streamCall.create({
            data: {
              created_by_id: currentUser._id,
              members: appointment
                ? [
                    { user_id: appointment.patient?._id || appointment.patient, role: "admin" },
                    { user_id: appointment.doctor?._id || appointment.doctor, role: "admin" },
                  ]
                : [{ user_id: currentUser._id, role: "admin" }],
            },
          });
        }

        // Join the call
        await streamCall.join();
        setCall(streamCall);

        // Initialize Stream Chat client
        const chatCl = StreamChat.getInstance(STREAM_API_KEY);
        await chatCl.connectUser(
          {
            id: currentUser._id,
            name: currentUser.full_name || currentUser.email,
            role: userRole || currentUser.role,
          },
          streamToken
        );
        setChatClient(chatCl);

        // Create or get chat channel for this call
        const channelId = `call-${callId}`;
        const ch = chatCl.channel("messaging", channelId, {
          name: `Consultation ${callId.slice(-8)}`,
          members: appointment
            ? [
                appointment.patient?._id || appointment.patient,
                appointment.doctor?._id || appointment.doctor,
              ]
            : [currentUser._id],
        });
        await ch.watch();
        setChannel(ch);

        setLoading(false);
      } catch (err) {
        console.error("Stream initialization error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    initStream();

    // Cleanup
    return () => {
      if (call) {
        call.leave();
      }
      if (client) {
        client.disconnectUser();
      }
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [roomId, currentUser, appointment, userRole]);

  const handleEndCall = useCallback(async () => {
    if (call) {
      await call.leave();
    }

    // Navigate back based on role
    if (userRole === "doctor" || currentUser?.role === "doctor") {
      navigate("/doctor/appointments");
    } else {
      navigate("/patient/appointments");
    }
  }, [call, navigate, userRole, currentUser]);

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0D7377] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Initializing video call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <span className="material-symbols-outlined text-6xl mb-4 text-red-400">error</span>
          <p className="text-xl font-semibold mb-2">Failed to start call</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-[#0D7377] text-white rounded-xl font-semibold hover:bg-[#0a5c60] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Unable to initialize call</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <StreamTheme className="h-full">
            <CallUILayout onEndCall={handleEndCall} chatClient={chatClient} channel={channel} />
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </div>
  );
}
