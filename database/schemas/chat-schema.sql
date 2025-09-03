-- Chat System Database Schema for Sober Spokane
-- This script creates the necessary tables for the real-time chat functionality

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat Rooms Table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    max_users INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    room TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- User Presence Table
CREATE TABLE IF NOT EXISTS user_presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    room TEXT NOT NULL,
    username TEXT NOT NULL,
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline')),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    socket_id TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, room)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_room ON user_presence(room);
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON user_presence(last_seen);

-- Insert default chat rooms
INSERT INTO chat_rooms (name, description) VALUES
    ('general', 'General Support - General recovery support and community discussion'),
    ('recovery', 'Recovery Journey - Share your recovery journey and milestones'),
    ('crisis', 'Crisis Support - Immediate support for crisis situations'),
    ('celebrations', 'Celebrations - Celebrate sobriety milestones and achievements')
ON CONFLICT (name) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_chat_rooms_updated_at 
    BEFORE UPDATE ON chat_rooms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_presence_updated_at 
    BEFORE UPDATE ON user_presence 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to clean up old presence records
CREATE OR REPLACE FUNCTION cleanup_old_presence()
RETURNS void AS $$
BEGIN
    -- Remove presence records older than 24 hours
    DELETE FROM user_presence 
    WHERE last_seen < NOW() - INTERVAL '24 hours';
END;
$$ language 'plpgsql';

-- Grant necessary permissions (adjust based on your Supabase setup)
-- These are typically handled by Supabase automatically
