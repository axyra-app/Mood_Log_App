// Script to deploy Firestore rules
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Firestore rules...');

try {
  // Check if firebase CLI is installed
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI found');
  
  // Check if we're in a Firebase project
  if (!fs.existsSync('firebase.json')) {
    console.log('📝 Creating firebase.json...');
    const firebaseConfig = {
      "firestore": {
        "rules": "firestore.rules",
        "indexes": "firestore.indexes.json"
      },
      "hosting": {
        "public": "dist",
        "ignore": [
          "firebase.json",
          "**/.*",
          "**/node_modules/**"
        ],
        "rewrites": [
          {
            "source": "**",
            "destination": "/index.html"
          }
        ]
      }
    };
    
    fs.writeFileSync('firebase.json', JSON.stringify(firebaseConfig, null, 2));
    console.log('✅ firebase.json created');
  }
  
  // Deploy Firestore rules
  console.log('📤 Deploying Firestore rules...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  
  console.log('✅ Firestore rules deployed successfully!');
  
} catch (error) {
  console.error('❌ Error deploying Firestore rules:', error.message);
  console.log('\n📋 Manual steps to fix:');
  console.log('1. Install Firebase CLI: npm install -g firebase-tools');
  console.log('2. Login to Firebase: firebase login');
  console.log('3. Initialize project: firebase init firestore');
  console.log('4. Deploy rules: firebase deploy --only firestore:rules');
}
