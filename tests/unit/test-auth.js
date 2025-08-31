#!/usr/bin/env node

/**
 * Authentication System Test Script
 * 
 * This script tests the basic functionality of your authentication system.
 * Run it after setting up your environment variables and starting the server.
 */

const http = require('http');

// Configuration
const TEST_CONFIG = {
  host: 'localhost',
  port: process.env.PORT || 3001,
  timeout: 5000
};

// Test cases
const TESTS = [
  {
    name: 'Server Health Check',
    path: '/',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Login Page',
    path: '/login',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Signup Page',
    path: '/signup',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Reset Password Page',
    path: '/reset',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Dashboard (Unauthenticated)',
    path: '/dashboard',
    method: 'GET',
    expectedStatus: 302 // Should redirect to login
  }
];

// Helper function to make HTTP requests
function makeRequest(test) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: TEST_CONFIG.host,
      port: TEST_CONFIG.port,
      path: test.path,
      method: test.method,
      timeout: TEST_CONFIG.timeout
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🧪 Testing Authentication System...\n');
  console.log(`📍 Server: ${TEST_CONFIG.host}:${TEST_CONFIG.port}\n`);

  let passedTests = 0;
  let totalTests = TESTS.length;

  for (const test of TESTS) {
    try {
      console.log(`Testing: ${test.name}`);
      console.log(`  Path: ${test.method} ${test.path}`);
      
      const response = await makeRequest(test);
      
      if (response.status === test.expectedStatus) {
        console.log(`  ✅ PASS - Status: ${response.status}`);
        passedTests++;
      } else {
        console.log(`  ❌ FAIL - Expected: ${test.expectedStatus}, Got: ${response.status}`);
      }
      
      // Check if response contains expected content
      if (test.path === '/login' && response.data.includes('Sign in to your account')) {
        console.log('  ✅ PASS - Login page content verified');
      } else if (test.path === '/signup' && response.data.includes('Create Account')) {
        console.log('  ✅ PASS - Signup page content verified');
      } else if (test.path === '/reset' && response.data.includes('Reset Password')) {
        console.log('  ✅ PASS - Reset page content verified');
      }
      
    } catch (error) {
      console.log(`  ❌ FAIL - Error: ${error.message}`);
    }
    
    console.log('');
  }

  // Summary
  console.log('📊 Test Results:');
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Failed: ${totalTests - passedTests}`);
  console.log(`  Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Your authentication system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your setup and try again.');
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await makeRequest({ path: '/', method: 'GET' });
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking server availability...');
  
  const serverRunning = await checkServerHealth();
  
  if (!serverRunning) {
    console.log('❌ Server is not running or not accessible.');
    console.log('Please start your server first:');
    console.log('  npm run start:debug');
    console.log('');
    console.log('Then run this test script again.');
    process.exit(1);
  }
  
  console.log('✅ Server is running and accessible.\n');
  
  // Run tests
  await runTests();
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Authentication System Test Script');
  console.log('');
  console.log('Usage:');
  console.log('  node test-auth.js          # Run all tests');
  console.log('  node test-auth.js --help   # Show this help');
  console.log('');
  console.log('Prerequisites:');
  console.log('  1. Set up your .env file with Supabase credentials');
  console.log('  2. Start your server: npm run start:debug');
  console.log('  3. Ensure all dependencies are installed');
  process.exit(0);
}

// Run the main function
main().catch((error) => {
  console.error('❌ Test script failed:', error.message);
  process.exit(1);
});
