# Converse to Clarity API Documentation

## 🚀 **Professional Communication Analytics Backend**

A comprehensive backend system for analyzing team communications, tracking goals, and providing AI-powered insights.

---

## **Base URL**
```
http://localhost:5000/api
```

---

## **Authentication**

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### **Auth Endpoints**

#### **POST /auth/register**
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "securePassword123"
}
```

#### **POST /auth/login**
Login user
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

---

## **User Management**

### **GET /users/profile**
Get current user profile (Protected)

### **PUT /users/profile**
Update user profile (Protected)
```json
{
  "name": "John Doe Updated",
  "profile": {
    "department": "Engineering",
    "position": "Senior Developer",
    "timezone": "PST"
  }
}
```

### **PATCH /users/preferences**
Update user preferences (Protected)
```json
{
  "notifications": true,
  "emailAlerts": false,
  "theme": "dark"
}
```

### **GET /users/stats**
Get user statistics (Protected)

### **GET /users/team**
Get team members (Protected)

---

## **Conversations**

### **GET /conversations**
Get user's conversations (Protected)
- Query params: `page`, `limit`, `status`, `priority`

### **GET /conversations/:id**
Get specific conversation (Protected)

### **POST /conversations**
Create new conversation (Protected)
```json
{
  "title": "Project Planning Discussion",
  "participants": ["userId1", "userId2"],
  "initialMessage": "Let's discuss the project timeline"
}
```

### **POST /conversations/:id/messages**
Add message to conversation (Protected)
```json
{
  "content": "I think we should focus on the MVP first"
}
```

### **GET /conversations/:id/metrics**
Get conversation metrics (Protected)

### **PATCH /conversations/:id/status**
Update conversation status (Protected)
```json
{
  "status": "completed"
}
```

---

## **Goals Management**

### **GET /goals**
Get user's goals (Protected)
- Query params: `status`, `priority`

### **GET /goals/:id**
Get specific goal (Protected)

### **POST /goals**
Create new goal (Protected)
```json
{
  "title": "Improve Team Communication Clarity",
  "description": "Increase average clarity score to 90%",
  "targetMetric": {
    "type": "clarity_score",
    "target": 90,
    "unit": "percentage"
  },
  "deadline": "2024-12-31",
  "priority": "high",
  "team": ["userId1", "userId2"]
}
```

### **PUT /goals/:id**
Update goal (Protected)

### **PATCH /goals/:id/progress**
Update goal progress (Protected)
```json
{
  "current": 75
}
```

### **POST /goals/:id/milestones**
Add milestone to goal (Protected)
```json
{
  "title": "Phase 1 Complete",
  "description": "Complete initial assessment",
  "targetDate": "2024-11-30"
}
```

### **PATCH /goals/:id/milestones/:milestoneId/complete**
Mark milestone as completed (Protected)

### **DELETE /goals/:id**
Delete goal (Protected)

---

## **Analytics & Insights**

### **GET /analytics/overview**
Get dashboard overview metrics (Protected)
```json
{
  "totalConversations": {
    "value": 2847,
    "change": 12.5,
    "changeLabel": "+12.5% from last month"
  },
  "clarityScore": {
    "value": "87%",
    "change": 5.2,
    "changeLabel": "+5.2% improvement"
  },
  "activeUsers": {
    "value": 1249,
    "change": -2.1,
    "changeLabel": "-2.1% from last week"
  },
  "goalsAchieved": {
    "value": 156,
    "change": 23.8,
    "changeLabel": "+23.8% this quarter"
  }
}
```

### **GET /analytics/charts**
Get chart data for visualizations (Protected)
- Query params: `timeRange` (7d, 30d, 90d)

### **GET /analytics/sentiment**
Get sentiment analysis data (Protected)
- Query params: `timeRange`

### **GET /analytics/insights**
Get AI-powered insights and recommendations (Protected)
```json
[
  {
    "type": "improvement",
    "title": "Meeting Efficiency Opportunity",
    "description": "Your team meetings could benefit from clearer agenda setting...",
    "impact": "high",
    "actionItems": ["Create meeting agenda templates", "Set time limits"],
    "estimatedImprovement": "15% reduction in meeting time"
  }
]
```

### **GET /analytics/team-performance**
Get team performance metrics (Protected)

### **GET /analytics/knowledge-graph**
Get knowledge graph data (Protected)
```json
{
  "nodes": [
    {
      "id": "react",
      "label": "React",
      "type": "technology",
      "size": 30,
      "expertise": 0.9
    }
  ],
  "edges": [
    {
      "source": "react",
      "target": "nodejs",
      "strength": 0.8
    }
  ],
  "experts": [
    {
      "topic": "react",
      "users": ["John Doe", "Jane Smith"]
    }
  ]
}
```

---

## **System Endpoints**

### **GET /**
Root endpoint with API information

### **GET /api**
API documentation endpoint

### **GET /api/health**
Health check endpoint
```json
{
  "status": "ok",
  "timestamp": "2024-09-07T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

---

## **Data Models**

### **User Schema**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ["user", "admin", "manager"],
  profile: {
    avatar: String,
    department: String,
    position: String,
    timezone: String,
    preferences: {
      notifications: Boolean,
      emailAlerts: Boolean,
      theme: ["light", "dark", "auto"]
    }
  },
  stats: {
    totalConversations: Number,
    averageClarityScore: Number,
    averageSentiment: Number,
    goalsCompleted: Number,
    lastActive: Date
  },
  expertise: [String],
  isActive: Boolean,
  timestamps: true
}
```

### **Conversation Schema**
```javascript
{
  title: String,
  participants: [ObjectId],
  messages: [{
    sender: ObjectId,
    content: String,
    timestamp: Date,
    sentiment: {
      score: Number (-1 to 1),
      label: ["positive", "neutral", "negative"]
    },
    clarity: {
      score: Number (0 to 100),
      issues: [String]
    }
  }],
  metrics: {
    totalMessages: Number,
    averageSentiment: Number,
    clarityScore: Number,
    participationRate: Number,
    responseTime: Number,
    blockers: [Object]
  },
  status: ["active", "completed", "stalled", "archived"],
  priority: ["low", "medium", "high", "urgent"],
  timestamps: true
}
```

### **Goal Schema**
```javascript
{
  title: String,
  description: String,
  owner: ObjectId,
  team: [ObjectId],
  targetMetric: {
    type: ["clarity_score", "response_time", "sentiment", "participation", "custom"],
    target: Number,
    current: Number,
    unit: String
  },
  deadline: Date,
  priority: ["low", "medium", "high"],
  status: ["draft", "active", "completed", "paused", "cancelled"],
  progress: Number (0-100),
  milestones: [Object],
  timestamps: true
}
```

---

## **Error Responses**

All errors follow this format:
```json
{
  "error": "Error description",
  "details": "Detailed error message (in development)",
  "path": "/api/endpoint",
  "method": "GET"
}
```

### **Common HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## **Features**

✅ **Professional Authentication & Authorization**
✅ **Comprehensive User Management**
✅ **Advanced Conversation Analytics**
✅ **Goal Tracking & Progress Monitoring**
✅ **AI-Powered Insights & Recommendations**
✅ **Real-time Metrics & KPIs**
✅ **Team Performance Analytics**
✅ **Knowledge Graph & Expertise Mapping**
✅ **Sentiment Analysis**
✅ **Professional Error Handling**
✅ **Comprehensive API Documentation**
✅ **Health Monitoring**
✅ **Graceful Shutdown**

---

## **Environment Variables**

```env
MONGO_URI=mongodb://localhost:27017/converse-to-clarity
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
```

---

## **Getting Started**

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access API**
   - API Root: http://localhost:5000/
   - Documentation: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

The backend now provides enterprise-grade functionality to support your professional dashboard frontend!
