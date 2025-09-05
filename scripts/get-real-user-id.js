// Get the real authenticated user ID
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getRealUserId() {
    console.log('🔍 Getting real authenticated user ID...\n');
    
    try {
        // Check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.error('❌ Error getting session:', sessionError);
            return;
        }
        
        if (!session) {
            console.log('❌ No active session - you need to be logged in');
            console.log('💡 Please log in to your account first');
            return;
        }
        
        console.log('✅ You are logged in!');
        console.log('👤 User ID:', session.user.id);
        console.log('📧 Email:', session.user.email);
        
        // Now test comment insertion with the real user ID
        console.log('\n🧪 Testing comment insertion with real user ID...');
        
        // Get a real post to comment on
        const { data: posts, error: postsError } = await supabase
            .from('forum_posts')
            .select('id, title')
            .limit(1);
        
        if (postsError) {
            console.error('❌ Error fetching posts:', postsError);
            return;
        }
        
        if (!posts || posts.length === 0) {
            console.log('❌ No posts found to comment on');
            return;
        }
        
        const testComment = {
            post_id: posts[0].id,
            user_id: session.user.id, // Use the REAL authenticated user ID
            content: 'Test comment with real user ID',
            created_at: new Date().toISOString()
        };
        
        console.log('📤 Attempting to insert comment with real user ID:', session.user.id);
        
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
        } else {
            console.log('✅ Comment inserted successfully!');
            console.log('📝 Comment data:', insertData);
            
            // Clean up test data
            await supabase
                .from('forum_comments')
                .delete()
                .eq('id', insertData.id);
            console.log('🧹 Test comment cleaned up');
        }
        
    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

getRealUserId();
