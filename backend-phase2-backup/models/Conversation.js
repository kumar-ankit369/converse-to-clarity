const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [{
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      sentiment: {
        score: { type: Number, default: 0 }, // -1 to 1
        label: { type: String, enum: ["positive", "neutral", "negative"], default: "neutral" }
      },
      clarity: {
        score: { type: Number, default: 0 }, // 0 to 100
        issues: [String]
      }
    }],
    metrics: {
      totalMessages: { type: Number, default: 0 },
      averageSentiment: { type: Number, default: 0 },
      clarityScore: { type: Number, default: 0 },
      participationRate: { type: Number, default: 0 },
      responseTime: { type: Number, default: 0 }, // in minutes
      blockers: [{
        type: { type: String, enum: ["stalled", "unclear", "conflict"] },
        description: String,
        detected: { type: Date, default: Date.now },
        resolved: { type: Boolean, default: false }
      }]
    },
    tags: [String],
    status: { 
      type: String, 
      enum: ["active", "completed", "stalled", "archived"], 
      default: "active" 
    },
    priority: { 
      type: String, 
      enum: ["low", "medium", "high", "urgent"], 
      default: "medium" 
    }
  },
  { timestamps: true }
);

// Indexes for better performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ createdAt: -1 });
conversationSchema.index({ "metrics.clarityScore": -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
