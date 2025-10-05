const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    metrics: {
      totalConversations: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
      averageClarityScore: { type: Number, default: 0 },
      averageSentiment: { type: Number, default: 0 },
      averageResponseTime: { type: Number, default: 0 },
      goalsAchieved: { type: Number, default: 0 },
      blockersDetected: { type: Number, default: 0 },
      blockersResolved: { type: Number, default: 0 }
    },
    hourlyData: [{
      hour: { type: Number, min: 0, max: 23 },
      conversations: { type: Number, default: 0 },
      messages: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 }
    }],
    topTopics: [{
      topic: String,
      count: Number,
      sentiment: Number
    }],
    userActivity: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      messagesCount: Number,
      clarityScore: Number,
      participationRate: Number
    }]
  },
  { timestamps: true }
);

// Compound index for efficient date-based queries
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ "metrics.averageClarityScore": -1 });

module.exports = mongoose.model("Analytics", analyticsSchema);
