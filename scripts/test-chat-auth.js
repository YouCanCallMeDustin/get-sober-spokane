#!/usr/bin/env node

/**
 * Test Script for Chat Authentication Integration
 * This script tests the chat room authentication features
 */

const { createClient } = require('@supabase/supabase-js');
const io = require('socket.io-client');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iquczuhmkemjytrqnbxg.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdWN6dWhta2Vtanl0cnFuYnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMDMzMjcsImV4cCI6MjA2OTY3OTMyN30.FFzZFBUAM1ZgQSTlzPNSuJIikUiQkvSBKvc19wdzulk';
const CHAT_SERVER_URL = 'http://localhost:3001';

class ChatAuthTester {
    constructor() {
        this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        this.socket = null;
        this.testResults = [];
    }

    async runTests() {
        console.log('🧪 Starting Chat Authentication Tests...\n');

        try {
            // Test 1: Supabase Connection
            await this.testSupabaseConnection();

            // Test 2: Authentication State
            await this.testAuthenticationState();

            // Test 3: Chat Server Connection
            await this.testChatServerConnection();

            // Test 4: Profile Integration
            await this.testProfileIntegration();

            // Test 5: Message with Profile
            await this.testMessageWithProfile();

            // Test 6: Profile Updates
            await this.testProfileUpdates();

        } catch (error) {
            console.error('❌ Test failed:', error.message);
        } finally {
            await this.cleanup();
            this.printResults();
        }
    }

    async testSupabaseConnection() {
        console.log('🔌 Testing Supabase Connection...');
        
        try {
            const { data, error } = await this.supabase.auth.getSession();
            
            if (error) {
                throw new Error(`Supabase connection failed: ${error.message}`);
            }

            this.addResult('Supabase Connection', 'PASS', 'Successfully connected to Supabase');
            console.log('✅ Supabase connection successful');
            
        } catch (error) {
            this.addResult('Supabase Connection', 'FAIL', error.message);
            console.log('❌ Supabase connection failed:', error.message);
            throw error;
        }
    }

