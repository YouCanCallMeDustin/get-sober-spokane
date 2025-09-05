// Test comment insertion with YOUR actual user ID
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://iquczuhmkemjytrqnbxg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdWN6dWhta2Vtanl0cnFuYnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMDMzMjcsImV4cCI6MjA2OTY3OTMyN30.FFzZFBUAM1ZgQSTlzPNSuJIikUiQkvSBKvc19wdzulk';

async function testWithYourUser() {
    console.log('🧪 Testing Comment Insertion with YOUR User ID...\n');
    
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Use YOUR actual user ID from the auth test
        const yourUserId = '28e16828-ecea-4860-95a3-91ceed462c3e';
        
        console.log(`👤 Using your user ID: ${yourUserId}`);
        
        // Get a post to comment on
        const { data: posts, error: postsError } = await supabase
            .from('forum_posts')
            .select('id, title')
            .limit(1);
        
        if (postsError) {
            console.log(`❌ Error fetching posts: ${postsError.message}`);
            return;
        }
        
        if (!posts || posts.length === 0) {
            console.log('❌ No posts available for testing');
            return;
        }
        
        const testPostId = posts[0].id;
        console.log(`📝 Testing with post: "${posts[0].title}" (${testPostId})`);
        
        // Test 1: Try inserting with name field
        console.log('\n💬 Test 1: Inserting comment WITH name field...');
        const commentWithName = {
            post_id: testPostId,
            user_id: yourUserId,
            content: 'Test comment with name field - ' + new Date().toISOString(),
            created_at: new Date().toISOString(),
            name: 'Test User'
        };
        
        const { data: insertedComment1, error: insertError1 } = await supabase
            .from('forum_comments')
            .insert([commentWithName])
            .select()
            .single();
        
        if (insertError1) {
            console.log(`❌ Insert with name failed: ${insertError1.message}`);
            console.log(`   Error code: ${insertError1.code}`);
            console.log(`   Error details: ${insertError1.details}`);
        } else {
            console.log('✅ Insert with name succeeded!');
            console.log(`   Comment ID: ${insertedComment1.id}`);
            
            // Clean up
            await supabase
                .from('forum_comments')
                .delete()
                .eq('id', insertedComment1.id);
            console.log('   🧹 Cleaned up test comment');
        }
        
        // Test 2: Try inserting WITHOUT name field
        console.log('\n💬 Test 2: Inserting comment WITHOUT name field...');
        const commentWithoutName = {
            post_id: testPostId,
            user_id: yourUserId,
            content: 'Test comment without name field - ' + new Date().toISOString(),
            created_at: new Date().toISOString()
        };
        
        const { data: insertedComment2, error: insertError2 } = await supabase
            .from('forum_comments')
            .insert([commentWithoutName])
            .select()
            .single();
        
        if (insertError2) {
            console.log(`❌ Insert without name failed: ${insertError2.message}`);
            console.log(`   Error code: ${insertError2.code}`);
            console.log(`   Error details: ${insertError2.details}`);
        } else {
            console.log('✅ Insert without name succeeded!');
            console.log(`   Comment ID: ${insertedComment2.id}`);
            
            // Clean up
            await supabase
                .from('forum_comments')
                .delete()
                .eq('id', insertedComment2.id);
            console.log('   🧹 Cleaned up test comment');
        }
        
        // Test 3: Check RLS policies
        console.log('\n🔒 Test 3: Checking RLS policies...');
        
        // Try to get your user profile
        const { data: profile, error: profileError } = await supabase
            .from('forum_user_profiles')
            .select('*')
            .eq('user_id', yourUserId)
            .single();
        
        if (profileError) {
            console.log(`❌ Profile error: ${profileError.message}`);
            console.log('   This might explain why comments fail - no user profile');
        } else {
            console.log('✅ User profile found:');
            console.log(`   Display name: ${profile.display_name}`);
            console.log(`   Join date: ${profile.join_date}`);
        }
        
        console.log('\n🎉 Test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testWithYourUser();
