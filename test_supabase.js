
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cwkpprcemnspgeoezfrp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3a3BwcmNlbW5zcGdlb2V6ZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTM4MzQzNCwiZXhwIjoyMDg0OTU5NDM0fQ.OJ9Syt3lRNnL0CPvzNkAjwWaUB3WNPCwE7tbuqFOiYw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkResources() {
    console.log('Querying Supabase...');
    try {
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .ilike('name', '%Celebrate Recovery%');

        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Results Count:', data.length);
            console.log('Results:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

checkResources();
