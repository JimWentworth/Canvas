#!/bin/bash

echo "================================================"
echo " Email Cleanup AI Assistant - Quick Start"
echo "================================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if Playwright is installed
echo "🌐 Checking Playwright browsers..."
if ! npx playwright --version &> /dev/null; then
    echo "Installing Playwright browsers (this may take a few minutes)..."
    npx playwright install chromium
else
    echo "Playwright already installed ✓"
fi
echo ""

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "Created .env - you can add your OpenAI API key later (optional)"
    echo ""
fi

echo "================================================"
echo " Starting Email Cleanup AI Assistant..."
echo "================================================"
echo ""
echo "Server will start at: http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""

# Start the server
npm start
