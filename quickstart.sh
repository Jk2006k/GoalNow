#!/bin/bash

# QuickStart Script for GoalNow
# This script helps set up the project quickly

echo "🚀 GoalNow Project Setup"
echo "========================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install server dependencies
echo "📦 Installing Server Dependencies..."
cd server
npm install
cd ..
echo "✅ Server dependencies installed"
echo ""

# Install client dependencies  
echo "📦 Installing Client Dependencies..."
cd client
npm install
cd ..
echo "✅ Client dependencies installed"
echo ""

echo "📋 Next Steps:"
echo "1. Set up Google OAuth:"
echo "   - Go to https://console.cloud.google.com"
echo "   - Create OAuth 2.0 credentials"
echo "   - Copy Client ID and Secret"
echo ""
echo "2. Configure Environment Variables:"
echo "   - server/.env (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, MONGODB_URI, JWT_SECRET)"
echo "   - client/.env.local (VITE_GOOGLE_CLIENT_ID)"
echo ""
echo "3. Set up MongoDB:"
echo "   - Start local MongoDB or use MongoDB Atlas"
echo "   - Update MONGODB_URI in server/.env"
echo ""
echo "4. Start the Application:"
echo "   - Terminal 1: cd server && npm run dev"
echo "   - Terminal 2: cd client && npm run dev"
echo ""
echo "5. Open Browser:"
echo "   - http://localhost:5173"
echo ""
echo "📖 For detailed instructions, see SETUP_GUIDE.md"
echo "✅ Setup complete!"
