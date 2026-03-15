const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, serviceKey);

async function finalAudit() {
  console.log('--- Checking Columns for recovery_milestones ---');
  const { data: cols, error: cError } = await supabase.rpc('get_schema_info', {
    query: "SELECT column_name FROM information_schema.columns WHERE table_name = 'recovery_milestones'"
  });

  if (cError) {
    console.error('Error:', cError);
  } else {
    console.log('Columns in recovery_milestones:', JSON.stringify(cols, null, 2));
  }
}

finalAudit();
