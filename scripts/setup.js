#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('[v0] Starting FlowMind setup...');

try {
  // Generate Prisma client
  console.log('[v0] Generating Prisma client...');
  execSync('npx prisma generate', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('[v0] Prisma client generated successfully');

  console.log('[v0] Setup complete! Environment variables needed:');
  console.log('  - DATABASE_URL: Your PostgreSQL connection string');
  console.log('  - NEXTAUTH_SECRET: A random secret for session encryption');
  console.log('  - NEXTAUTH_URL: Your app URL (http://localhost:3000 for development)');
  console.log('  - GOOGLE_CLIENT_ID: (Optional) For Google OAuth');
  console.log('  - GOOGLE_CLIENT_SECRET: (Optional) For Google OAuth');
  console.log('  - GOOGLE_GENERATIVE_AI_API_KEY: For AI features');
  
} catch (error) {
  console.error('[v0] Setup error:', error.message);
  process.exit(1);
}
