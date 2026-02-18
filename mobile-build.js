#!/usr/bin/env node

/**
 * Mobile build script for static export.
 * Sets NEXT_PUBLIC_IS_MOBILE=true and runs next build.
 * Output: out/ directory ready for Capacitor.
 * Usage: node mobile-build.js
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';

console.log('🚀 Starting mobile static build...');
console.log('📱 NEXT_PUBLIC_IS_MOBILE=true');

process.env.NEXT_PUBLIC_IS_MOBILE = 'true';

try {
  console.log('🔒 Hiding API routes for static export...');
  if (fs.existsSync('app/api')) {
    fs.renameSync('app/api', 'app/_api_hidden');
  }
  execSync('npm run build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_PUBLIC_IS_MOBILE: 'true',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkdW1teSIsImlhdCI6MTcxMDAwMDAwMCwiZXhwIjoxNzEwMDM2MDAwfQ.dummy'
    }
  });
  console.log('✅ Mobile static build complete!');
  console.log('📂 Output in ./out/ directory');
  console.log('🔮 Ready for Capacitor integration (next subtasks).');
  console.log('🔓 Restoring API routes...');
  if (fs.existsSync('app/_api_hidden')) {
    fs.renameSync('app/_api_hidden', 'app/api');
  }
} catch (error) {
  console.error('❌ Build failed:', error.message);
  if (fs.existsSync('app/_api_hidden')) {
    fs.renameSync('app/_api_hidden', 'app/api');
  }
  process.exit(1);
}