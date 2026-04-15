/*!
* Start Bootstrap - Creative v7.0.8 (https://YOUR_USERNAME.github.io/sober-spokane)
* Copyright 2013-2026 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
* Built: 2026-04-15T05:21:23.259Z
*/
/**
 * Global Search Management System for Sober Spokane
 * Handles searching across Resources, Forum Posts, and Community Members
 */

class GlobalSearch {
    constructor() {
        this.supabase = window.supabase;
        this.resources = [];
        this.resourceDirectory = null;
        this.searchTimeout = null;
        this.currentResults = {
            resources: [],
            forum: [],
            members: []
        };
        this.init();
    }

    async init() {
        console.log('Initializing Global Search...');
        
        // Use the shared Supabase client if available
        if (typeof window.getSupabaseClient === 'function') {
            this.supabase = window.getSupabaseClient();
        }

        // Fallback or explicit initialization if needed
        if (!this.supabase && window.APP_CONFIG?.SUPABASE_URL) {
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
            this.supabase = createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY);
        }

        // Initialize resource data by leveraging ResourceDirectory if available
        if (typeof ResourceDirectory !== 'undefined') {
            this.resourceDirectory = new ResourceDirectory();
            this.resources = this.resourceDirectory.resources || [];
        }

        this.setupEventListeners();
        this.handleInitialQuery();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('globalSearchInput');
        const clearBtn = document.getElementById('clearSearchBtn');
        const filters = document.querySelectorAll('#searchCategoryFilters [data-filter]');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                clearBtn.style.display = query ? 'block' : 'none';
                
