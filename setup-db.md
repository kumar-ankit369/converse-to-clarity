# Database Setup Instructions

## Option 1: MongoDB Atlas (Recommended - Free)

1. Go to https://www.mongodb.com/atlas
2. Create free account
3. Create a new cluster (free tier)
4. Get connection string
5. Create `.env` file in backend folder:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/converse-to-clarity?retryWrites=true&w=majority
JWT_SECRET=dev-secret-key-change-in-production
PORT=5000
```

## Option 2: Local MongoDB

1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Create `.env` file in backend folder:

```env
MONGO_URI=mongodb://localhost:27017/converse-to-clarity
JWT_SECRET=dev-secret-key-change-in-production
PORT=5000
```

## Option 3: Docker (if Docker Desktop is running)

```bash
docker run -d -p 27017:27017 --name mongodb-converse mongo:latest
```

Then use local connection string in `.env`:
```env
MONGO_URI=mongodb://localhost:27017/converse-to-clarity
JWT_SECRET=dev-secret-key-change-in-production
PORT=5000
```

## After setting up .env:

1. Stop current backend: Ctrl+C
2. Restart backend: `npm run dev:backend`
3. You should see "MongoDB Connected ✅" instead of "mock mode"
