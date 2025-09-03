# PowerShell script to deploy Firestore rules
Write-Host "🚀 Deploying Firestore rules..." -ForegroundColor Green

try {
    # Check if firebase CLI is installed
    $firebaseVersion = firebase --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Firebase CLI found: $firebaseVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
        npm install -g firebase-tools
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install Firebase CLI"
        }
    }
    
    # Check if user is logged in
    $firebaseUser = firebase login:list 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "🔐 Please login to Firebase..." -ForegroundColor Yellow
        firebase login
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to login to Firebase"
        }
    }
    
    # Deploy Firestore rules
    Write-Host "📤 Deploying Firestore rules..." -ForegroundColor Blue
    firebase deploy --only firestore:rules
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Firestore rules deployed successfully!" -ForegroundColor Green
    } else {
        throw "Failed to deploy Firestore rules"
    }
    
} catch {
    Write-Host "❌ Error deploying Firestore rules: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Manual steps to fix:" -ForegroundColor Yellow
    Write-Host "1. Install Firebase CLI: npm install -g firebase-tools" -ForegroundColor White
    Write-Host "2. Login to Firebase: firebase login" -ForegroundColor White
    Write-Host "3. Deploy rules: firebase deploy --only firestore:rules" -ForegroundColor White
}
