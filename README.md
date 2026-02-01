# GoMarble Analytics Platform

A production-grade SaaS analytics platform for Google Ads and Meta Ads with AI-powered insights using Claude.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Authentication**: Clerk
- **Ad Platforms**: Google Ads API, Meta Ads API
- **AI**: Claude (Anthropic)
- **Background Jobs**: node-cron
- **Charts**: Recharts
- **Deployment**: Frontend on Vercel, Backend on Render

## 📋 Prerequisites

Before setting up the project, you'll need accounts and API keys for:

1. **Clerk** (https://clerk.dev)
   - Create a new application
   - Get your publishable and secret keys

2. **Neon PostgreSQL** (https://neon.tech)
   - Create a new project
   - Get your connection string

3. **Google Ads API** (https://console.cloud.google.com)
   - Create a project
   - Enable Google Ads API
   - Create OAuth 2.0 credentials
   - Get client ID and secret

4. **Meta for Developers** (https://developers.facebook.com)
   - Create a new app
   - Request Ads Management permissions
   - Get app ID and secret

5. **Anthropic API** (https://console.anthropic.com)
   - Create an API key for Claude

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Configure Environment Variables

#### Frontend (.env.local)

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

DATABASE_URL=your_neon_postgres_connection_string

CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
TOKEN_ENCRYPTION_KEY=your_32_byte_hex_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google/callback

META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_REDIRECT_URI=http://localhost:5000/api/oauth/meta/callback

ANTHROPIC_API_KEY=sk-ant-your_key_here
```

### 3. Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as `TOKEN_ENCRYPTION_KEY` in backend `.env`.

### 4. Setup Database

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations to create database tables
npm run prisma:migrate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### 5. Start Development Servers

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

The backend will run on http://localhost:5000

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

The frontend will run on http://localhost:3000

## 🔐 Clerk Configuration

1. Go to your Clerk dashboard (https://dashboard.clerk.dev)
2. Navigate to **Paths** settings
3. Set the following redirect URLs:
   - **Sign-in redirect**: `/workspace/select`
   - **Sign-up redirect**: `/workspace/select`
   - **After sign out**: `/`

## 🔌 OAuth App Setup

### Google Ads API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google Ads API**
4. Go to **APIs & Services** > **Credentials**
5. Create **OAuth 2.0 Client ID** (Web application)
6. Add authorized redirect URI:
   ```
   http://localhost:5000/api/oauth/google/callback
   ```
7. Copy Client ID and Client Secret to backend `.env`

### Meta Ads API

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create a new app (Business type)
3. Add **Marketing API** product
4. Go to **Settings** > **Basic**
5. Copy App ID and App Secret to backend `.env`
6. Add OAuth redirect URI in **Settings** > **Advanced**:
   ```
   http://localhost:5000/api/oauth/meta/callback
   ```

## 📁 Project Structure

```
GoMarbleAI/
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── workspace/
│   │   │   ├── select/
│   │   │   └── create/
│   │   ├── dashboard/
│   │   │   ├── page.tsx (overview)
│   │   │   ├── integrations/
│   │   │   └── insights/
│   │   ├── layout.tsx
│   │   └── page.tsx (landing)
│   ├── components/
│   ├── lib/
│   └── middleware.ts
│
└── backend/
    ├── src/
    │   ├── config/
    │   │   ├── database.ts
    │   │   ├── clerk.ts
    │   │   └── encryption.ts
    │   ├── middleware/
    │   │   ├── auth.ts
    │   │   ├── workspace.ts
    │   │   └── errorHandler.ts
    │   ├── controllers/
    │   │   ├── auth.controller.ts
    │   │   ├── workspace.controller.ts
    │   │   ├── oauth.controller.ts
    │   │   ├── metrics.controller.ts
    │   │   └── insights.controller.ts
    │   ├── services/
    │   │   ├── user.service.ts
    │   │   ├── workspace.service.ts
    │   │   ├── metrics.service.ts
    │   │   └── insights.service.ts
    │   ├── adapters/
    │   │   ├── google/
    │   │   │   ├── client.ts
    │   │   │   ├── fetcher.ts
    │   │   │   └── normalizer.ts
    │   │   └── meta/
    │   │       ├── client.ts
    │   │       ├── fetcher.ts
    │   │       └── normalizer.ts
    │   ├── jobs/
    │   │   ├── syncGoogle.job.ts
    │   │   └── syncMeta.job.ts
    │   ├── routes/
    │   ├── types/
    │   └── index.ts
    └── prisma/
        └── schema.prisma
```

## 🎯 Core Features

- [x] User Authentication (Clerk)
- [x] Workspace Management (Create, Select, Switch)
- [x] OAuth Integration (Google Ads)
- [x] OAuth Integration (Meta Ads)
- [x] Token Encryption at Rest (AES-256-GCM)
- [x] Workspace Isolation & Multi-Tenancy
- [x] Integrations UI (Connect/Disconnect)
- [ ] Background Data Sync (Jobs)
- [ ] Platform-Agnostic Data Normalization
- [ ] Metrics Calculation (CTR, CPC, CPA, ROAS)
- [ ] Dashboard with Charts
- [ ] AI Insights (Claude Integration)
- [ ] Campaign Performance Table
- [ ] Date Range Filtering
- [ ] Platform Filtering

## 🔒 Security

- **Authentication**: Managed by Clerk (MFA support, secure sessions)
- **Workspace Isolation**: All queries scoped by workspace
- **Token Encryption**: OAuth tokens encrypted at rest with AES-256-GCM
- **CORS**: Configured to allow only frontend origin
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All endpoints validate request data
- **Security Headers**: Helmet.js for HTTP security headers

## 🧪 Testing

*Coming soon: Unit tests, integration tests, and E2E tests*

## 🚢 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Backend (Render)

1. Push code to GitHub
2. Create new Web Service in Render
3. Set environment variables
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Deploy

## 📝 API Endpoints

### Authentication
- `POST /api/auth/sync` - Sync Clerk user to database
- `GET /api/auth/me` - Get current user profile

### Workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces` - Get user workspaces
- `GET /api/workspaces/:id` - Get workspace details
- `PUT /api/workspaces/:id` - Update workspace

### OAuth (Coming Soon)
- `POST /api/oauth/google/initiate` - Start Google OAuth
- `GET /api/oauth/google/callback` - Google OAuth callback
- `POST /api/oauth/meta/initiate` - Start Meta OAuth
- `GET /api/oauth/meta/callback` - Meta OAuth callback

### Metrics (Coming Soon)
- `GET /api/metrics/summary` - Aggregated metrics
- `GET /api/metrics/campaigns` - Campaign performance
- `GET /api/metrics/trends` - Daily trends

### Insights (Coming Soon)
- `POST /api/insights/ask` - Ask AI a question

## 🤝 Contributing

*Guidelines coming soon*

## 📄 License

MIT

## 💬 Support

For issues and questions, please open a GitHub issue.
