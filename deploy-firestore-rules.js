#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Deploying Firestore rules...');

try {
  // Check if firebase CLI is installed
  try {
    execSync('firebase --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Firebase CLI not found. Please install it first:');
    console.error('npm install -g firebase-tools');
    process.exit(1);
  }

  // Check if user is logged in
  try {
    execSync('firebase projects:list', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Not logged in to Firebase. Please login first:');
    console.error('firebase login');
    process.exit(1);
  }

  // Deploy Firestore rules
  console.log('📝 Deploying Firestore rules...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  
  console.log('✅ Firestore rules deployed successfully!');
  
} catch (error) {
  console.error('❌ Error deploying Firestore rules:', error.message);
  process.exit(1);
}