                // Debounce search
                clearTimeout(this.searchTimeout);
                if (query.length >= 2) {
                    this.searchTimeout = setTimeout(() => this.performSearch(query), 300);
                } else {
                    this.resetDisplay();
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchInput.focus();
                clearBtn.style.display = 'none';
                this.resetDisplay();
            });
        }

        filters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                filters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                this.applyCategoryFilter(filter.getAttribute('data-filter'));
            });
        });
    }

    handleInitialQuery() {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        if (query) {
            const searchInput = document.getElementById('globalSearchInput');
            searchInput.value = query;
            this.performSearch(query);
        }
    }

    async performSearch(query) {
        console.log('Searching for:', query);
        document.getElementById('searchStatus').innerHTML = `<div class="spinner-border spinner-border-sm text-primary me-2"></div>Searching for "${query}"...`;
        document.getElementById('noResultsPlaceholder').style.display = 'none';

        try {
            // 1. Search Static Resources
            this.currentResults.resources = this.searchResources(query);

            // 2. Search Database (Forum & Members)
            if (this.supabase) {
                // Perform database searches individually to handle partial failures
                try {
                    const [forumResults, memberResults] = await Promise.all([
                        this.searchForum(query).catch(err => {
                            console.warn('Forum search failed:', err);
                            return [];
                        }),
                        this.searchMembers(query).catch(err => {
                            console.warn('Member search failed:', err);
                            return [];
                        })
                    ]);
                    this.currentResults.forum = forumResults;
                    this.currentResults.members = memberResults;
                } catch (dbError) {
                    console.warn('Database search error:', dbError);
                }
            }

            this.renderResults(query);
        } catch (error) {
            console.error('Search failed:', error);
            document.getElementById('searchStatus').textContent = 'An error occurred while searching. Please try again.';
        }
    }

    searchResources(query) {
        const q = query.toLowerCase();
        return this.resources.filter(r => 
            r.name.toLowerCase().includes(q) || 
            r.description.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q) ||
            (r.services && r.services.some(s => s.toLowerCase().includes(q)))
        ).slice(0, 12); // Limit for performance
    }

    async searchForum(query) {
        if (!this.supabase) return [];
        const { data, error } = await this.supabase
            .from('forum_posts')
            .select('*')
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .limit(10);
        
        if (error) {
            console.error('Forum search error details:', error);
            throw error;
        }
        return data || [];
    }

    async searchMembers(query) {
        if (!this.supabase) return [];
        const { data, error } = await this.supabase
            .from('profiles_consolidated')
            .select('*')
            .ilike('display_name', `%${query}%`)
            .limit(8);
            
        if (error) {
            console.error('Member search error details:', error);
            throw error;
        }
        return data || [];
    }

    renderResults(query) {
        const { resources, forum, members } = this.currentResults;
        const total = resources.length + forum.length + members.length;

        // Update counts
        document.getElementById('count-all').textContent = total;
        document.getElementById('count-resources').textContent = resources.length;
        document.getElementById('count-forum').textContent = forum.length;
        document.getElementById('count-members').textContent = members.length;

        // Update Status
        document.getElementById('searchStatus').textContent = `Found ${total} results for "${query}"`;

        // Render sections
        this.renderResourcesSection(resources, query);
        this.renderForumSection(forum, query);
        this.renderMembersSection(members, query);

        if (total === 0) {
            document.getElementById('noResultsPlaceholder').style.display = 'block';
            document.getElementById('noResultsPlaceholder').innerHTML = `
                <i class="bi.bi-search.fs-1.d-block.mb-3.opacity-25"></i>
                p No results found for "<strong>${query}</strong>". Try different keywords.
            `;
        }
    }

    renderResourcesSection(results, query) {
        const section = document.getElementById('resourcesResultsSection');
        const grid = document.getElementById('resourcesResultsGrid');
        
        if (results.length > 0) {
            section.style.display = 'block';
            grid.innerHTML = results.map(r => `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 border-0 shadow-sm result-card" onclick="window.location.href='/resource-directory.html?id=${r.id}'">
                        <div class="card-body">
                            <span class="badge bg-light text-primary mb-2">${r.category}</span>
                            <h6 class="card-title">${this.highlightMatch(r.name, query)}</h6>
                            <p class="card-text small text-muted">${this.highlightMatch(r.description.substring(0, 100), query)}...</p>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            section.style.display = 'none';
        }
    }

    renderForumSection(results, query) {
        const section = document.getElementById('forumResultsSection');
        const list = document.getElementById('forumResultsList');
        
        if (results.length > 0) {
            section.style.display = 'block';
            list.innerHTML = results.map(p => `
                <a href="/community-forum.html?post=${p.id}" class="list-group-item list-group-item-action border-0 mb-2 rounded shadow-sm p-3">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${this.highlightMatch(p.title, query)}</h6>
                        <small class="text-muted"><i class="bi bi-clock me-1"></i>${new Date(p.created_at).toLocaleDateString()}</small>
                    </div>
                    <p class="mb-1 small text-muted">${this.highlightMatch(p.content.substring(0, 150), query)}...</p>
                </a>
            `).join('');
        } else {
            section.style.display = 'none';
        }
    }

    renderMembersSection(results, query) {
        const section = document.getElementById('membersResultsSection');
        const grid = document.getElementById('membersResultsGrid');
        
        if (results.length > 0) {
            section.style.display = 'block';
            grid.innerHTML = results.map(m => `
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="card h-100 border-0 shadow-sm text-center p-3 result-card" onclick="window.location.href='/user-profile.html?id=${m.user_id}'">
                        <div class="mb-2">
                            <img src="${m.avatar_url || '/assets/img/logo.png'}" alt="${m.display_name}" class="rounded-circle" style="width: 60px; height: 60px; object-fit: cover; border: 2px solid #eee;">
                        </div>
                        <h6 class="mb-0 small">${this.highlightMatch(m.display_name, query)}</h6>
                    </div>
                </div>
            `).join('');
        } else {
            section.style.display = 'none';
        }
    }

    highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    applyCategoryFilter(category) {
        const sections = {
            resources: document.getElementById('resourcesResultsSection'),
            forum: document.getElementById('forumResultsSection'),
            members: document.getElementById('membersResultsSection')
        };

        Object.keys(sections).forEach(key => {
            if (category === 'all' || category === key) {
                if (this.currentResults[key].length > 0) {
                    sections[key].style.display = 'block';
                }
            } else {
                sections[key].style.display = 'none';
            }
        });
    }

    resetDisplay() {
        document.getElementById('searchStatus').textContent = 'Type at least 2 characters to begin searching';
        document.getElementById('noResultsPlaceholder').style.display = 'block';
        document.getElementById('resourcesResultsSection').style.display = 'none';
        document.getElementById('forumResultsSection').style.display = 'none';
        document.getElementById('membersResultsSection').style.display = 'none';
        
        // Reset counts
        ['all', 'resources', 'forum', 'members'].forEach(key => {
            document.getElementById(`count-${key}`).textContent = '0';
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.globalSearch = new GlobalSearch();
});
