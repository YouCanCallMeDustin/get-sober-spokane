// Test script to check browser-side authentication and comment functionality
const puppeteer = require('puppeteer');

async function testBrowserAuth() {
    console.log('🌐 Testing Browser Authentication and Comment Functionality...\n');
    
    let browser;
    try {
        // Launch browser
        console.log('🚀 Launching browser...');
        browser = await puppeteer.launch({ 
            headless: false, // Set to true to run in background
            defaultViewport: { width: 1280, height: 720 }
        });
        
        const page = await browser.newPage();
        
        // Navigate to the forum
        console.log('📱 Navigating to community forum...');
        await page.goto('http://localhost:3000/community-forum.html', { 
            waitUntil: 'networkidle2' 
        });
        
        // Wait for page to load
        await page.waitForTimeout(3000);
        
        // Check if user appears to be logged in
        console.log('\n🔍 Checking authentication status...');
        const logoutButton = await page.$('a[href*="logout"], button:contains("Log out"), a:contains("Log out")');
        const loginButton = await page.$('a[href*="login"], button:contains("Log in"), a:contains("Log in")');
        
        if (logoutButton) {
            console.log('✅ Logout button found - user appears to be logged in');
        } else if (loginButton) {
            console.log('❌ Login button found - user appears to be logged out');
        } else {
            console.log('⚠️  Could not determine authentication status from UI');
        }
        
        // Check for any error messages
        console.log('\n🚨 Checking for error messages...');
        const errorMessages = await page.$$eval('.alert-danger, .error, [class*="error"]', elements => 
            elements.map(el => el.textContent.trim())
        );
        
        if (errorMessages.length > 0) {
            console.log('❌ Error messages found:');
            errorMessages.forEach(msg => console.log('   -', msg));
        } else {
            console.log('✅ No error messages found');
        }
        
        // Try to add a comment
        console.log('\n💬 Testing comment functionality...');
        
        // Look for a post to comment on
        const postCards = await page.$$('.post-card, .card[data-post-id]');
        if (postCards.length > 0) {
            console.log(`✅ Found ${postCards.length} posts`);
            
            // Click on the first post to open comment modal
            console.log('   Clicking on first post...');
            await postCards[0].click();
            
            // Wait for modal to open
            await page.waitForTimeout(2000);
            
            // Check if comment modal is open
            const commentModal = await page.$('.modal.show, .modal[style*="display: block"]');
            if (commentModal) {
                console.log('✅ Comment modal opened');
                
                // Try to add a comment
                const commentInput = await page.$('#commentContent, input[placeholder*="comment"], textarea[placeholder*="comment"]');
                if (commentInput) {
                    console.log('✅ Comment input found');
                    
                    // Type a test comment
                    await commentInput.type('Test comment from automated test');
                    
                    // Look for submit button
                    const submitButton = await page.$('button[type="submit"], button:contains("Add Comment"), button:contains("Submit")');
                    if (submitButton) {
                        console.log('✅ Submit button found - clicking...');
                        await submitButton.click();
                        
                        // Wait for response
                        await page.waitForTimeout(3000);
                        
                        // Check for success/error messages
                        const successMessages = await page.$$eval('.alert-success, .success, [class*="success"]', elements => 
                            elements.map(el => el.textContent.trim())
                        );
                        
                        const errorMessages = await page.$$eval('.alert-danger, .error, [class*="error"]', elements => 
                            elements.map(el => el.textContent.trim())
                        );
                        
                        if (successMessages.length > 0) {
                            console.log('✅ Comment submission successful!');
                            successMessages.forEach(msg => console.log('   -', msg));
                        } else if (errorMessages.length > 0) {
                            console.log('❌ Comment submission failed:');
                            errorMessages.forEach(msg => console.log('   -', msg));
                        } else {
                            console.log('⚠️  No clear success/error message after comment submission');
                        }
                    } else {
                        console.log('❌ Submit button not found');
                    }
                } else {
                    console.log('❌ Comment input not found');
                }
            } else {
                console.log('❌ Comment modal did not open');
            }
        } else {
            console.log('❌ No posts found to comment on');
        }
        
        // Check console logs for any errors
        console.log('\n📋 Checking browser console for errors...');
        const consoleLogs = await page.evaluate(() => {
            return window.consoleLogs || [];
        });
        
        if (consoleLogs.length > 0) {
            console.log('Console logs found:');
            consoleLogs.forEach(log => console.log('   -', log));
        }
        
        console.log('\n🎉 Browser test completed!');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
testBrowserAuth();
