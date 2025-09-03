/**
 * Test Session Detection Script
 * This script helps debug session detection issues
 */

const http = require('http');

function testSession() {
    console.log('🔍 Testing session detection...');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/chat',
        method: 'GET',
        headers: {
            'User-Agent': 'Test-Script/1.0'
        }
    };
    
    const req = http.request(options, (res) => {
        console.log(`📡 Response Status: ${res.statusCode}`);
        console.log(`📡 Response Headers:`, res.headers);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            // Look for user-related content
            if (data.includes('Welcome back')) {
                console.log('✅ Found "Welcome back" - User is logged in');
            } else if (data.includes('Anonymous')) {
                console.log('⚠️  Found "Anonymous" - User not detected');
            } else {
                console.log('❓ Could not determine user status');
            }
            
            // Look for sign-in link
            if (data.includes('Sign in')) {
                console.log('🔗 Found "Sign in" link');
            }
            
            console.log('📄 Response length:', data.length, 'characters');
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Request failed:', error.message);
    });
    
    req.end();
}

// Run the test
testSession();
