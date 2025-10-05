# MongoDB Setup for converse-to-clarity

## 1. Local Development

- Install MongoDB locally: https://www.mongodb.com/try/download/community
- Start MongoDB server (default: `mongodb://localhost:27017`)
- Create a database named `converse-to-clarity` (it will be auto-created on first write)

## 2. Using MongoDB Atlas (Cloud)

- Go to https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Add a database user and get your connection string (e.g. `mongodb+srv://<user>:<password>@cluster0.mongodb.net/converse-to-clarity?retryWrites=true&w=majority`)
- Add your connection string to a `.env` file in `backend/`:

```
MONGO_URI=your_connection_string_here
```

## 3. Environment Variables

Create a `.env` file in the `backend/` folder:

```
MONGO_URI=mongodb://localhost:27017/converse-to-clarity
JWT_SECRET=your_jwt_secret
```

## 4. Start the Backend

From the `backend/` folder:

```
npm install
npm run dev
```

Or from the root, if you have a monorepo setup:

```
cd backend
npm install
npm run dev
```

---

- The backend will auto-connect to MongoDB using the URI in `.env`.
- If no `.env` is found, it will try a demo Atlas connection.
- For production, always use your own Atlas cluster and strong secrets.
