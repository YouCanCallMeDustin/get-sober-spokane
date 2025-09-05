-- Check the current structure of forum_comments table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'forum_comments' 
ORDER BY ordinal_position;
