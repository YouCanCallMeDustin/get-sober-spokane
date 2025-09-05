// Database Structure Analysis Script
// This script analyzes your existing database structure and generates forum upgrade code
// Run this with: node scripts/analyze-database-structure.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials. Please check your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

class DatabaseAnalyzer {
    constructor() {
        this.existingTables = new Map();
        this.existingPolicies = new Map();
        this.existingIndexes = new Map();
        this.existingColumns = new Map();
        this.conflicts = [];
        this.recommendations = [];
    }

    async analyzeDatabase() {
        console.log('🔍 Analyzing database structure...\n');

        try {
            await this.getTableStructure();
            await this.getPolicies();
            await this.getIndexes();
            await this.analyzeConflicts();
            await this.generateRecommendations();
            await this.generateUpgradeScript();
        } catch (error) {
            console.error('❌ Error analyzing database:', error.message);
        }
    }

    async getTableStructure() {
        console.log('📊 Getting table structure...');
        
        const { data: tables, error } = await supabase
            .from('information_schema.tables')
            .select('table_name, table_type')
            .eq('table_schema', 'public');

        if (error) {
            console.error('Error getting tables:', error);
            return;
        }

        for (const table of tables) {
            const { data: columns, error: colError } = await supabase
                .from('information_schema.columns')
                .select('column_name, data_type, is_nullable, column_default, ordinal_position')
                .eq('table_schema', 'public')
                .eq('table_name', table.table_name)
                .order('ordinal_position');

            if (!colError) {
                this.existingTables.set(table.table_name, {
                    type: table.table_type,
                    columns: columns
                });
                this.existingColumns.set(table.table_name, columns);
            }
        }

        console.log(`✅ Found ${this.existingTables.size} tables`);
    }

    async getPolicies() {
        console.log('🔒 Getting RLS policies...');
        
        const { data: policies, error } = await supabase
            .from('pg_policies')
            .select('tablename, policyname, cmd, qual, with_check');

        if (error) {
            console.error('Error getting policies:', error);
            return;
        }

        for (const policy of policies) {
            if (!this.existingPolicies.has(policy.tablename)) {
                this.existingPolicies.set(policy.tablename, []);
            }
            this.existingPolicies.get(policy.tablename).push(policy);
        }

        console.log(`✅ Found policies for ${this.existingPolicies.size} tables`);
    }

    async getIndexes() {
        console.log('📇 Getting indexes...');
        
        const { data: indexes, error } = await supabase
            .from('pg_indexes')
            .select('tablename, indexname, indexdef')
            .eq('schemaname', 'public');

        if (error) {
            console.error('Error getting indexes:', error);
            return;
        }

        for (const index of indexes) {
            if (!this.existingIndexes.has(index.tablename)) {
                this.existingIndexes.set(index.tablename, []);
            }
            this.existingIndexes.get(index.tablename).push(index);
        }

        console.log(`✅ Found indexes for ${this.existingIndexes.size} tables`);
    }

    analyzeConflicts() {
        console.log('⚠️  Analyzing potential conflicts...\n');

        // Check for existing forum-related tables
        const forumTables = [
            'forum_posts', 'forum_comments', 'forum_user_profiles', 'forum_badges',
            'forum_vote_types', 'forum_post_votes_enhanced', 'forum_mentions',
            'forum_notifications', 'forum_bookmarks', 'forum_user_follows',
            'forum_categories_enhanced', 'forum_tags', 'forum_post_tags',
            'forum_moderation_actions', 'forum_reports_enhanced'
        ];

        for (const tableName of forumTables) {
            if (this.existingTables.has(tableName)) {
                this.conflicts.push({
                    type: 'existing_table',
                    table: tableName,
                    message: `Table ${tableName} already exists`
                });
            }
        }

        // Check for existing policies that might conflict
        const policyNames = [
            'Users can delete their own follows',
            'Users can view their own follows',
            'Users can create their own follows'
        ];

        for (const [tableName, policies] of this.existingPolicies) {
            for (const policy of policies) {
                if (policyNames.includes(policy.policyname)) {
                    this.conflicts.push({
                        type: 'existing_policy',
                        table: tableName,
                        policy: policy.policyname,
                        message: `Policy "${policy.policyname}" already exists on table ${tableName}`
                    });
                }
            }
        }

        if (this.conflicts.length > 0) {
            console.log('🚨 Found conflicts:');
            this.conflicts.forEach(conflict => {
                console.log(`   - ${conflict.message}`);
            });
        } else {
            console.log('✅ No conflicts found');
        }
    }

