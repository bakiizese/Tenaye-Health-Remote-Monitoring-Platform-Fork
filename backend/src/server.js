import { setDefaultResultOrder, setServers } from "dns";
setDefaultResultOrder("ipv4first");
setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import "dotenv/config";
import "./config/env.js"; // validates required env vars at startup
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import trackerRoutes from "./routes/trackerRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";

// Connect MongoDB
connectDB();

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

// In development, also allow common local ports
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5174", "http://localhost:5175");
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});

app.use(cors(corsOptions));
app.use(express.json({ limit: "5mb" }));

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/trackers", trackerRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/call", callRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

app.get("/health", (_, res) => {
  const dbState = mongoose.connection.readyState;
  // 1 = connected, 2 = connecting
  if (dbState === 1) {
    return res.status(200).json({ status: "ok", db: "connected" });
  }
  return res.status(503).json({ status: "degraded", db: "disconnected" });
});

// Socket.IO — WebRTC signaling
io.on("connection", (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("offer", ({ roomId, offer }) =>
    socket.to(roomId).emit("offer", { offer, from: socket.id }),
  );
  socket.on("answer", ({ roomId, answer }) =>
    socket.to(roomId).emit("answer", { answer, from: socket.id }),
  );
  socket.on("ice-candidate", ({ roomId, candidate }) =>
    socket.to(roomId).emit("ice-candidate", { candidate, from: socket.id }),
  );

  socket.on("end-call", ({ roomId }) => {
    socket.to(roomId).emit("call-ended");
    socket.leave(roomId);
  });

  socket.on("disconnect", () =>
    console.log(`[Socket] Disconnected: ${socket.id}`),
  );

  // Scheduled appointment call started by doctor
  socket.on("call-started", (data) => {
    const { patientId, doctorId, doctorName, appointmentId, timestamp } = data;
    console.log(
      `[Socket] Doctor ${doctorId} started call for appointment ${appointmentId}`,
    );

    // Notify the patient that doctor has started the call
    io.emit(`call-started-${patientId}`, {
      doctorId,
      doctorName,
      appointmentId,
      timestamp,
    });

    // Broadcast to all user's sockets
    socket.broadcast.emit(`call-started-${patientId}`, {
      doctorId,
      doctorName,
      appointmentId,
      timestamp,
    });
  });

  // Missed call notification (when patient doesn't join within time window)
  socket.on("call-missed", (data) => {
    const { patientId, doctorId, doctorName, appointmentId } = data;
    console.log(
      `[Socket] Missed call from doctor ${doctorId} to patient ${patientId}`,
    );

    io.emit(`call-missed-${patientId}`, {
      doctorId,
      doctorName,
      appointmentId,
      timestamp: new Date().toISOString(),
    });
  });

  // Chat message relay between patient and doctor in the same room
  socket.on("chat-message", (data) => {
    const { roomId, message } = data;
    console.log(
      `[Socket] Chat message in room ${roomId} from ${message.senderName}`,
    );

    // Broadcast to all other clients in the room (excluding sender)
    socket.to(roomId).emit("chat-message", { message });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`));
