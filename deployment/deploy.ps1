# Deploy script for Vercel (PowerShell)
Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm ci

# Run tests
Write-Host "🧪 Running tests..." -ForegroundColor Yellow
npm run test:run

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build

# Check if build was successful
if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: Build failed. dist directory not found." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Deploy to Vercel (if Vercel CLI is installed)
if (Get-Command vercel -ErrorAction SilentlyContinue) {
    Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
    vercel --prod
} else {
    Write-Host "⚠️  Vercel CLI not found. Please install it with: npm i -g vercel" -ForegroundColor Yellow
    Write-Host "📋 Manual deployment steps:" -ForegroundColor Cyan
    Write-Host "   1. Push your code to GitHub" -ForegroundColor White
    Write-Host "   2. Connect your repository to Vercel" -ForegroundColor White
    Write-Host "   3. Set environment variables in Vercel dashboard" -ForegroundColor White
    Write-Host "   4. Deploy!" -ForegroundColor White
}

Write-Host "🎉 Deployment process completed!" -ForegroundColor Green
