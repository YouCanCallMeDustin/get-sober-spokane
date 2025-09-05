// Script to investigate existing comments and their storage
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://iquczuhmkemjytrqnbxg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdWN6dWhta2Vtanl0cnFuYnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMDMzMjcsImV4cCI6MjA2OTY3OTMyN30.FFzZFBUAM1ZgQSTlzPNSuJIikUiQkvSBKvc19wdzulk';

async function investigateComments() {
    console.log('🔍 Investigating Existing Comments...\n');
    
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // 1. Check all tables that might contain comments
        console.log('📋 Step 1: Checking all potential comment tables...');
        
        const tablesToCheck = [
            'forum_comments',
            'comments', 
            'post_comments',
            'user_comments',
            'messages',
            'chat_messages'
        ];
        
        for (const tableName of tablesToCheck) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(5);
                
                if (error) {
                    console.log(`❌ ${tableName}: ${error.message}`);
                } else {
                    console.log(`✅ ${tableName}: Found ${data.length} records`);
                    if (data.length > 0) {
                        console.log(`   Sample record keys: ${Object.keys(data[0]).join(', ')}`);
                        console.log(`   Sample content: ${data[0].content || data[0].message || 'N/A'}`);
                    }
                }
            } catch (err) {
                console.log(`❌ ${tableName}: Table doesn't exist or access denied`);
            }
        }
        
        // 2. Check forum_comments table structure in detail
        console.log('\n📋 Step 2: Detailed forum_comments analysis...');
        
        const { data: comments, error: commentsError } = await supabase
            .from('forum_comments')
            .select('*')
            .limit(10);
        
        if (commentsError) {
            console.log(`❌ Error fetching forum_comments: ${commentsError.message}`);
        } else {
            console.log(`✅ Found ${comments.length} comments in forum_comments table`);
            
            if (comments.length > 0) {
                console.log('\n📊 Comment structure analysis:');
                const sampleComment = comments[0];
                Object.keys(sampleComment).forEach(key => {
                    const value = sampleComment[key];
                    const type = typeof value;
                    console.log(`   ${key}: ${type} = ${value === null ? 'NULL' : value}`);
                });
                
                // Check if name column exists
                if ('name' in sampleComment) {
                    console.log('\n✅ "name" column EXISTS in forum_comments!');
                    console.log('   This means the column was added but might have NULL values');
                } else {
                    console.log('\n❌ "name" column does NOT exist in forum_comments');
                }
            }
        }
        
        // 3. Check if there are any posts with comment counts
        console.log('\n📋 Step 3: Checking posts with comment counts...');
        
        const { data: posts, error: postsError } = await supabase
            .from('forum_posts')
            .select('id, title, comments_count, created_at')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (postsError) {
            console.log(`❌ Error fetching posts: ${postsError.message}`);
        } else {
            console.log(`✅ Found ${posts.length} posts`);
            posts.forEach(post => {
                console.log(`   "${post.title}" - Comments: ${post.comments_count || 0} (${post.id})`);
            });
        }
        
        // 4. Try to find comments by post_id
        if (posts && posts.length > 0) {
            console.log('\n📋 Step 4: Looking for comments on specific posts...');
            
            for (const post of posts.slice(0, 3)) {
                console.log(`\n🔍 Checking comments for post: "${post.title}"`);
                
                const { data: postComments, error: postCommentsError } = await supabase
                    .from('forum_comments')
                    .select('*')
                    .eq('post_id', post.id);
                
                if (postCommentsError) {
                    console.log(`   ❌ Error: ${postCommentsError.message}`);
                } else {
                    console.log(`   ✅ Found ${postComments.length} comments`);
                    if (postComments.length > 0) {
                        postComments.forEach((comment, index) => {
                            console.log(`     Comment ${index + 1}: ${comment.content?.substring(0, 50)}...`);
                            console.log(`       User: ${comment.user_id}, Created: ${comment.created_at}`);
                        });
                    }
                }
            }
        }
        
        console.log('\n🎉 Investigation complete!');
        
    } catch (error) {
        console.error('❌ Investigation failed:', error.message);
    }
}

investigateComments();
