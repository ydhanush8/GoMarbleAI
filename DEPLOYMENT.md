# 🚀 GoMarble Analytics - Deployment Checklist

## ✅ Pre-Deployment Verification

### Backend Dependencies ✅
- [x] express, cors, helmet, dotenv
- [x] @clerk/express (authentication)
- [x] @prisma/client (database ORM)
- [x] node-cron (background jobs)
- [x] axios (HTTP client)
- [x] @anthropic-ai/sdk (AI insights - optional)
- [x] All TypeScript types installed

### Frontend Dependencies ✅
- [x] next 16.1.6
- [x] @clerk/nextjs (authentication)
- [x] recharts (charts)
- [x] date-fns (date formatting)
- [x] lucide-react (icons)
- [x] tailwindcss (styling)

---

## 🔧 Environment Setup

### 1. Backend `.env` (Required)

```bash
cd backend
cp .env.example .env
```

**Fill in the following:**

```env
# Database - Neon PostgreSQL
DATABASE_URL=your_neon_connection_string

# Clerk Auth
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Token Encryption (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
TOKEN_ENCRYPTION_KEY=your_32_byte_hex_key

# Google Ads OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google/callback

# Meta Ads OAuth (Optional)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_REDIRECT_URI=http://localhost:5000/api/oauth/meta/callback

# Anthropic AI (Optional - for AI Insights)
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Frontend `.env.local` (Required)

```bash
cd frontend
cp .env.example .env.local
```

**Fill in:**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

---

## 📦 Installation Steps

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

**Verify these packages are installed:**
- node-cron@^4.2.1
- @types/node-cron@^3.0.11

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

**Verify these packages are installed:**
- recharts@^3.7.0
- date-fns@^4.1.0

### 3. Generate Prisma Client
```bash
cd backend
npm run prisma:generate
```

### 4. Run Database Migrations
```bash
cd backend
npm run prisma:migrate
```

**This creates:**
- Users table
- Workspaces table
- WorkspaceUsers (join table)
- Integrations table
- Campaigns table
- AdSets table (for future use)
- Ads table (for future use)
- DailyMetrics table

---

## 🎮 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Expected output:
```
🚀 Server running on port 5000
📱 Environment: development
📅 Google Ads sync scheduled (every 6 hours)
📅 Meta Ads sync scheduled (every 6 hours)
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Expected output:
```
▲ Next.js 16.1.6
- Local: http://localhost:3000
✓ Ready in 2.5s
```

---

## 🧪 Testing the Complete Flow

### Step 1: User Authentication ✅
1. Visit http://localhost:3000
2. Click "Sign In" or "Get Started"
3. Sign up with email/password or Google
4. Should redirect to workspace selection

### Step 2: Workspace Creation ✅
1. Click "Create New Workspace"
2. Enter workspace name (e.g., "My Agency")
3. Submit
4. Should redirect to dashboard

### Step 3: Connect Ad Accounts ✅
1. Go to Dashboard → Integrations
2. Click "Connect Google Ads"
3. Complete OAuth flow in popup
4. See "Connected" status with account ID
5. (Optional) Repeat for Meta Ads

### Step 4: Data Sync ✅
- **Automatic:** Jobs run every 6 hours
- **Manual Trigger:**
  ```typescript
  // In backend/src/index.ts, add temporarily:
  import { syncAllGoogleAds } from './jobs/syncGoogle.job';
  syncAllGoogleAds(); // Triggers immediately
  ```
- **Check logs:**
  ```
  🔄 Syncing X Google Ads integrations
  ✅ Normalized and stored Y campaigns and Z metrics
  ```

### Step 5: View Analytics ✅
1. **Dashboard Overview** (`/dashboard`)
   - Total Spend, Impressions, Clicks, Conversions
   - CTR, CPC, CPA, ROAS stats
   - Spend & Clicks trend charts
   - Date range filter (7/14/30/90 days)
   - Platform filter (All/Google/Meta)

2. **Campaigns Table** (`/dashboard/campaigns`)
   - Sortable columns (click headers)
   - Per-campaign metrics
   - Platform badges
   - Formatted currency

3. **AI Insights** (`/dashboard/insights`)
   - Coming soon page
   - Add ANTHROPIC_API_KEY to activate

---

## 🔍 API Endpoint Testing

### Test with cURL (replace tokens):

