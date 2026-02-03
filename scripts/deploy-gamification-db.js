require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function deploy() {
    console.log('Deploying gamification database tables...');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase credentials in .env');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const sqlPath = path.join(__dirname, '../src/sql/init-gamification.sql');
    let sqlContent;

    try {
        sqlContent = fs.readFileSync(sqlPath, 'utf8');
    } catch (err) {
        console.error('Failed to read SQL file:', err);
        process.exit(1);
    }

    console.log('Executing SQL...');

    // Use exec_sql RPC if available, or error out
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
        console.error('Deployment failed:', error);

        // Fallback: Try to execute via REST if RPC fails (this usually won't work for huge DDL but worth a try IF rpc is missing)
        // Actually, if RPC fails, we likely don't have permissions or the function.
        // Let's assume the RPC exists since previous features use it.
        process.exit(1);
    }

    console.log('✅ Gamification tables deployed successfully!');
}

deploy();
