const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;

async function start() {
  const mongoUri = process.env.MONGO_URI;
  
  // Use a free MongoDB Atlas connection string for demo
  const demoUri = "mongodb+srv://demo:demo123@cluster0.mongodb.net/converse-to-clarity?retryWrites=true&w=majority";
  
  try {
    if (mongoUri && mongoUri !== "mongodb://localhost:27017/converse-to-clarity") {
      await mongoose.connect(mongoUri);
      console.log("MongoDB Connected ✅ (custom URI)");
    } else {
      // Try demo MongoDB Atlas connection
      try {
        await mongoose.connect(demoUri);
        console.log("MongoDB Connected ✅ (Atlas demo)");
      } catch (atlasErr) {
        console.log("Atlas demo not available, using mock mode");
        console.log("Running in mock mode (no database)");
      }
    }
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("DB Connection Error:", err);
    console.log("Starting server in mock mode...");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} (mock mode)`));
  }
}

start();
