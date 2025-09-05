/**
 * Chat Database Fix Script
 * This script provides the exact SQL commands you need to run in Supabase SQL Editor
 */

console.log('🔧 CHAT DATABASE FIX INSTRUCTIONS');
console.log('=====================================\n');

console.log('📋 STEP 1: Run this SQL in Supabase SQL Editor to fix the user_presence table:');
console.log('');

const fixUserPresenceSQL = `
-- Fix user_presence table structure
-- Drop the existing table if it has wrong structure
DROP TABLE IF EXISTS user_presence CASCADE;

-- Recreate user_presence table with correct structure
CREATE TABLE user_presence (
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
CREATE INDEX idx_user_presence_room ON user_presence(room);
CREATE INDEX idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX idx_user_presence_status ON user_presence(status);
CREATE INDEX idx_user_presence_last_seen ON user_presence(last_seen);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_presence_updated_at 
    BEFORE UPDATE ON user_presence 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON user_presence TO anon, authenticated;
`;

console.log(fixUserPresenceSQL);

console.log('\n📋 STEP 2: After running the SQL above, restart your chat server:');
console.log('   node scripts/start-server.js');
console.log('');

console.log('📋 STEP 3: Test the chat functionality by visiting:');
console.log('   http://localhost:3000/chat');
console.log('');

console.log('📋 STEP 4: Check if online users are now showing up correctly.');
console.log('');

console.log('🔧 If you still have issues, you may also need to run the complete consolidation:');
console.log('   Copy and paste the contents of database/schemas/COMPLETE-TABLE-CONSOLIDATION.sql');
console.log('   into Supabase SQL Editor and run it.');
console.log('');

console.log('📋 TROUBLESHOOTING:');
console.log('   - Make sure your Supabase environment variables are set correctly');
console.log('   - Check that the chat server is running on the correct port');
console.log('   - Verify that Socket.IO connections are working');
console.log('   - Check browser console for any JavaScript errors');
console.log('');

console.log('✅ The main issue was that the user_presence table was missing the is_anonymous column');
console.log('   and had incorrect column names (user_name instead of username).');
console.log('   This fix should resolve the "No users online" issue.');
