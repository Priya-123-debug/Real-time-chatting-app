# Talkie — Real-Time Chat App

A real-time one-on-one messaging app built on the MERN stack with Socket.IO, featuring Google OAuth login, typing indicators, online presence, media sharing, and message management.

---

## Features

- **Google OAuth login** — sign in with Google via Passport.js, no separate password flow
- **Real-time messaging** powered by Socket.IO — messages deliver instantly across all of a user's active devices
- **Typing indicators** — live "typing..." status between users
- **Online presence** — see who's currently online
- **Media sharing** — send images/files in chat, stored via Cloudinary
- **Message controls** — delete a message for yourself, clear an entire conversation, mark messages as seen
- **User search** — find and start conversations with other users
- **Editable profile** — update profile picture and details

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Tailwind CSS, Vite, Socket.IO client |
| Backend | Node.js, Express 5, Socket.IO |
| Database | MongoDB (Mongoose) |
| Auth | Passport.js (Google OAuth 2.0), JWT |
| Media Storage | Cloudinary, Multer |
| Deployment | Vercel (client) |

---

## Project Structure

```
Real-time-chatting-app/
├── client/
│   └── src/
│       ├── components/       # Sidebar, chat container, right sidebar
│       │   └── hooks/        # useChatEffects
│       ├── context/          # Auth, Chat, and Socket context providers
│       ├── hooks/             # useChat, useScrollToBottom
│       ├── pages/             # HomePage, LoginPage, ProfilePage
│       ├── services/          # API calls (auth, users, messages)
│       └── utilis/            # Constants, avatar helper, time formatting
│
└── server/
    ├── config/                # DB connection, Cloudinary, Passport strategy
    ├── controllers/           # Auth, message, and user logic
    ├── middleware/            # Route protection, file uploads, error handling
    ├── models/                # User, Message, ChatClear schemas
    ├── routes/                 # API route definitions
    ├── socket/                 # Socket.IO server — presence, typing, real-time events
    ├── utils/                  # Token generation, Cloudinary upload helper
    └── server.js                # App entry point
```

---

## API Overview

| Resource | Base Path | Endpoints |
|---|---|---|
| Auth | `/api/auth` | `google`, `google/callback`, `me`, `logout` |
| Users | `/api/users` | `/` (list), `search`, `profile` (update) |
| Messages | `/api/messages` | `/:userId` (get conversation), `send/:userId`, `/:messageId` (delete for me), `clear/:userId`, `seen/:userId` |

All routes except the Google OAuth redirect require an authenticated session (JWT cookie).

### Socket Events
| Event | Direction | Purpose |
|---|---|---|
| `getOnlineUsers` | server → client | Broadcast current online users |
| `openConversation` / `closeConversation` | client → server | Track which conversation a user has open |
| `typingStart` / `typingStop` | both | Typing indicator relay |

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- A MongoDB database (local or Atlas)
- A Google Cloud OAuth 2.0 client (Client ID/Secret)
- A Cloudinary account

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Real-time-chatting-app
```

### 2. Set up the backend
```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Run the backend:
```bash
npm run dev      # nodemon (development)
npm start        # production
```

### 3. Set up the frontend
```bash
cd ../client
npm install
```

Create a `.env` file inside `client/`:
```env
VITE_API_URL=http://localhost:5000
```

Run the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`, talking to the API/socket server at `http://localhost:5000`.

> **Note:** Vite inlines environment variables at build time — redeploy the frontend after changing `VITE_API_URL`.

---

## Deployment Notes

- **Google OAuth:** `GOOGLE_CALLBACK_URL` must exactly match an authorized redirect URI configured in the Google Cloud Console, and must be updated for the production domain.
- **Cross-domain cookies:** since JWT auth uses cookies, `CLIENT_URL` and CORS must be correctly set, and cookies should use `SameSite=None; Secure` in production so auth persists across the frontend/backend domains.
- **Socket.IO CORS:** the Socket.IO server's CORS origin is also tied to `CLIENT_URL` — keep it in sync with the deployed frontend URL.

---

## Roadmap
- [ ] Group chat support
- [ ] Message reactions
- [ ] Push notifications

---

