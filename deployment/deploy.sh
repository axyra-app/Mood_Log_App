#!/bin/bash

# Deploy script for Vercel
echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm run test:run

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed. dist directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Vercel (if Vercel CLI is installed)
if command -v vercel &> /dev/null; then
    echo "🚀 Deploying to Vercel..."
    vercel --prod
else
    echo "⚠️  Vercel CLI not found. Please install it with: npm i -g vercel"
    echo "📋 Manual deployment steps:"
    echo "   1. Push your code to GitHub"
    echo "   2. Connect your repository to Vercel"
    echo "   3. Set environment variables in Vercel dashboard"
    echo "   4. Deploy!"
fi

echo "🎉 Deployment process completed!"
