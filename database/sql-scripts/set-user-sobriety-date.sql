-- Set sobriety date for user (replace with your actual date)
-- Run this in your Supabase SQL editor

UPDATE forum_user_profiles 
SET sobriety_date = '2025-03-22'  -- Replace with your actual sobriety date
WHERE user_id = '28e16828-ecea-4860-95a3-91ceed462c3e';  -- Your user ID

-- Verify the update
SELECT user_id, display_name, sobriety_date, 
       CASE 
         WHEN sobriety_date IS NOT NULL 
         THEN EXTRACT(DAY FROM (NOW() - sobriety_date::date))
         ELSE 0 
       END as days_sober
FROM forum_user_profiles 
WHERE user_id = '28e16828-ecea-4860-95a3-91ceed462c3e';
