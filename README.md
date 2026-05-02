# 🚀 Ethara.AI / Flowgrid Task Manager

A production-grade, full-stack team task manager built for the **Ethara.AI Round 1** placement selection process. Flowgrid is designed to streamline project management, role-based task delegation, and timeline tracking.

## ✨ Features
- **Secure Authentication:** JWT with HttpOnly cookies, refresh token rotation, rate limiting, and protection against common web vulnerabilities (XSS, MongoDB Injection).
- **Role-Based Access Control (RBAC):** Admin and Member roles with secure, verified backend middleware routing.
- **Project & Task Management:** Create and track projects, invite team members, assign tasks with rich details, and manage lifecycle statuses.
- **Interactive & Dynamic Dashboard:** Modern, fluid UI built with React 19, Next.js App Router, Tailwind CSS 4, and Framer Motion for micro-animations.
- **Type-Safe Full Stack:** End-to-end TypeScript safety with Zod for robust data validation.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, ShadCN UI
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Data Fetching & Validation:** Axios, Zod, React Hook Form

### **Backend**
- **Framework:** Node.js, Express.js v5
- **Language:** TypeScript
- **Database:** MongoDB Atlas + Mongoose
- **Security:** Helmet, Express Rate Limit, Express Mongo Sanitize, bcrypt, jsonwebtoken

---

## 📁 Folder Structure

```text
Ethara AI/
├── backend/            # Express.js API server
│   ├── src/
│   │   ├── controllers/# Route handlers
│   │   ├── middleware/ # Auth, RBAC, error handling
│   │   ├── models/     # Mongoose schemas
│   │   ├── routes/     # Express routes
│   │   └── server.ts   # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/           # Next.js web application
│   ├── src/
│   │   ├── app/        # Next.js App Router
│   │   ├── components/ # Reusable UI components
│   │   ├── store/      # Zustand stores
│   │   └── lib/        # Utility functions & Axios config
│   ├── package.json
│   └── tailwind.config.ts
└── package.json        # Workspace root package
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (v20+ recommended)
- MongoDB Atlas cluster (or local MongoDB instance)
- Git

### 2. Installation
Clone the repository and install dependencies from the root:
```bash
git clone <repository-url>
cd "Ethara AI"
npm install --prefix frontend
npm install --prefix backend
```

### 3. Environment Variables
Create a `.env` file in **both** the `frontend` and `backend` directories.

**`backend/.env`**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**`frontend/.env`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Running the Development Servers

**Start the Backend:**
```bash
cd backend
npm run dev
```

**Start the Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:3000`.

---

## ☁️ Deployment (Railway)

This repository is structured as a monorepo. Follow these steps to deploy to Railway:

### 1. Deploy Backend Service
1. Create a new service from this repo on Railway.
2. Set **Root Directory** to `backend`.
3. Add the required Environment Variables (`MONGO_URI`, `JWT_SECRET`, etc.).
4. Generate a public domain for the backend service.

### 2. Deploy Frontend Service
1. Create another service from the same repo.
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-railway-domain.com/api`
4. Generate a public domain for the frontend service.

### 3. Final Configuration
- Go back to the **Backend Service** and update the `FRONTEND_URL` environment variable to match your newly generated **Frontend Domain** to allow CORS.
