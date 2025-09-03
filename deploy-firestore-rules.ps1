# Deploy Firestore rules to Firebase
Write-Host "🔥 Deploying Firestore rules..." -ForegroundColor Yellow

try {
    # Check if firebase CLI is installed
    try {
        firebase --version | Out-Null
    } catch {
        Write-Host "❌ Firebase CLI not found. Please install it first:" -ForegroundColor Red
        Write-Host "npm install -g firebase-tools" -ForegroundColor Cyan
        exit 1
    }

    # Check if user is logged in
    try {
        firebase projects:list | Out-Null
    } catch {
        Write-Host "❌ Not logged in to Firebase. Please login first:" -ForegroundColor Red
        Write-Host "firebase login" -ForegroundColor Cyan
        exit 1
    }

    # Deploy Firestore rules
    Write-Host "📝 Deploying Firestore rules..." -ForegroundColor Green
    firebase deploy --only firestore:rules
    
    Write-Host "✅ Firestore rules deployed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error deploying Firestore rules: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
