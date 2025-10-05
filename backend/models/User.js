const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["user", "admin", "manager"], 
      default: "user" 
    },
    profile: {
      avatar: String,
      department: String,
      position: String,
      timezone: { type: String, default: "UTC" },
      preferences: {
        notifications: { type: Boolean, default: true },
        emailAlerts: { type: Boolean, default: true },
        theme: { type: String, enum: ["light", "dark", "auto"], default: "auto" }
      }
    },
    stats: {
      totalConversations: { type: Number, default: 0 },
      averageClarityScore: { type: Number, default: 0 },
      averageSentiment: { type: Number, default: 0 },
      goalsCompleted: { type: Number, default: 0 },
      lastActive: { type: Date, default: Date.now }
    },
    expertise: [String], // Areas of expertise detected by AI
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Virtual for user's full profile
userSchema.virtual('fullProfile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    profile: this.profile,
    stats: this.stats,
    expertise: this.expertise
  };
});

// Method to update user stats
userSchema.methods.updateStats = function(newStats) {
  Object.assign(this.stats, newStats);
  this.stats.lastActive = new Date();
  return this.save();
};

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ "stats.lastActive": -1 });

module.exports = mongoose.model("User", userSchema);
