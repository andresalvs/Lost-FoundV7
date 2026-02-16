import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import pool from "./db.js";

// ✅ Load environment variables
dotenv.config();

// ====================
// Startup environment validation (fail fast)
// ====================
const requiredEnvs = ["JWT_SECRET", "GOOGLE_CLIENT_ID"];
const missingEnvs = requiredEnvs.filter((n) => !process.env[n]);
if (missingEnvs.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingEnvs.join(", ")}.\n` +
      `Please create backend/.env (or set these in your environment) before starting the server.`
  );
  // Exit with non-zero so process managers know startup failed.
  process.exit(1);
}

// ✅ Initialize Express app
const app = express();

// ====================
// Security & Middleware Setup
// ====================

const frontendOrigins = [
  "http://localhost:5001",
  "http://127.0.0.1:5001",
  "http://192.168.1.12:5001", // LAN access
];

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use(express.json());

// Centralized CORS options so both normal requests and preflight use the same configuration
const corsOptions = {
  origin: frontendOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Handle preflight requests using the same options (important so PATCH is allowed)
app.options("*", cors(corsOptions));

// ✅ GLOBAL REQUEST LOGGING - Log all incoming requests
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Content-Type: ${req.headers['content-type']}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   Body keys: ${Object.keys(req.body).join(', ')}`);
    try {
      const { claimant_name, claimant_student_id, claimant_phone_number } = req.body;
      if (claimant_name || claimant_student_id || claimant_phone_number) {
        console.log('   Claimant values:', {
          claimant_name: claimant_name || null,
          claimant_student_id: claimant_student_id || null,
          claimant_phone_number: claimant_phone_number || null,
        });
      }
    } catch (logErr) {
      console.warn('⚠️ Could not log claimant values:', logErr);
    }
  }
  next();
});

// ====================
// Static File Serving
// ====================

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ====================
// Database Connection
// ====================

pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL database"))
  .catch((err) => console.error("❌ Database connection error:", err));

// ====================
// Socket.IO Setup
// ====================

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: frontendOrigins,
    methods: ["GET", "POST","PATCH", "PUT", "DELETE"],
    credentials: true,
  },
});

// ✅ Make Socket.IO accessible to routes
app.set("io", io);

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // ✅ When user joins, add them to a user-specific room
  socket.on("joinUserRoom", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`✅ User ${userId} joined room user_${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ====================
// Import Routes
// ====================

import reportRoutes from "./routes/reportRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import userRoutes from "./routes/user.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import officeHoursRoutes from "./routes/officeHoursRoutes.js";
import { initCleanupTask } from "./services/cleanupService.js";

// ====================
// API Routes
// ====================

app.use("/api/user", userRoutes); // User management
app.use("/api", reportRoutes); // Report system
app.use("/api/auth", authRoutes); // Authentication
app.use("/api/profile", profileRoutes); // Profile management
app.use("/api/notifications", notificationRoutes); // Notifications
app.use("/api/items", itemRoutes); // Items management ✅
app.use("/api/claims", claimRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/office-hours", officeHoursRoutes); // Office hours management

// ====================
// Initialize background tasks
// ====================
initCleanupTask(io);

// ====================
// Catch-All 404 Handler
// ====================
app.use((req, res) => {
  // Enhanced 404 logging to help debug unexpected client requests
  try {
    console.warn(`⚠️ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    console.warn(`   Remote IP: ${req.ip || "unknown"}`);
    console.warn(`   Host header: ${req.headers.host || "none"}`);
    console.warn(
      `   Referer: ${req.headers.referer || req.headers.referrer || "none"}`
    );
    console.warn(`   User-Agent: ${req.headers["user-agent"] || "none"}`);
  } catch (logErr) {
    console.error("Error while logging 404 details:", logErr);
  }

  res.status(404).json({ error: "Route not found" });
});

// ====================
// Server Startup
// ====================

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server with Socket.IO running on port ${PORT}`);
});
