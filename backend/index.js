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

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes (with error handling for missing files)
let authRoutes, userRoutes, conversationRoutes, goalRoutes, analyticsRoutes;

try {
  authRoutes = require("./routes/auth");
  console.log("✅ Auth routes loaded");
} catch (err) {
  console.log("⚠️  Auth routes not found, using fallback");
  authRoutes = express.Router();
}

try {
  userRoutes = require("./routes/users");
  console.log("✅ User routes loaded");
} catch (err) {
  console.log("⚠️  User routes not found, using fallback");
  userRoutes = express.Router();
}

try {
  conversationRoutes = require("./routes/conversations");
  console.log("✅ Conversation routes loaded");
} catch (err) {
  console.log("⚠️  Conversation routes not found, using fallback");
  conversationRoutes = express.Router();
}

try {
  goalRoutes = require("./routes/goals");
  console.log("✅ Goal routes loaded");
} catch (err) {
  console.log("⚠️  Goal routes not found, using fallback");
  goalRoutes = express.Router();
}

try {
  analyticsRoutes = require("./routes/analytics");
  console.log("✅ Analytics routes loaded");
} catch (err) {
  console.log("⚠️  Analytics routes not found, using fallback");
  analyticsRoutes = express.Router();
}

// Apply routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/analytics", analyticsRoutes);

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
    features: [
      "✅ Professional Authentication & Authorization",
      "✅ Advanced User Management", 
      "✅ Conversation Analytics",
      "✅ Goal Tracking & Progress Monitoring",
      "✅ AI-Powered Insights & Recommendations",
      "✅ Real-time Metrics & KPIs",
      "✅ Team Performance Analytics",
      "✅ Knowledge Graph & Expertise Mapping",
      "✅ Sentiment Analysis",
      "✅ Professional Error Handling"
    ],
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

const PORT = process.env.PORT || 5000;

async function start() {
  const mongoUri = process.env.MONGO_URI;
  
  console.log("🚀 Starting Converse to Clarity Professional Backend...");
  
  try {
    if (mongoUri && mongoUri !== "mongodb://localhost:27017/converse-to-clarity") {
      await mongoose.connect(mongoUri);
      console.log("✅ MongoDB Connected (custom URI)");
    } else {
      try {
        await mongoose.connect("mongodb://localhost:27017/converse-to-clarity");
        console.log("✅ MongoDB Connected (local)");
      } catch (localErr) {
        console.log("⚠️  No MongoDB connection - API will work with mock data");
      }
    }
    
    app.listen(PORT, () => {
      console.log(`\n🎉 Professional Backend Server Started Successfully!`);
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api`);
      console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
      console.log(`\n🔧 Available Endpoints:`);
      console.log(`   • Authentication: http://localhost:${PORT}/api/auth`);
      console.log(`   • User Management: http://localhost:${PORT}/api/users`);
      console.log(`   • Conversations: http://localhost:${PORT}/api/conversations`);
      console.log(`   • Goals: http://localhost:${PORT}/api/goals`);
      console.log(`   • Analytics: http://localhost:${PORT}/api/analytics`);
      console.log(`\n✨ Ready to serve your professional dashboard!`);
    });
    
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

start();
