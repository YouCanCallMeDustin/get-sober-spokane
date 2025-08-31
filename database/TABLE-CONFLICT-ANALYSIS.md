# Database Table Conflict Analysis - Sober Spokane

## 🚨 Critical Issues Identified

### **1. Duplicate Profile Tables (HIGH PRIORITY)**
Your application has **THREE different profile tables** that are causing major conflicts:

| Table Name | Used In | Primary Key | Structure | Status |
|------------|---------|-------------|-----------|---------|
| `profiles` | `server.js`, dashboard | `id` (UUID) | Basic profile fields | ❌ Conflicting |
| `user_profiles` | `userController.js` | `id` (SERIAL) | Sobriety tracking | ❌ Conflicting |
| `forum_user_profiles` | Forum, auth | `id` (UUID) | Forum-specific fields | ❌ Conflicting |

**Problem**: Each table has different schemas and primary key types, causing data inconsistency and profile loading failures.

### **2. Inconsistent Data Sources**
Your application code is trying to fetch user data from different tables:

```javascript
// server.js - uses 'profiles' table
.from('profiles')

// userController.js - uses 'user_profiles' table  
.from('user_profiles')

// community forum - uses 'forum_user_profiles' table
.from('forum_user_profiles')
```

**Problem**: This creates a situation where user data is scattered across multiple tables with no single source of truth.

### **3. Schema Mismatches**
Each profile table has different column structures:

- **`profiles`**: `id`, `email`, `display_name`, `bio`, `sobriety_start_date`, etc.
- **`user_profiles`**: `id`, `user_id`, `sobriety_date`, `bio`, `location`, etc.
- **`forum_user_profiles`**: `id`, `user_id`, `display_name`, `avatar_url`, etc.

**Problem**: Different column names and data types make it impossible to consistently retrieve user information.

## 🔧 Solution: Table Consolidation

### **Step 1: Run the Consolidation Script**
Execute `consolidated-profile-schema.sql` in your Supabase SQL Editor:

```sql
-- This will:
-- 1. Create a new consolidated profiles_consolidated table
-- 2. Migrate data from all three existing tables
-- 3. Create backward-compatible views
-- 4. Set up proper RLS policies
```

### **Step 2: Verify Data Migration**
Check that all user data has been successfully migrated to the new consolidated table.

### **Step 3: Clean Up Duplicate Tables**
Execute `cleanup-duplicate-tables.sql` to remove the conflicting tables.

## 📊 Other Table Analysis

### **Forum-Related Tables (No Conflicts)**
- `forum_posts` ✅
- `forum_comments` ✅
- `forum_categories` ✅
- `forum_votes` ✅
- `forum_stats` ✅
- `forum_threads` ✅

### **User Achievement Tables (Potential Overlap)**
- `achievements` ✅
- `user_achievements` ✅
- `forum_user_achievements` ⚠️ **Potential duplicate of user_achievements**

### **Voting Tables (Potential Overlap)**
- `forum_votes` ✅
- `post_votes` ⚠️ **Potential duplicate of forum_votes**
- `forum_post_votes` ⚠️ **Potential duplicate of forum_votes**

### **Notification Tables (Potential Overlap)**
- `notifications` ✅
- `user_notifications` ⚠️ **Potential duplicate of notifications**
- `user_notification_preferences` ✅

## 🎯 Immediate Action Items

### **Priority 1: Fix Profile Tables (CRITICAL)**
1. ✅ Run `consolidated-profile-schema.sql`
2. ✅ Verify data migration
3. ✅ Run `cleanup-duplicate-tables.sql`

### **Priority 2: Review Achievement Tables**
1. Compare `user_achievements` vs `forum_user_achievements`
2. Determine if they serve different purposes
3. Consolidate if they're duplicates

### **Priority 3: Review Voting Tables**
1. Compare `forum_votes`, `post_votes`, and `forum_post_votes`
2. Determine the intended purpose of each
3. Consolidate duplicate functionality

### **Priority 4: Review Notification Tables**
1. Compare `notifications` vs `user_notifications`
2. Determine if they serve different purposes
3. Consolidate if they're duplicates

## 🔍 Code Changes Required

After running the consolidation scripts, you may need to update some code references:

### **Update userController.js**
```javascript
// Change from:
.from('user_profiles')

// To:
.from('profiles') // This will now use the consolidated table via view
```

### **Update community forum code**
```javascript
// Change from:
.from('forum_user_profiles')

// To:
.from('profiles') // This will now use the consolidated table via view
```

## ✅ Expected Results After Fix

1. **Profile pages will load consistently** - No more missing attributes
2. **Single source of truth** - All profile data in one place
3. **Consistent data structure** - Same columns and data types across the app
4. **Better performance** - No more cross-table joins for basic profile data
5. **Easier maintenance** - One table to update instead of three

## 🚨 Warnings

- **Backup your database** before running these scripts
- **Test in development** before applying to production
- **Verify data migration** before running cleanup scripts
- **Update application code** to use consistent table references

## 📞 Support

If you encounter issues during the consolidation process:
1. Check the Supabase logs for error messages
2. Verify that all required columns exist in the source tables
3. Ensure you have proper permissions to create/drop tables
4. Test the views after consolidation to ensure backward compatibility
