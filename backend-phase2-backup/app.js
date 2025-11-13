const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Enhanced middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8081",
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes
let authRoutes, userRoutes, conversationRoutes, goalRoutes, analyticsRoutes, teamRoutes, projectRoutes, chatRoutes;

try { authRoutes = require("./routes/auth"); } catch (err) { authRoutes = express.Router(); }
try { userRoutes = require("./routes/users"); } catch (err) { userRoutes = express.Router(); }
try { conversationRoutes = require("./routes/conversations"); } catch (err) { conversationRoutes = express.Router(); }
try { goalRoutes = require("./routes/goals"); } catch (err) { goalRoutes = express.Router(); }
try { analyticsRoutes = require("./routes/analytics"); } catch (err) { analyticsRoutes = express.Router(); }
try { teamRoutes = require("./routes/teams"); } catch (err) { teamRoutes = express.Router(); }
try { projectRoutes = require("./routes/projects"); } catch (err) { projectRoutes = express.Router(); }
try { chatRoutes = require("./routes/chat"); } catch (err) { chatRoutes = express.Router(); }

// Apply routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/chat", chatRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "Converse to Clarity API",
    version: "1.0.0",
    description: "Professional communication analytics platform",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users", 
      conversations: "/api/conversations",
      goals: "/api/goals",
      analytics: "/api/analytics",
      teams: "/api/teams",
      projects: "/api/projects",
      chat: "/api/chat",
      health: "/api/health"
    },
    status: "Enhanced Professional Backend Ready! 🚀"
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Converse to Clarity Professional Backend is running!",
    version: "1.0.0",
    documentation: "/api",
    health: "/api/health"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

module.exports = app;
