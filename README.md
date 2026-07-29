# ⚽ WorldCupX — Intelligent FIFA World Cup Analytics & AI Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.2-lightgrey?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)](https://world-cup-x-client.vercel.app)

> **WorldCupX** is a modern, high-performance web platform designed for football enthusiasts, tactical analysts, and FIFA World Cup fans. It combines real-time data exploration of national teams and top players with an AI-driven Tactical Assistant powered by Google Gemini AI.

---

## 🌟 Live Demo & Deployments

- 🌐 **Frontend App**: [https://world-cup-x-client.vercel.app](https://world-cup-x-client.vercel.app)
- ⚙️ **Backend REST API**: [https://world-cup-x.vercel.app/api/v1](https://world-cup-x.vercel.app)

---

## 🔥 Key Features

### 1. 🤖 WorldCupX General AI Tactical Assistant
- **Context-Aware Football QA**: Powered by Google Gemini AI (`gemini-flash-latest`), answering tactical queries, rules (e.g., offside mechanics, VAR), and squad breakdowns.
- **Dynamic Suggested Prompts**: Contextually relevant football questions dynamically rendered across pages.
- **Stream Response Architecture**: Low-latency, streaming answers with automated fallback mechanisms.

### 2. 🏆 FIFA National Teams & Top Players Directory
- **National Squad Profiles**: Detailed metrics including FIFA rankings, head coach, historical titles, confederations, and tactical formations.
- **Top Players Management**: Explore player profiles, current clubs, playing positions, goal tallies, and caps.
- **Interactive Likes & Favorites**: Users can like or bookmark their favorite teams and players.

### 3. 📊 AI Match Outcome Predictor
- Simulate upcoming World Cup fixtures by selecting two national teams.
- Input custom match conditions (team form, injuries, venue, weather).
- Receive AI-generated win probabilities, expected goals (xG), key match threats, and confidence scores.

### 4. 🔔 Real-Time Notification & Alert System
- **In-App Notification Center**: Bell indicator with unread badges, smooth shake animations, and Web Audio API chime sounds.
- **Admin Alert System**: Automatic notifications dispatched to admins when new users register, submit teams/players, or like content.
- **Activity Log**: Tracks login timestamps, post approvals/rejections, and security alerts.

### 5. 🛡️ Role-Based Access & Admin Panel
- **User Dashboard**: Personalized dashboard with favorited teams, players, and interactive AI widgets.
- **Admin Management Portal**: Exclusive capabilities to manage teams, edit player profiles, issue warnings, and moderate community submissions.

---

## 🏗️ Tech Stack & Architecture

### **Frontend (Client)**
- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4 (Vanilla CSS glassmorphism & dark aesthetic)
- **State & Data Fetching**: TanStack React Query v5
- **Authentication**: Better Auth Session Management + JWT fallback
- **Icons & UI**: Lucide React Icons & Recharts

### **Backend (Server)**
- **Runtime**: Node.js + Express.js v5 (TypeScript)
- **Database**: MongoDB Atlas via Mongoose ODM
- **AI Integration**: `@google/generative-ai` SDK with candidate model fallback
- **Security & Middleware**: CORS, JWT token verification, custom MongoDB session matching

---

## 📁 Repository Structure

```text
documind-worldcupx/
├── documind/                  # Frontend (Next.js Application)
│   ├── src/
│   │   ├── app/               # Next.js App Router (Public & Dashboard pages)
│   │   ├── components/        # Reusable UI, Navbar, NotificationBell, AI Widgets
│   │   ├── hooks/             # Custom React hooks (useChat, useNotifications)
│   │   ├── providers/         # Auth & React Query providers
│   │   └── services/          # API fetch wrappers & endpoints
│   └── public/                # Static assets & branding logos
│
└── documind_server/           # Backend REST API (Express + MongoDB)
    ├── src/
    │   ├── ai/                # Gemini AI prompts, templates & agents
    │   ├── config/            # Database & Gemini AI setup
    │   ├── controllers/       # Team, Player, Auth, AI & Notification logic
    │   ├── middleware/        # Auth verification & error handling
    │   ├── models/            # Mongoose Schemas (User, Team, Player, Notification)
    │   └── routes/            # Express API endpoint definitions
    └── vercel.json            # Serverless Vercel deployment configuration
```

---

## 🚀 Quick Start & Local Setup

### **Prerequisites**
- Node.js (v18+ recommended)
- MongoDB Connection URI (Atlas or Local)
- Google Gemini API Key

---

### **1. Backend Setup (`documind_server`)**

```bash
# Navigate to backend directory
cd documind_server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Configure your `documind_server/.env`:
```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/worldcup
JWT_SECRET=your_jwt_secret_key
BETTER_AUTH_SECRET=your_better_auth_secret
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your_google_gemini_api_key
```

Run the backend development server:
```bash
npm run dev
# Server will start on http://localhost:8000
```

---

### **2. Frontend Setup (`documind`)**

```bash
# Navigate to frontend directory
cd documind

# Install dependencies
npm install

# Create .env file
```

Configure your `documind/.env`:
```env
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Run the frontend development server:
```bash
npm run dev
# App will start on http://localhost:3000
```

---

## 🌐 API Endpoint Highlights

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/teams` | List all FIFA national teams | Public |
| `GET` | `/api/v1/players` | List all top football players | Public |
| `POST` | `/api/v1/chats/message/stream` | Stream response from Gemini Football AI | Authenticated |
| `POST` | `/api/v1/predictions/predict` | Generate AI match outcome prediction | Public / User |
| `GET` | `/api/v1/notifications` | Fetch real-time user/admin notifications | Authenticated |
| `POST` | `/api/v1/players/:id/like` | Like or unlike a player profile | Authenticated |
| `POST` | `/api/v1/auth/notify-register` | Trigger welcome & admin register alert | Public |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check out the [issues page](https://github.com/najibatakarrum/WorldCupX/issues).

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.

---

<p align="center">
Made with ❤️ for Football & FIFA World Cup Fans worldwide! ⚽
</p>