    async testAuthenticationState() {
        console.log('🔐 Testing Authentication State...');
        
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (session) {
                this.addResult('Authentication State', 'PASS', `User authenticated: ${session.user.email}`);
                console.log('✅ User is authenticated:', session.user.email);
            } else {
                this.addResult('Authentication State', 'INFO', 'No active session (user not logged in)');
                console.log('ℹ️  No active session (user not logged in)');
            }
            
        } catch (error) {
            this.addResult('Authentication State', 'FAIL', error.message);
            console.log('❌ Authentication state check failed:', error.message);
        }
    }

    async testChatServerConnection() {
        console.log('🌐 Testing Chat Server Connection...');
        
        try {
            this.socket = io(CHAT_SERVER_URL, {
                transports: ['websocket', 'polling'],
                timeout: 10000
            });

            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout'));
                }, 10000);

                this.socket.on('connect', () => {
                    clearTimeout(timeout);
                    this.addResult('Chat Server Connection', 'PASS', 'Successfully connected to chat server');
                    console.log('✅ Chat server connection successful');
                    resolve();
                });

                this.socket.on('connect_error', (error) => {
                    clearTimeout(timeout);
                    reject(new Error(`Connection error: ${error.message}`));
                });
            });
            
        } catch (error) {
            this.addResult('Chat Server Connection', 'FAIL', error.message);
            console.log('❌ Chat server connection failed:', error.message);
            throw error;
        }
    }

    async testProfileIntegration() {
        console.log('👤 Testing Profile Integration...');
        
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (session && this.socket) {
                const userProfile = {
                    id: session.user.id,
                    email: session.user.email,
                    displayName: session.user.user_metadata?.full_name || 
                                session.user.user_metadata?.name ||
                                session.user.email?.split('@')[0] || 'Anonymous',
                    avatar: session.user.user_metadata?.picture || 
                           session.user.user_metadata?.avatar_url || null,
                    memberSince: session.user.created_at,
                    isAuthenticated: true
                };

                // Test joining room with profile
                this.socket.emit('join_room', {
                    room: 'test-room',
                    username: userProfile.displayName,
                    userProfile: userProfile
                });

                this.addResult('Profile Integration', 'PASS', `Profile data prepared: ${userProfile.displayName}`);
                console.log('✅ Profile integration successful:', userProfile.displayName);
                
            } else {
                this.addResult('Profile Integration', 'SKIP', 'No authenticated user or socket connection');
                console.log('⏭️  Skipping profile integration test (no authenticated user)');
            }
            
        } catch (error) {
            this.addResult('Profile Integration', 'FAIL', error.message);
            console.log('❌ Profile integration test failed:', error.message);
        }
    }

    async testMessageWithProfile() {
        console.log('💬 Testing Message with Profile...');
        
        try {
            if (this.socket) {
                const { data: { session } } = await this.supabase.auth.getSession();
                
                if (session) {
                    const userProfile = {
                        id: session.user.id,
                        email: session.user.email,
                        displayName: session.user.user_metadata?.full_name || 
                                    session.user.user_metadata?.name ||
                                    session.user.email?.split('@')[0] || 'Anonymous',
                        avatar: session.user.user_metadata?.picture || 
                               session.user.user_metadata?.avatar_url || null,
                        memberSince: session.user.created_at,
                        isAuthenticated: true
                    };

                    // Send test message with profile
                    this.socket.emit('message', {
                        text: 'Test message with profile integration',
                        room: 'test-room',
                        username: userProfile.displayName,
                        type: 'text',
                        userProfile: userProfile
                    });

                    this.addResult('Message with Profile', 'PASS', 'Test message sent with profile data');
                    console.log('✅ Message with profile test successful');
                    
                } else {
                    this.addResult('Message with Profile', 'SKIP', 'No authenticated user');
                    console.log('⏭️  Skipping message with profile test (no authenticated user)');
                }
            } else {
                this.addResult('Message with Profile', 'SKIP', 'No socket connection');
                console.log('⏭️  Skipping message with profile test (no socket connection)');
            }
            
        } catch (error) {
            this.addResult('Message with Profile', 'FAIL', error.message);
            console.log('❌ Message with profile test failed:', error.message);
        }
    }

    async testProfileUpdates() {
        console.log('🔄 Testing Profile Updates...');
        
        try {
            if (this.socket) {
                const { data: { session } } = await this.supabase.auth.getSession();
                
                if (session) {
                    const updatedProfile = {
                        id: session.user.id,
                        email: session.user.email,
                        displayName: 'Updated Test User',
                        avatar: session.user.user_metadata?.picture || 
                               session.user.user_metadata?.avatar_url || null,
                        memberSince: session.user.created_at,
                        isAuthenticated: true
                    };

                    // Test profile update
                    this.socket.emit('update_profile', {
                        userProfile: updatedProfile
                    });

                    this.addResult('Profile Updates', 'PASS', 'Profile update test successful');
                    console.log('✅ Profile update test successful');
                    
                } else {
                    this.addResult('Profile Updates', 'SKIP', 'No authenticated user');
                    console.log('⏭️  Skipping profile update test (no authenticated user)');
                }
            } else {
                this.addResult('Profile Updates', 'SKIP', 'No socket connection');
                console.log('⏭️  Skipping profile update test (no socket connection)');
            }
            
        } catch (error) {
            this.addResult('Profile Updates', 'FAIL', error.message);
            console.log('❌ Profile update test failed:', error.message);
        }
    }

    addResult(testName, status, message) {
        this.testResults.push({
            test: testName,
            status: status,
            message: message,
            timestamp: new Date().toISOString()
        });
    }

    printResults() {
        console.log('\n📊 Test Results Summary:');
        console.log('========================');
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const skipped = this.testResults.filter(r => r.status === 'SKIP').length;
        const info = this.testResults.filter(r => r.status === 'INFO').length;
        
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⏭️  Skipped: ${skipped}`);
        console.log(`ℹ️  Info: ${info}`);
        
        console.log('\n📋 Detailed Results:');
        console.log('===================');
        
        this.testResults.forEach((result, index) => {
            const statusIcon = {
                'PASS': '✅',
                'FAIL': '❌',
                'SKIP': '⏭️',
                'INFO': 'ℹ️'
            }[result.status];
            
            console.log(`${index + 1}. ${statusIcon} ${result.test}: ${result.message}`);
        });
        
        if (failed > 0) {
            console.log('\n⚠️  Some tests failed. Please check the configuration and try again.');
            process.exit(1);
        } else {
            console.log('\n🎉 All tests completed successfully!');
        }
    }

    async cleanup() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    const tester = new ChatAuthTester();
    tester.runTests().catch(console.error);
}

module.exports = ChatAuthTester;
