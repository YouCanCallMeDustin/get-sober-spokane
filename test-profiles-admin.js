const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: 'c:/Users/dusti/OneDrive/Desktop/Sober Spokane/.env'});
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('profiles_consolidated').select('*').limit(5);
  console.log('Service Role Test Data:', data);
  console.log('Error:', error);
}
test();
