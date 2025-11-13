const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    targetMetric: {
      type: { 
        type: String, 
        enum: ["clarity_score", "response_time", "sentiment", "participation", "custom"],
        required: true 
      },
      target: { type: Number, required: true },
      current: { type: Number, default: 0 },
      unit: String // "percentage", "minutes", "score", etc.
    },
    deadline: { type: Date, required: true },
    priority: { 
      type: String, 
      enum: ["low", "medium", "high"], 
      default: "medium" 
    },
    status: { 
      type: String, 
      enum: ["draft", "active", "completed", "paused", "cancelled"], 
      default: "draft" 
    },
    progress: { type: Number, default: 0 }, // 0-100
    milestones: [{
      title: String,
      description: String,
      targetDate: Date,
      completed: { type: Boolean, default: false },
      completedAt: Date
    }],
    tags: [String],
    notes: [String]
  },
  { timestamps: true }
);

// Calculate progress based on target metric
goalSchema.methods.calculateProgress = function() {
  if (this.targetMetric.target === 0) return 0;
  return Math.min(100, (this.targetMetric.current / this.targetMetric.target) * 100);
};

goalSchema.index({ owner: 1 });
goalSchema.index({ status: 1 });
goalSchema.index({ deadline: 1 });

module.exports = mongoose.model("Goal", goalSchema);
