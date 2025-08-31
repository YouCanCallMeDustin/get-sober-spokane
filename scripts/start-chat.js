#!/usr/bin/env node

/**
 * Chat Server Startup Script
 * Starts the WebSocket chat server
 */

const ChatServer = require('../src/chat-server');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Configuration
const config = {
    port: process.env.CHAT_PORT || 3001,
    host: process.env.CHAT_HOST || 'localhost',
    logLevel: process.env.CHAT_LOG_LEVEL || 'info'
};

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Setup logging
const logFile = path.join(logsDir, 'chat-server.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Override console methods to also log to file
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = function(...args) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] [INFO] ${args.join(' ')}\n`;
    logStream.write(message);
    originalLog.apply(console, args);
};

console.error = function(...args) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] [ERROR] ${args.join(' ')}\n`;
    logStream.write(message);
    originalError.apply(console, args);
};

console.warn = function(...args) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] [WARN] ${args.join(' ')}\n`;
    logStream.write(message);
    originalWarn.apply(console, args);
};

// Startup function
async function startChatServer() {
    try {
        console.log('🚀 Starting Chat Server...');
        console.log(`📋 Configuration:`);
        console.log(`   Port: ${config.port}`);
        console.log(`   Host: ${config.host}`);
        console.log(`   Log Level: ${config.logLevel}`);
        console.log(`   Log File: ${logFile}`);

        // Create and start chat server
        const chatServer = new ChatServer(config.port);
        
        // Start the server
        chatServer.start();

        // Setup graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
            shutdown(chatServer);
        });

        process.on('SIGTERM', () => {
            console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
            shutdown(chatServer);
        });

        process.on('uncaughtException', (error) => {
            console.error('💥 Uncaught Exception:', error);
            shutdown(chatServer);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
            shutdown(chatServer);
        });

        console.log('✅ Chat Server started successfully!');
        console.log(`🌐 Server running at: http://${config.host}:${config.port}`);
        console.log(`📊 Health check: http://${config.host}:${config.port}/health`);
        console.log(`📈 Statistics: http://${config.host}:${config.port}/api/chat/stats`);

    } catch (error) {
        console.error('💥 Failed to start Chat Server:', error);
        process.exit(1);
    }
}

// Shutdown function
async function shutdown(chatServer) {
    try {
        console.log('🔄 Shutting down Chat Server...');
        
        if (chatServer) {
            chatServer.stop();
        }
        
        // Close log stream
        if (logStream) {
            logStream.end();
        }
        
        console.log('✅ Chat Server shutdown complete');
        process.exit(0);
        
    } catch (error) {
        console.error('💥 Error during shutdown:', error);
        process.exit(1);
    }
}

// Start the server
startChatServer();
