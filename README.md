# TaskFlow Team Task Manager

A production-grade, full-stack team task manager built for the Ethara.AI Round 1 placement selection process.

## Features
- **Secure Authentication:** JWT with HttpOnly cookies, refresh token rotation, rate limiting, and CAPTCHA support.
- **Role-Based Access Control:** Admin and Member roles with secure backend middleware.
- **Project & Task Management:** Create projects, invite team members, assign tasks, and track statuses.
- **Interactive Dashboard:** Modern UI built with Next.js, Tailwind CSS, ShadCN, and Framer Motion.
- **Robust Security:** Built-in protection against brute-force attacks, XSS, MongoDB injection, and more.

## Tech Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, ShadCN/UI, Zustand, Axios, Framer Motion.
- **Backend:** Node.js, Express.js, TypeScript, Mongoose.
- **Database:** MongoDB Atlas.
- **Deployment:** Railway.


## Folder Structure
- `/frontend` - Next.js application
- `/backend` - Express.js API

## Deployment to Railway

This is a monorepo. To deploy to Railway:

1. **Deploy Backend Service:**
   - Create a new service from this repo.
   - Set **Root Directory** to `backend`.
   - Add Environment Variables:
     - `MONGO_URI`: (Your MongoDB Atlas connection string)
     - `JWT_SECRET`: (Any secure random string)
     - `FRONTEND_URL`: (Your frontend domain after deploying step 2)

2. **Deploy Frontend Service:**
   - Create another service from this repo.
   - Set **Root Directory** to `frontend`.
   - Add Environment Variables:
     - `NEXT_PUBLIC_API_URL`: (Your backend domain + `/api`)

3. **Networking:**
   - Ensure both services have "Generate Domain" enabled in the Networking tab.
   - Update the `FRONTEND_URL` in the backend service with the domain generated for the frontend.
