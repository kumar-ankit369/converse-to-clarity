const express = require("express");
const Analytics = require("../models/Analytics");
const Conversation = require("../models/Conversation");
const Goal = require("../models/Goal");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get dashboard overview metrics
router.get("/overview", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get user's conversations and calculate metrics
    const conversations = await Conversation.find({ 
      participants: userId,
      updatedAt: { $gte: thirtyDaysAgo }
    });
    
    const activeGoals = await Goal.find({ 
      $or: [{ owner: userId }, { team: userId }],
      status: "active"
    });
    
    const completedGoals = await Goal.find({ 
      $or: [{ owner: userId }, { team: userId }],
      status: "completed",
      updatedAt: { $gte: thirtyDaysAgo }
    });
    
    // Calculate metrics
    const totalConversations = conversations.length;
    const averageClarityScore = conversations.length > 0 
      ? conversations.reduce((acc, conv) => acc + (conv.metrics.clarityScore || 0), 0) / conversations.length 
      : 0;
    
    const activeUsers = await User.countDocuments({ 
      "stats.lastActive": { $gte: sevenDaysAgo }
    });
    
    // Calculate changes from previous period
    const previousPeriodConversations = await Conversation.countDocuments({
      participants: userId,
      updatedAt: { 
        $gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
        $lt: thirtyDaysAgo
      }
    });
    
    const conversationChange = previousPeriodConversations > 0 
      ? ((totalConversations - previousPeriodConversations) / previousPeriodConversations * 100)
      : 0;
    
    const metrics = {
      totalConversations: {
        value: totalConversations,
        change: conversationChange,
        changeLabel: `${conversationChange > 0 ? '+' : ''}${conversationChange.toFixed(1)}% from last month`
      },
      clarityScore: {
        value: `${Math.round(averageClarityScore)}%`,
        change: 5.2, // Mock data - implement actual calculation
        changeLabel: "+5.2% improvement"
      },
      activeUsers: {
        value: activeUsers,
        change: -2.1, // Mock data
        changeLabel: "-2.1% from last week"
      },
      goalsAchieved: {
        value: completedGoals.length,
        change: 23.8, // Mock data
        changeLabel: "+23.8% this quarter"
      }
    };
    
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch overview metrics", details: err.message });
  }
});

// Get analytics data for charts
router.get("/charts", authMiddleware, async (req, res) => {
  try {
    const { timeRange = "30d" } = req.query;
    const userId = req.user.id;
    
    let daysBack = 30;
    if (timeRange === "7d") daysBack = 7;
    if (timeRange === "90d") daysBack = 90;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    // Generate mock chart data (replace with real data aggregation)
    const chartData = [];
    for (let i = daysBack; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      chartData.push({
        date: date.toISOString().split('T')[0],
        desktop: Math.floor(Math.random() * 400) + 100,
        mobile: Math.floor(Math.random() * 300) + 150,
        conversations: Math.floor(Math.random() * 50) + 10,
        clarity: Math.floor(Math.random() * 40) + 60,
        sentiment: Math.random() * 2 - 1
      });
    }
    
    res.json(chartData);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chart data", details: err.message });
  }
});

// Get sentiment analysis data
router.get("/sentiment", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = "30d" } = req.query;
    
    let daysBack = 30;
    if (timeRange === "7d") daysBack = 7;
    if (timeRange === "90d") daysBack = 90;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const conversations = await Conversation.find({
      participants: userId,
      updatedAt: { $gte: startDate }
    });
    
    // Aggregate sentiment data
    const sentimentData = {
      positive: 0,
      neutral: 0,
      negative: 0,
      trend: []
    };
    
    conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        if (msg.sentiment.label === "positive") sentimentData.positive++;
        else if (msg.sentiment.label === "negative") sentimentData.negative++;
        else sentimentData.neutral++;
      });
    });
    
    // Generate trend data (mock)
    for (let i = daysBack; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      sentimentData.trend.push({
        date: date.toISOString().split('T')[0],
        positive: Math.floor(Math.random() * 20) + 10,
        neutral: Math.floor(Math.random() * 30) + 20,
        negative: Math.floor(Math.random() * 10) + 5
      });
    }
    
    res.json(sentimentData);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sentiment data", details: err.message });
  }
});

