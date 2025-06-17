#!/usr/bin/env tsx

import fetch from 'node-fetch';

const HEALTH_CHECK_URL = process.env.HEALTH_CHECK_URL || 'http://localhost:5000/health';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkHealth(attempt = 1): Promise<boolean> {
  try {
    console.log(`Health check attempt ${attempt}/${MAX_RETRIES}...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(HEALTH_CHECK_URL, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health check passed:', data);
      return true;
    } else {
      console.log(`❌ Health check failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Health check failed with error:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Starting health check...');
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const isHealthy = await checkHealth(attempt);
    
    if (isHealthy) {
      console.log('🎉 Application is healthy!');
      process.exit(0);
    }
    
    if (attempt < MAX_RETRIES) {
      console.log(`Waiting ${RETRY_DELAY}ms before next attempt...`);
      await sleep(RETRY_DELAY);
    }
  }
  
  console.log('💥 Application health check failed after all retries');
  process.exit(1);
}

main().catch(error => {
  console.error('Health check script failed:', error);
  process.exit(1);
});