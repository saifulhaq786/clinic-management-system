#!/bin/bash
# Elite Clinic - Command Reference & Setup Script

echo "🏥 Elite Clinic Management System"
echo "=================================="
echo ""

# Check Node.js
echo "✓ Node.js version:"
node --version

# Check npm
echo "✓ npm version:"
npm --version

echo ""
echo "📦 Installation Instructions"
echo "=============================="
echo ""
echo "1. Install Backend Dependencies:"
echo "   cd server && npm install"
echo ""
echo "2. Install Frontend Dependencies:"
echo "   cd client && npm install"
echo ""
echo "3. Configure Environment:"
echo "   cp server/.env.example server/.env"
echo "   # Edit server/.env with your credentials"
echo ""
echo "4. Start Development:"
echo "   # Terminal 1:"
echo "   cd server && npm run dev"
echo "   # Terminal 2:"
echo "   cd client && npm run dev"
echo ""
echo "5. OR Start with Docker:"
echo "   docker-compose up -d"
echo ""

echo "🌐 Access URLs"
echo "==============="
echo "Frontend:     http://localhost:5177"
echo "Backend:      http://localhost:5001"
echo "DB Health:    http://localhost:5001/test-db"
echo ""

echo "🧪 Testing Commands"
echo "==================="
echo "Unit Tests:       npm test (in server/)"
echo "Lint Check:       npm run lint (in client/)"
echo "Build Frontend:   npm run build (in client/)"
echo ""

echo "🐳 Docker Commands"
echo "=================="
echo "Start All:        docker-compose up -d"
echo "View Logs:        docker-compose logs -f backend"
echo "Stop All:         docker-compose down"
echo "Rebuild:          docker-compose build --no-cache"
echo "Status:           docker-compose ps"
echo ""

echo "📚 Documentation Files"
echo "====================="
echo "README.md              - Complete feature guide"
echo "SETUP.md               - Quick start guide"
echo "FEATURES_CHECKLIST.md  - Interview talking points"
echo "PROJECT_COMPLETE.md    - Executive summary"
echo "QUICK_REFERENCE.md     - Command cheat sheet"
echo "COMPLETION_REPORT.md   - Delivery report"
echo ""

echo "✅ Project Ready!"
echo "Start with: docker-compose up -d"
