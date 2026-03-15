const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, serviceKey);

async function applyFix() {
  console.log('--- Applying SQL Fixes ---');
  
  const sql = `
    -- 1. Add missing column to forum_user_profiles
    ALTER TABLE public.forum_user_profiles 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    -- 2. Update the handle_new_user trigger function to be more robust
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Ensure user exists in forum_user_profiles
        INSERT INTO public.forum_user_profiles (user_id, display_name, join_date, updated_at)
        VALUES (
          NEW.id, 
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', NEW.email), 
          NOW(),
          NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          updated_at = NOW();

        -- Ensure user exists in profiles_consolidated
        INSERT INTO public.profiles_consolidated (user_id, email, display_name, created_at, updated_at)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', NEW.email),
          NOW(),
          NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          email = EXCLUDED.email,
          display_name = EXCLUDED.display_name,
          updated_at = NOW();

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 3. Sync existing users between tables
    INSERT INTO public.profiles_consolidated (user_id, display_name, created_at, updated_at)
    SELECT user_id, display_name, join_date, updated_at
    FROM public.forum_user_profiles
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.forum_user_profiles (user_id, display_name, join_date, updated_at)
    SELECT user_id, display_name, created_at, updated_at
    FROM public.profiles_consolidated
    ON CONFLICT (user_id) DO NOTHING;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    console.error('Error applying SQL fixes:', error);
  } else {
    console.log('SQL fixes applied successfully.');
    
    // Reload schema cache just in case
    await supabase.rpc('exec_sql', {
      sql: "NOTIFY pgrst, 'reload schema';"
    });
    console.log('Schema reload notified.');
  }
}

applyFix();
