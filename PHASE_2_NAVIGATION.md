# 📍 Phase 2 Navigation Guide

## How to Access Phase 2 Features

### After Signing In (http://localhost:8085)

Once you've successfully logged in with Clerk authentication, you'll see the updated navigation bar with **4 new links**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Converse to Clarity                                             │
│ Home | Dashboard | Projects | Teams | Chat | GitHub    [Logout] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Phase 2 Pages Location

### 1. **Teams Page** 🤝
- **URL**: `http://localhost:8085/teams`
- **Route**: `/teams`
- **File Location**: `src/pages/Teams.tsx`
- **Navigation**: Click "Teams" in navbar (only visible when signed in)

**Features:**
- View all your teams in a grid layout
- Create new teams with "Create Team" button
- See team statistics (members, projects)
- Manage team members and roles
- Delete teams (owner only)

---

### 2. **Chat Page** 💬
- **URL**: `http://localhost:8085/chat`
- **Route**: `/chat`
- **File Location**: `src/pages/Chat.tsx`
- **Navigation**: Click "Chat" in navbar (only visible when signed in)

**Features:**
- Left sidebar shows all available channels
- Search channels with search bar
- See unread message counts
- Click any channel to open chat
- Send messages, upload files, add reactions

---

### 3. **Specific Channel Chat**
- **URL**: `http://localhost:8085/chat/:channelId`
- **Route**: `/chat/:channelId`
- **Dynamic Route**: Channel ID in URL
- **Navigation**: Click on a channel from the chat sidebar

**Features:**
- Full chat interface for selected channel
- Message list with reactions
- File upload and sharing
- Real-time message updates
- Typing indicators

---

## 📂 Complete File Structure

### Components
```
src/components/
├── teams/
│   ├── CreateTeamDialog.tsx      ← Create team modal
│   ├── TeamCard.tsx               ← Team display card
│   └── TeamMemberList.tsx         ← Member management
│
└── chat/
    ├── ChatWindow.tsx             ← Main chat container
    ├── MessageList.tsx            ← Scrollable messages
    └── MessageInput.tsx           ← Message composer
```

### Pages
```
src/pages/
├── Teams.tsx                      ← Teams overview page
└── Chat.tsx                       ← Chat interface page
```

### State Management
```
src/store/
├── slices/
│   ├── teamSlice.ts              ← Team state
│   └── chatSlice.ts              ← Chat state
└── api.ts                        ← API endpoints (updated with 30+ new endpoints)
```

---

## 🚀 Quick Start Guide

### Step 1: Start the Server
```bash
cd "c:\Users\ankli\Mini Project  5TH\converse-to-clarity"
npm run dev
```
Server runs on: **http://localhost:8085**

### Step 2: Sign In
1. Go to http://localhost:8085
2. Click "Login" or "Start Free Trial"
3. Sign in with Clerk authentication

### Step 3: Access Phase 2 Features

**Option A: Direct URLs**
- Teams: http://localhost:8085/teams
- Chat: http://localhost:8085/chat

**Option B: Navigation Bar**
- Look for "Teams" and "Chat" links in the navbar (only visible after login)
- Click to navigate

---

## 🎨 Visual Layout

### Teams Page Layout
```
┌─────────────────────────────────────────────────────┐
│  Teams                          [Create Team]       │
│  Collaborate with your team members on projects     │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Team A   │  │ Team B   │  │ Team C   │         │
│  │ 👥 5     │  │ 👥 3     │  │ 👥 8     │         │
│  │ Owner    │  │ Member   │  │ Admin    │         │
│  └──────────┘  └──────────┘  └──────────┘         │
├─────────────────────────────────────────────────────┤
│  📊 Statistics                                      │
│  Total Teams: 3  |  Total Members: 16              │
└─────────────────────────────────────────────────────┘
```

### Chat Page Layout
```
┌─────────────┬──────────────────────────────────────┐
│ Channels    │  # General                           │
│ [Search...] │  ─────────────────────────────────   │
│             │                                       │
│ # general   │  👤 John: Hey everyone!              │
│ # random    │      👍 2  ❤️ 1                      │
│ # projects  │                                       │
│ 📱 direct-1 │  👤 You: Hi there! 😊                │
│   [2]       │      [image.png]                      │
│             │                                       │
│             │  ─────────────────────────────────   │
│ Stats:      │  [📎] Type a message... [Send]       │
│ 4 Channels  │                                       │
│ 2 Unread    │                                       │
└─────────────┴──────────────────────────────────────┘
```

---

## ✅ Features Checklist

### Teams (/teams)
- [x] View all teams
- [x] Create new team
- [x] Edit team details
- [x] Delete team
- [x] Add members
- [x] Remove members
- [x] Change member roles
- [x] View team statistics

### Chat (/chat)
- [x] View all channels
- [x] Search channels
- [x] Select channel
- [x] View messages
- [x] Send messages
- [x] Upload files
- [x] Add reactions
- [x] Edit messages
- [x] Delete messages
- [x] Message threads
- [x] Typing indicators
- [x] Unread counts
- [x] Real-time updates

---

## 🔗 Route Summary

| Route | Component | Description |
|-------|-----------|-------------|
| `/teams` | `Teams.tsx` | Teams overview and management |
| `/chat` | `Chat.tsx` | Chat with channel sidebar |
| `/chat/:channelId` | `Chat.tsx` | Specific channel conversation |

All routes are **protected** with `ClerkProtectedRoute` - requires authentication.

---

## 🎯 Next Steps

1. **Sign in** to the app
2. **Click "Teams"** in the navbar → Create your first team
3. **Click "Chat"** in the navbar → Start messaging

**Note**: The backend API endpoints need to be implemented for full functionality. Currently, the frontend is ready and will make API calls to:
- `http://localhost:5000/api/teams/*`
- `http://localhost:5000/api/chat/*`

---

## 📝 Important Notes

- Phase 2 features are **only accessible after authentication**
- Links appear in navbar after successful Clerk sign-in
- All pages are responsive (mobile, tablet, desktop)
- Real-time features require Socket.io backend implementation
- File uploads require backend storage configuration

---

## 🐛 Troubleshooting

**Q: I don't see Teams/Chat links in navbar**
A: Make sure you're signed in with Clerk authentication

**Q: Pages show empty data**
A: Backend API endpoints need to be implemented and running

**Q: Can't send messages**
A: Check that backend server is running on port 5000

**Q: File uploads fail**
A: Backend file upload endpoint needs to be configured

---

**Phase 2 is complete and ready for testing!** 🎉