```bash
# Get auth token from Clerk
TOKEN="your_clerk_jwt_token"
WORKSPACE_ID="your_workspace_id"

# 1. Get metrics summary
curl "http://localhost:5000/api/metrics/summary?workspaceId=$WORKSPACE_ID" \
  -H "Authorization: Bearer $TOKEN"

# 2. Get campaign breakdown
curl "http://localhost:5000/api/metrics/campaigns?workspaceId=$WORKSPACE_ID&platform=google" \
  -H "Authorization: Bearer $TOKEN"

# 3. Get daily trends
curl "http://localhost:5000/api/metrics/trends?workspaceId=$WORKSPACE_ID&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"

# 4. Get integrations
curl "http://localhost:5000/api/oauth?workspaceId=$WORKSPACE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📁 File Structure Verification

### Backend Files ✅
```
backend/
├── src/
│   ├── adapters/
│   │   ├── google/ (client, fetcher, normalizer)
│   │   └── meta/ (client, fetcher, normalizer)
│   ├── config/ (database, clerk, encryption)
│   ├── controllers/ (auth, workspace, oauth, metrics)
│   ├── jobs/ (syncGoogle, syncMeta)
│   ├── middleware/ (auth, workspace, errorHandler)
│   ├── routes/ (auth, workspace, oauth, metrics)
│   ├── services/ (user, workspace, metrics)
│   ├── types/ (index.ts)
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── package.json (node-cron installed ✅)
└── .env (manually created)
```

### Frontend Files ✅
```
frontend/
├── app/
│   ├── dashboard/
│   │   ├── campaigns/page.tsx ✅
│   │   ├── insights/page.tsx ✅
│   │   ├── integrations/page.tsx ✅
│   │   ├── page.tsx (overview) ✅
│   │   └── layout.tsx ✅
│   ├── workspace/
│   │   ├── create/page.tsx ✅
│   │   └── select/page.tsx ✅
│   ├── sign-in/[[...sign-in]]/page.tsx ✅
│   ├── sign-up/[[...sign-up]]/page.tsx ✅
│   ├── page.tsx (landing) ✅
│   └── layout.tsx ✅
├── middleware.ts (Clerk) ✅
├── package.json (recharts, date-fns installed ✅)
└── .env.local (manually created)
```

---

## 🚨 Common Issues & Fixes

### 1. "Cannot find module 'node-cron'"
```bash
cd backend
npm install node-cron @types/node-cron
```

### 2. "Prisma Client not generated"
```bash
cd backend
npm run prisma:generate
```

### 3. Database connection error
- Verify `DATABASE_URL` in `backend/.env`
- Check Neon dashboard for connection string
- Ensure `?sslmode=require` is in connection string

### 4. OAuth redirect mismatch
**Google Console:**
- Authorized redirect URI: `http://localhost:5000/api/oauth/google/callback`

**Meta Dashboard:**
- Valid OAuth Redirect URI: `http://localhost:5000/api/oauth/meta/callback`

### 5. Clerk authentication failing
- Verify keys in both `backend/.env` and `frontend/.env.local`
- Check publishable key starts with `pk_test_` or `pk_live_`
- Check secret key starts with `sk_test_` or `sk_live_`

### 6. CORS errors
- Ensure `FRONTEND_URL=http://localhost:3000` in `backend/.env`
- Check browser console for exact error

---

## 🎯 Production Deployment Guide

For a professional production environment, we recommend the following stack:

### 1. Database & Session Management
- **Database**: Use your existing **Neon PostgreSQL** instance. For production, ensure you use the **Pooling** connection string to handle concurrent connections efficiently.
- **Redis (Optional)**: If you implement BullMQ queues for high-volume sync, use **Upstash Redis** (Serverless).

### 2. Backend Deployment (Render / Railway / AWS)
We recommend **Render** for its simplicity with Node.js/Express.

1. **Create a new Direct Connect/Web Service** on Render.
2. **Environment**: Select `Node`.
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render default)
   - `DATABASE_URL`: (Use Neon's **Pooled** connection string)
   - `FRONTEND_URL`: (Your Vercel deployment URL, e.g., `https://your-app.vercel.app`)
   - `CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`: (Use production keys from Clerk Dashboard)
   - `TOKEN_ENCRYPTION_KEY`: (Generate a fresh 32-byte hex key)
   - `GOOGLE_REDIRECT_URI`: `https://your-api.onrender.com/api/oauth/google/callback`

### 3. Frontend Deployment (Vercel)
Vercel is the optimized choice for Next.js.

1. **Import your repository** to Vercel.
2. **Framework Preset**: Next.js.
3. **Root Directory**: `frontend`.
4. **Environment Variables**:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: (Production Key)
   - `CLERK_SECRET_KEY`: (Production Key)
   - `NEXT_PUBLIC_BACKEND_URL`: `https://your-api.onrender.com`
5. **Deploy**.

### 4. Clerk Production Setup
1. Go to your **Clerk Dashboard**.
2. Switch to **Production Mode**.
3. Update the **Allowed Redirect Origins** to include your Vercel domain.
4. Update the **Paths** if you changed them from the defaults.

### 5. Google & Meta Ads Console
1. **Update Redirect URIs**: Ensure the Production API URLs are added to your Google Cloud Console and Meta App Dashboard.
   - Google: `https://your-api.onrender.com/api/oauth/google/callback`
   - Meta: `https://your-api.onrender.com/api/oauth/meta/callback`
2. **OAuth Consent Screen**: Move your Google app from "Testing" to **"Production"** to avoid the 7-day token expiry if you are using it for real customers.

---

## ✅ What's Working

1. ✅ Complete authentication (Clerk)
2. ✅ Multi-tenant workspaces
3. ✅ Google Ads OAuth & data sync
4. ✅ Meta Ads OAuth & data sync
5. ✅ Encrypted token storage
6. ✅ Background jobs (every 6 hours)
7. ✅ Platform-agnostic schema
8. ✅ Metrics API (summary, campaigns, trends)
9. ✅ Dashboard with real data
10. ✅ Campaign performance table
11. ✅ Trend charts (Recharts)
12. ✅ Date & platform filters

---

## 🔜 Next Steps (Optional)

### AI Insights (When Ready)
1. Add `ANTHROPIC_API_KEY` to `backend/.env`
2. Create insights controller
3. Build chat UI component
4. Enable natural language queries

### Enhancements
- [ ] Email notifications
- [ ] CSV export
- [ ] Budget alerts
- [ ] Team collaboration
- [ ] Custom reports

---

## 📞 Support

**Issues?**
1. Check logs in terminal
2. Verify all environment variables
3. Ensure database migrations ran
4. Check API responses in Network tab

**Everything looks good? 🎉 You're ready to test!**
