require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUsers() {
  try {
    console.log('🔍 Checking for users in your database...\n');
    
    // Check auth.users table
    console.log('1. Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error accessing auth.users:', authError.message);
    } else if (authUsers && authUsers.users) {
      console.log(`✅ Found ${authUsers.users.length} users in auth.users:`);
      authUsers.users.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}`);
        console.log(`      Email: ${user.email || 'No email'}`);
        console.log(`      Created: ${user.created_at}`);
        console.log(`      Metadata: ${JSON.stringify(user.user_metadata || {})}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No users found in auth.users');
    }
    
    // Check user_profiles table
    console.log('2. Checking user_profiles table...');
    const { data: profileUsers, error: profileError } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (profileError) {
      console.error('❌ Error accessing user_profiles:', profileError.message);
    } else if (profileUsers && profileUsers.length > 0) {
      console.log(`✅ Found ${profileUsers.length} users in user_profiles:`);
      profileUsers.forEach((profile, index) => {
        console.log(`   ${index + 1}. User ID: ${profile.user_id}`);
        console.log(`      Sobriety Date: ${profile.sobriety_date || 'Not set'}`);
        console.log(`      Bio: ${profile.bio || 'No bio'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No users found in user_profiles');
    }
    
    // Check forum_posts table
    console.log('3. Checking forum_posts table...');
    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select('user_id, title, created_at')
      .limit(5);
    
    if (postsError) {
      console.error('❌ Error accessing forum_posts:', postsError.message);
    } else if (posts && posts.length > 0) {
      console.log(`✅ Found ${posts.length} posts in forum_posts:`);
      posts.forEach((post, index) => {
        console.log(`   ${index + 1}. User ID: ${post.user_id}`);
        console.log(`      Title: ${post.title}`);
        console.log(`      Created: ${post.created_at}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No posts found in forum_posts');
    }
    
    console.log('🎯 To test the user profile route, use one of the user IDs above:');
    console.log('   Example: http://localhost:3000/user/[USER_ID_HERE]');
    
  } catch (error) {
    console.error('❌ Error in testUsers:', error);
  }
}

testUsers();
