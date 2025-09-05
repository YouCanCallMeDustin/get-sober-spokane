// Test script for comment functionality
const { createClient } = require('@supabase/supabase-js');

// Test configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iquczuhmkemjytrqnbxg.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdWN6dWhta2Vtanl0cnFuYnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMDMzMjcsImV4cCI6MjA2OTY3OTMyN30.FFzZFBUAM1ZgQSTlzPNSuJIikUiQkvSBKvc19wdzulk';

async function testCommentFunctionality() {
    console.log('🧪 Testing Comment Functionality...\n');
    
    try {
        // Initialize Supabase client
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized');
        
        // Test 1: Check if forum_comments table exists and get its structure
        console.log('\n📋 Test 1: Checking forum_comments table structure...');
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'forum_comments');
            
        if (columnsError) {
            console.log('❌ Error checking table structure:', columnsError.message);
        } else {
            console.log('✅ Table structure found:');
            columns.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
            });
        }
        
        // Test 2: Check if there are any existing comments
        console.log('\n📊 Test 2: Checking existing comments...');
        const { data: existingComments, error: commentsError } = await supabase
            .from('forum_comments')
            .select('*')
            .limit(5);
            
        if (commentsError) {
            console.log('❌ Error fetching comments:', commentsError.message);
        } else {
            console.log(`✅ Found ${existingComments.length} existing comments`);
            if (existingComments.length > 0) {
                console.log('   Sample comment structure:', Object.keys(existingComments[0]));
            }
        }
        
        // Test 3: Check if there are any forum posts to comment on
        console.log('\n📝 Test 3: Checking forum posts...');
        const { data: posts, error: postsError } = await supabase
            .from('forum_posts')
            .select('id, title, user_id')
            .limit(3);
            
        if (postsError) {
            console.log('❌ Error fetching posts:', postsError.message);
        } else {
            console.log(`✅ Found ${posts.length} forum posts`);
            if (posts.length > 0) {
                console.log('   Available posts for testing:');
                posts.forEach(post => {
                    console.log(`   - ${post.id}: ${post.title}`);
                });
            }
        }
        
        // Test 4: Test comment insertion (if we have posts)
        if (posts && posts.length > 0) {
            console.log('\n💬 Test 4: Testing comment insertion...');
            const testPostId = posts[0].id;
            const testComment = {
                post_id: testPostId,
                user_id: '00000000-0000-0000-0000-000000000000', // Test user ID
                content: 'Test comment from automated test - ' + new Date().toISOString(),
                created_at: new Date().toISOString()
            };
            
            console.log('   Attempting to insert test comment...');
            const { data: insertedComment, error: insertError } = await supabase
                .from('forum_comments')
                .insert([testComment])
                .select()
                .single();
                
            if (insertError) {
                console.log('❌ Comment insertion failed:', insertError.message);
                console.log('   Error code:', insertError.code);
                console.log('   Error details:', insertError.details);
            } else {
                console.log('✅ Comment insertion successful!');
                console.log('   Inserted comment ID:', insertedComment.id);
                
                // Clean up test comment
                console.log('   Cleaning up test comment...');
                const { error: deleteError } = await supabase
                    .from('forum_comments')
                    .delete()
                    .eq('id', insertedComment.id);
                    
                if (deleteError) {
                    console.log('⚠️  Warning: Could not clean up test comment:', deleteError.message);
                } else {
                    console.log('✅ Test comment cleaned up successfully');
                }
            }
        } else {
            console.log('⚠️  Skipping comment insertion test - no posts available');
        }
        
        console.log('\n🎉 Comment functionality test completed!');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run the test
testCommentFunctionality();
