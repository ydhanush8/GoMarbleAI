#!/bin/bash

echo "🚀 GoMarble Analytics - Environment Setup"
echo "==========================================="
echo ""

# Backend .env setup
echo "📝 Setting up backend .env file..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from template"
    echo ""
    echo "⚠️  Please edit backend/.env and add:"
    echo "   - DATABASE_URL (Neon PostgreSQL connection string)"
    echo "   - CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY"
    echo "   - Generate TOKEN_ENCRYPTION_KEY with:"
    echo "     node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    echo ""
else
    echo "ℹ️  backend/.env already exists"
fi

# Frontend .env setup
echo "📝 Setting up frontend .env.local file..."
if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.example frontend/.env.local
    echo "✅ Created frontend/.env.local from template"
    echo ""
    echo "⚠️  Please edit frontend/.env.local and add:"
    echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    echo "   - CLERK_SECRET_KEY"
    echo ""
else
    echo "ℹ️  frontend/.env.local already exists"
fi

echo ""
echo "🔑 Generating encryption key..."
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "✅ Generated: $ENCRYPTION_KEY"
echo ""
echo "💾 Copy this to backend/.env as TOKEN_ENCRYPTION_KEY"
echo ""

echo "📦 Installing dependencies..."
echo ""

# Backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed"
echo ""

# Frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"
echo ""

cd ..

echo "🗄️  Setting up database..."
cd backend
echo "Generating Prisma client..."
npm run prisma:generate
echo "✅ Prisma client generated"
echo ""

echo "⚠️  Before running migrations, make sure DATABASE_URL is set in backend/.env"
echo "Then run: cd backend && npm run prisma:migrate"
echo ""

cd ..

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your credentials"
echo "2. Edit frontend/.env.local with your Clerk keys"
echo "3. Run migrations: cd backend && npm run prisma:migrate"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start frontend: cd frontend && npm run dev"
echo ""
echo "📚 See README.md for detailed setup instructions"
