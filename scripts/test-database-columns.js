// Test script to check what columns actually exist in forum_comments table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
    console.log('🔍 Checking forum_comments table structure...\n');
    
    try {
        // Query the information_schema to see what columns actually exist
        const { data, error } = await supabase
            .rpc('exec_sql', {
                query: `
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns 
                    WHERE table_name = 'forum_comments' 
                    ORDER BY ordinal_position;
                `
            });
        
        if (error) {
            console.error('❌ Error querying table structure:', error);
            return;
        }
        
        console.log('📋 Current forum_comments table columns:');
        console.log('=====================================');
        if (data && data.length > 0) {
            data.forEach(col => {
                console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
            });
        } else {
            console.log('❌ No columns found or table does not exist');
        }
        
        // Try to insert a test comment to see what error we get
        console.log('\n🧪 Testing comment insertion...');
        const testComment = {
            post_id: '00000000-0000-0000-0000-000000000000',
            user_id: '00000000-0000-0000-0000-000000000000',
            content: 'Test comment to check table structure',
            created_at: new Date().toISOString()
        };
        
        const { data: insertData, error: insertError } = await supabase
            .from('forum_comments')
            .insert([testComment])
            .select()
            .single();
        
        if (insertError) {
            console.log('❌ Insert error:', insertError.message);
            console.log('   Error code:', insertError.code);
            console.log('   Error details:', insertError.details);
        } else {
            console.log('✅ Comment inserted successfully:', insertData);
            
            // Clean up test data
            await supabase
                .from('forum_comments')
                .delete()
                .eq('id', insertData.id);
            console.log('🧹 Test data cleaned up');
        }
        
    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

checkTableStructure();
