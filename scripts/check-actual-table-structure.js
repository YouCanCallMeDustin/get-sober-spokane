// Check what table structure actually exists for forum_comments
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
    console.log('🔍 Checking ACTUAL forum_comments table structure...\n');
    
    try {
        // Try to get the table structure by attempting a simple select
        console.log('📋 Attempting to select from forum_comments...');
        const { data, error } = await supabase
            .from('forum_comments')
            .select('*')
            .limit(1);
        
        if (error) {
            console.log('❌ Error selecting from forum_comments:');
            console.log('   Code:', error.code);
            console.log('   Message:', error.message);
            console.log('   Details:', error.details);
        } else {
            console.log('✅ Successfully selected from forum_comments');
            if (data && data.length > 0) {
                console.log('📊 Sample row structure:');
                console.log(JSON.stringify(data[0], null, 2));
            } else {
                console.log('📊 Table is empty, but structure is accessible');
            }
        }
        
        // Try to insert a test comment to see the exact error
        console.log('\n🧪 Testing comment insertion...');
        const testComment = {
            post_id: '00000000-0000-0000-0000-000000000000',
            user_id: '00000000-0000-0000-0000-000000000000',
            content: 'Test comment structure check',
            created_at: new Date().toISOString()
        };
        
        const { data: insertData, error: insertError } = await supabase
            .from('forum_comments')
            .insert([testComment])
            .select()
            .single();
        
        if (insertError) {
            console.log('❌ INSERT ERROR:');
            console.log('   Code:', insertError.code);
            console.log('   Message:', insertError.message);
            console.log('   Details:', insertError.details);
            console.log('   Hint:', insertError.hint);
        } else {
            console.log('✅ Comment inserted successfully!');
            console.log('📝 Inserted data:', insertData);
            
            // Clean up
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
