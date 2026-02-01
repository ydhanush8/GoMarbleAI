# GoMarble Analytics - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Set Up Environment Variables

#### Backend
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add:
- Your Neon PostgreSQL `DATABASE_URL`
- Your Clerk keys (`CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`)

Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Add it as `TOKEN_ENCRYPTION_KEY`

#### Frontend
```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local` and add:
- Your Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)

### Step 2: Initialize Database

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

This will create all database tables.

### Step 3: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 4: Test Authentication

1. Open http://localhost:3000
2. Click "Get Started"
3. Sign up with email
4. You'll be redirected to `/workspace/select` (page coming soon!)

---

## 🎯 What Works Right Now

✅ Landing page with premium design  
✅ Sign up / Sign in with Clerk  
✅ Backend API running on port 5000  
✅ Database schema created  
✅ User sync from Clerk to PostgreSQL  
✅ Workspace CRUD operations  

## 🚧 Coming Next

- Workspace selection UI
- OAuth integration screens
- Dashboard with analytics
- AI chat for insights

---

## 🔧 Troubleshooting

### "DATABASE_URL not found"
Make sure you've created `.env` in the backend folder and added your Neon connection string.

### "Module not found" errors
Run `npm install` in both frontend and backend directories.

### Clerk errors
Double-check your API keys in `.env` (backend) and `.env.local` (frontend).

### Port already in use
- Backend: Change `PORT` in backend `.env`
- Frontend: Next.js will auto-select port 3001 if 3000 is busy

---

## 📚 Resources

- [Full README](../README.md)
- [Walkthrough](./walkthrough.md)
- [Clerk Docs](https://clerk.dev/docs)
- [Neon Docs](https://neon.tech/docs)
- [Prisma Docs](https://www.prisma.io/docs)
