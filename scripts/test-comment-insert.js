// Test script to check comment insertion and see exact error
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCommentInsertion() {
    console.log('🧪 Testing comment insertion to see exact error...\n');
    
    try {
        // First, let's see what posts exist
        console.log('📋 Checking existing posts...');
        const { data: posts, error: postsError } = await supabase
            .from('forum_posts')
            .select('id, title')
            .limit(1);
        
        if (postsError) {
            console.error('❌ Error fetching posts:', postsError);
            return;
        }
        
        if (!posts || posts.length === 0) {
            console.log('❌ No posts found. Creating a test post first...');
            
            // Create a test post
            const { data: newPost, error: postError } = await supabase
                .from('forum_posts')
                .insert([{
                    title: 'Test Post for Comment',
                    content: 'This is a test post to test comment insertion',
                    user_id: '00000000-0000-0000-0000-000000000000',
                    category: 'General Discussion',
                    tags: ['test'],
                    upvotes: 0,
                    downvotes: 0,
                    comments_count: 0,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (postError) {
                console.error('❌ Error creating test post:', postError);
                return;
            }
            
            console.log('✅ Test post created:', newPost.id);
            var testPostId = newPost.id;
        } else {
            console.log('✅ Found existing post:', posts[0].title);
            var testPostId = posts[0].id;
        }
        
        // Now try to insert a comment
        console.log('\n🧪 Testing comment insertion...');
        const testComment = {
            post_id: testPostId,
            user_id: '00000000-0000-0000-0000-000000000000',
            content: 'Test comment to check table structure',
            created_at: new Date().toISOString()
        };
        
        console.log('📤 Attempting to insert comment with data:', testComment);
        
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
            
            // Check if it's the name column error
            if (insertError.message.includes('column "name" does not exist')) {
                console.log('\n🔍 DIAGNOSIS: The "name" column is missing from forum_comments table');
                console.log('💡 SOLUTION: Run the SQL script to add the missing column');
            }
        } else {
            console.log('✅ Comment inserted successfully:', insertData);
            
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

testCommentInsertion();