// Get team insights
router.get("/insights", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Mock insights data (implement AI-powered insights)
    const insights = [
      {
        type: "improvement",
        title: "Meeting Efficiency Opportunity",
        description: "Your team meetings could benefit from clearer agenda setting. Consider using structured templates to improve focus and reduce average meeting time by 15%.",
        impact: "high",
        actionItems: [
          "Create meeting agenda templates",
          "Set time limits for discussion topics",
          "Assign specific roles for each meeting"
        ],
        estimatedImprovement: "15% reduction in meeting time"
      },
      {
        type: "success",
        title: "Communication Clarity Improved",
        description: "Communication clarity has improved 12% over the last month. Your team is using clearer language and providing better context in discussions.",
        impact: "positive",
        metrics: {
          clarityScore: 87,
          previousScore: 78,
          improvement: 12
        }
      },
      {
        type: "alert",
        title: "Goals Approaching Deadline",
        description: "3 active goals are approaching their deadlines within the next 2 weeks. Review progress and consider adjusting timelines or resources.",
        impact: "medium",
        urgentGoals: 3,
        daysRemaining: 14
      },
      {
        type: "opportunity",
        title: "Knowledge Sharing Gap",
        description: "Analysis shows that expertise in 'React Development' is concentrated among 2 team members. Consider knowledge sharing sessions to distribute expertise.",
        impact: "medium",
        expertise: "React Development",
        experts: 2,
        teamSize: 8
      }
    ];
    
    res.json(insights);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch insights", details: err.message });
  }
});

// Get team performance metrics
router.get("/team-performance", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = "30d" } = req.query;
    
    let daysBack = 30;
    if (timeRange === "7d") daysBack = 7;
    if (timeRange === "90d") daysBack = 90;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    // Get team members (users in same conversations)
    const userConversations = await Conversation.find({ 
      participants: userId 
    }).populate("participants", "name email stats");
    
    const teamMembers = new Set();
    userConversations.forEach(conv => {
      conv.participants.forEach(participant => {
        if (participant._id.toString() !== userId) {
          teamMembers.add(JSON.stringify({
            id: participant._id,
            name: participant.name,
            email: participant.email,
            stats: participant.stats
          }));
        }
      });
    });
    
    const performance = {
      teamSize: teamMembers.size + 1,
      averageResponseTime: "2.3 min",
      averageClarityScore: "87%",
      engagementRate: "94%",
      goalCompletionRate: "76%",
      topPerformers: Array.from(teamMembers).slice(0, 3).map(member => {
        const parsed = JSON.parse(member);
        return {
          name: parsed.name,
          clarityScore: parsed.stats.averageClarityScore || Math.floor(Math.random() * 20) + 80,
          contributionScore: Math.floor(Math.random() * 30) + 70
        };
      })
    };
    
    res.json(performance);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch team performance", details: err.message });
  }
});

// Get knowledge graph data
router.get("/knowledge-graph", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Mock knowledge graph data (implement actual topic extraction and relationship mapping)
    const knowledgeGraph = {
      nodes: [
        { id: "react", label: "React", type: "technology", size: 30, expertise: 0.9 },
        { id: "nodejs", label: "Node.js", type: "technology", size: 25, expertise: 0.8 },
        { id: "database", label: "Database", type: "concept", size: 20, expertise: 0.7 },
        { id: "api", label: "API Design", type: "concept", size: 22, expertise: 0.75 },
        { id: "testing", label: "Testing", type: "practice", size: 18, expertise: 0.6 },
        { id: "deployment", label: "Deployment", type: "practice", size: 15, expertise: 0.5 }
      ],
      edges: [
        { source: "react", target: "nodejs", strength: 0.8 },
        { source: "nodejs", target: "database", strength: 0.7 },
        { source: "nodejs", target: "api", strength: 0.9 },
        { source: "react", target: "testing", strength: 0.6 },
        { source: "api", target: "testing", strength: 0.5 },
        { source: "nodejs", target: "deployment", strength: 0.4 }
      ],
      experts: [
        { topic: "react", users: ["John Doe", "Jane Smith"] },
        { topic: "nodejs", users: ["Mike Johnson", "Sarah Wilson"] },
        { topic: "database", users: ["David Brown"] }
      ]
    };
    
    res.json(knowledgeGraph);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch knowledge graph", details: err.message });
  }
});

module.exports = router;
