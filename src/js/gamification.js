// Gamification Logic - Badge System
class BadgeManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.badges = [
            {
                id: 'sober_24h',
                name: 'First Step',
                description: 'Completed 24 hours of sobriety',
                icon: 'bi-sunrise',
                category: 'milestone',
                thresholdDays: 1
            },
            {
                id: 'sober_7d',
                name: 'One Week Strong',
                description: 'One full week of sobriety',
                icon: 'bi-calendar-check',
                category: 'milestone',
                thresholdDays: 7
            },
            {
                id: 'sober_30d',
                name: 'Thirty Day Star',
                description: 'Reached the 1 month milestone',
                icon: 'bi-star-fill',
                category: 'milestone',
                thresholdDays: 30
            },
            {
                id: 'sober_90d',
                name: '90 Day Warrior',
                description: 'Three months of dedication',
                icon: 'bi-shield-check',
                category: 'milestone',
                thresholdDays: 90
            },
            {
                id: 'sober_1y',
                name: 'Solar Return',
                description: 'One full year of sobriety',
                icon: 'bi-trophy-fill',
                category: 'milestone',
                thresholdDays: 365
            }
        ];
    }

    // Calculate days difference between dates
    getDaysSober(sobrietyDate) {
        if (!sobrietyDate) return 0;
        const start = new Date(sobrietyDate);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Check and award badges based on user profile
    async checkAndAwardBadges(userId, sobrietyDate) {
        if (!userId || !sobrietyDate) return;

        const days = this.getDaysSober(sobrietyDate);
        const earnedBadges = [];

        // Check which badges should be awarded
        this.badges.forEach(badge => {
            if (days >= badge.thresholdDays) {
                earnedBadges.push(badge.id);
            }
        });

        if (earnedBadges.length === 0) return;

        // Get existing badges
        const { data: existing, error } = await this.supabase
            .from('user_badges')
            .select('badge_id')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching badges:', error);
            return;
        }

        const existingIds = new Set(existing.map(b => b.badge_id));

        // Award new badges
        for (const badgeId of earnedBadges) {
            if (!existingIds.has(badgeId)) {
                await this.awardBadge(userId, badgeId);
            }
        }
    }

    async awardBadge(userId, badgeId) {
        console.log(`Awarding badge ${badgeId} to user ${userId}`);
        const { error } = await this.supabase
            .from('user_badges')
            .insert({
                user_id: userId,
                badge_id: badgeId,
                metadata: { awarded_on: new Date().toISOString() }
            });

        if (error) console.error('Failed to award badge:', error);
    }

    async getUserBadges(userId) {
        const { data, error } = await this.supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', userId);

        if (error || !data) return [];

        // Merge with definitions
        return data.map(userBadge => {
            const def = this.badges.find(b => b.id === userBadge.badge_id);
            return {
                ...userBadge,
                ...def // specific def overrides (name, icon, etc)
            };
        }).filter(b => b.name); // only return known badges
    }
}

// Export for usage
window.BadgeManager = BadgeManager;
