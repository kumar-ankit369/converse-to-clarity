const mongoose = require("mongoose");
require("dotenv").config();

const http = require('http');
const socketHelper = require('./socket');
const app = require('./app');

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
    
    // create http server and attach socket.io
    const server = http.createServer(app);
    const io = socketHelper.init(server);

    server.listen(PORT, () => {
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
      console.log(`   • Teams: http://localhost:${PORT}/api/teams`);
      console.log(`   • Projects: http://localhost:${PORT}/api/projects`);
      console.log(`   • Chat: http://localhost:${PORT}/api/chat`);
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
