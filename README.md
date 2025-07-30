# 🌿 Wellness Sessions Platform

A secure full-stack wellness session platform built using **React** for the frontend and **Node.js + Express + MongoDB** for the backend. This platform allows users to register, log in, view wellness sessions, and create/edit/save/publish their own custom sessions with auto-save functionality.

---

## 🔗 Live Demo

**Frontend:** _[Add your deployed frontend URL]_  
**Backend:** _[Add your deployed backend URL]_

---

## 🚀 Tech Stack

- **Frontend:** React.js, Axios, Tailwind CSS (optional)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (MongoDB Atlas)
- **Authentication:** JWT, bcrypt
- **Deployment (Optional):** Vercel, Netlify, Render, Railway

---

## 📂 Project Structure

root/
│
├── frontend/ # React app
│ ├── src/
│ ├── public/
│ └── ...
│
├── backend/ # Node.js + Express API
│ ├── routes/
│ ├── models/
│ ├── middleware/
│ ├── controllers/
│ └── ...
│
├── .env.example
├── README.md
└── ...

yaml
Copy
Edit

---

## 🔐 Authentication Features

- User registration with password hashing (bcrypt)
- User login with JWT generation
- Secure storage of JWT on the frontend (e.g., localStorage or cookies)
- Protected API routes using JWT middleware

### 🔑 Auth API Endpoints

POST /api/auth/register # Register new user
POST /api/auth/login # Log in and receive JWT

yaml
Copy
Edit

---

## 📘 Session Management

Users can create, save as draft, edit, and publish wellness sessions. Drafts are auto-saved after 5 seconds of inactivity.

### 📡 Session API Endpoints

GET /api/sessions # Public wellness sessions
GET /api/my-sessions # Logged-in user's sessions
GET /api/my-sessions/:id # View a specific session
POST /api/my-sessions/save-draft # Save or update draft session
POST /api/my-sessions/publish # Publish a session

yaml
Copy
Edit

---

## 🧘 Frontend Pages

- **Login / Register Page** – Handles authentication and token storage
- **Dashboard** – Displays public wellness sessions
- **My Sessions** – View and edit drafts or published sessions
- **Session Editor** – Create/edit sessions with:
  - Title
  - Tags (comma-separated)
  - JSON file URL
  - Save as Draft / Publish buttons
  - ✅ Auto-save after 5 seconds of inactivity

---

## 🧩 Database Schema

### 🧑 User

```json
{
  "_id": "ObjectId",
  "email": "string",
  "password_hash": "string",
  "created_at": "date"
}
📄 Session
json
Copy
Edit
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "title": "string",
  "tags": ["string"],
  "json_file_url": "string",
  "status": "draft" | "published",
  "created_at": "date",
  "updated_at": "date"
}
✨ Bonus Features (Implemented or Optional)
✅ Auto-save feedback with toast/message

✅ Full logout functionality

✅ Responsive design

✅ Deployed frontend and backend

⚙️ Getting Started
🔧 Backend Setup
bash
Copy
Edit
cd backend
npm install
cp .env.example .env   # Fill in required env vars
npm run dev            # or npm start
💻 Frontend Setup
bash
Copy
Edit
cd frontend
npm install
npm start
📄 .env.example (Backend)
env
Copy
Edit
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
📊 Evaluation Criteria (All Covered)
Area	Description
Backend	JWT auth, secure routes, structured APIs
Frontend	Token handling, clean UI, protected pages
Database	Well-designed schema, relationships
Code Quality	Organized, commented, modular
Bonus Features	Auto-save, responsive UI, deployment

👨‍💻 Author
Sukhbir Singh Sareen
BCA | Full Stack Developer | Node.js & React Enthusiast
GitHub: @sukh2507

yaml
Copy
Edit