    generateRecommendations() {
        console.log('\n💡 Generating recommendations...\n');

        // Check what forum features already exist
        const existingForumTables = Array.from(this.existingTables.keys())
            .filter(name => name.includes('forum') || name.includes('post') || name.includes('comment'));

        if (existingForumTables.length > 0) {
            this.recommendations.push({
                type: 'info',
                message: `Found existing forum tables: ${existingForumTables.join(', ')}`
            });
        }

        // Check for user profile tables
        const profileTables = Array.from(this.existingTables.keys())
            .filter(name => name.includes('profile') || name.includes('user'));

        if (profileTables.length > 0) {
            this.recommendations.push({
                type: 'info',
                message: `Found existing profile tables: ${profileTables.join(', ')}`
            });
        }

        // Check for voting system
        const votingTables = Array.from(this.existingTables.keys())
            .filter(name => name.includes('vote'));

        if (votingTables.length > 0) {
            this.recommendations.push({
                type: 'info',
                message: `Found existing voting tables: ${votingTables.join(', ')}`
            });
        }

        // Check for notification system
        const notificationTables = Array.from(this.existingTables.keys())
            .filter(name => name.includes('notification'));

        if (notificationTables.length > 0) {
            this.recommendations.push({
                type: 'info',
                message: `Found existing notification tables: ${notificationTables.join(', ')}`
            });
        }

        console.log('📋 Recommendations:');
        this.recommendations.forEach(rec => {
            console.log(`   - ${rec.message}`);
        });
    }

    async generateUpgradeScript() {
        console.log('\n🔧 Generating upgrade script...\n');

        const upgradeScript = this.createUpgradeScript();
        
        // Write the script to a file
        const fs = require('fs');
        const path = require('path');
        
        const scriptPath = path.join(__dirname, '..', 'database', 'sql-scripts', 'forum-upgrades-safe.sql');
        fs.writeFileSync(scriptPath, upgradeScript);
        
        console.log(`✅ Generated safe upgrade script: ${scriptPath}`);
        console.log('\n📝 Summary of what the script will do:');
        console.log('   - Only add columns that don\'t exist');
        console.log('   - Only create tables that don\'t exist');
        console.log('   - Only create policies that don\'t exist');
        console.log('   - Preserve all existing data and structure');
    }

    createUpgradeScript() {
        let script = `-- Safe Forum Upgrades Script
-- Generated by Database Analyzer
-- This script only adds new features without conflicting with existing ones

-- =====================================================
-- 1. ENHANCE EXISTING TABLES (SAFE ADDITIONS)
-- =====================================================

`;

        // Add columns to existing forum_user_profiles if it exists
        if (this.existingTables.has('forum_user_profiles')) {
            script += `-- Enhance forum_user_profiles table
ALTER TABLE forum_user_profiles 
ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS helpful_votes_received INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS custom_title TEXT,
ADD COLUMN IF NOT EXISTS signature TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"show_email": false, "show_location": true, "show_sobriety_date": true}',
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email_notifications": true, "push_notifications": true, "mention_notifications": true}',
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

`;
        }

        // Add columns to existing forum_comments if it exists
        if (this.existingTables.has('forum_comments')) {
            script += `-- Enhance forum_comments table with threading
ALTER TABLE forum_comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS thread_path TEXT,
ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_solution BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS helpful_votes INTEGER DEFAULT 0;

`;
        }

        // Add columns to existing forum_posts if it exists
        if (this.existingTables.has('forum_posts')) {
            script += `-- Enhance forum_posts table with rich content
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

`;
        }

        // Add new tables only if they don't exist
        const newTables = [
            'forum_badges', 'forum_user_badges', 'forum_vote_types', 
            'forum_post_votes_enhanced', 'forum_mentions', 'forum_notifications',
            'forum_bookmarks', 'forum_user_follows', 'forum_categories_enhanced',
            'forum_tags', 'forum_post_tags', 'forum_moderation_actions', 'forum_reports_enhanced'
        ];

        for (const tableName of newTables) {
            if (!this.existingTables.has(tableName)) {
                script += this.generateTableCreationScript(tableName);
            }
        }

        // Add indexes
        script += `
-- =====================================================
-- 2. CREATE INDEXES (SAFE)
-- =====================================================

`;

        // Add policies only if they don't exist
        script += `
-- =====================================================
-- 3. CREATE POLICIES (SAFE)
-- =====================================================

`;

        // Add default data
        script += `
-- =====================================================
-- 4. INSERT DEFAULT DATA (SAFE)
-- =====================================================

`;

        return script;
    }

    generateTableCreationScript(tableName) {
        const tableScripts = {
            'forum_badges': `CREATE TABLE IF NOT EXISTS forum_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT DEFAULT '#007bff',
    category TEXT NOT NULL,
    requirements JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,
            'forum_user_badges': `CREATE TABLE IF NOT EXISTS forum_user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES forum_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_displayed BOOLEAN DEFAULT true,
    UNIQUE(user_id, badge_id)
);`,
            // Add more table definitions as needed
        };

        return tableScripts[tableName] || `-- Table ${tableName} definition needed\n`;
    }

    printSummary() {
        console.log('\n📊 Database Analysis Summary:');
        console.log(`   - Tables: ${this.existingTables.size}`);
        console.log(`   - Tables with policies: ${this.existingPolicies.size}`);
        console.log(`   - Tables with indexes: ${this.existingIndexes.size}`);
        console.log(`   - Conflicts found: ${this.conflicts.length}`);
        console.log(`   - Recommendations: ${this.recommendations.length}`);
    }
}

// Run the analysis
async function main() {
    const analyzer = new DatabaseAnalyzer();
    await analyzer.analyzeDatabase();
    analyzer.printSummary();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = DatabaseAnalyzer;
