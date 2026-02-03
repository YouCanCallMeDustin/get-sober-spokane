// Journal Page Logic

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Supabase
    while (typeof window.supabase === 'undefined') {
        await new Promise(r => setTimeout(r, 100));
    }

    const supabaseUrl = window.APP_CONFIG.SUPABASE_URL;
    const supabaseKey = window.APP_CONFIG.SUPABASE_ANON_KEY;
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    const badgeManager = new BadgeManager(supabase);

    let currentUser = null;

    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '/auth/login.html';
        return;
    }
    currentUser = session.user;

    // Load initial data
    loadJournalHistory();

    // Handle Form Submit
    document.getElementById('journalForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const mood = document.querySelector('input[name="mood"]:checked')?.value;
        const gratitude = document.getElementById('gratitude').value;
        const notes = document.getElementById('notes').value;

        if (!mood || !gratitude) {
            alert('Please select a mood and enter something you are grateful for.');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
        submitBtn.disabled = true;

        try {
            // Save to DB
            const { error } = await supabase
                .from('user_journal')
                .insert({
                    user_id: currentUser.id,
                    mood_rating: parseInt(mood),
                    gratitude_text: gratitude,
                    entry_text: notes
                });

            if (error) throw error;

            // Clear form
            e.target.reset();

            // Reload history
            await loadJournalHistory();

            // Check for badges (e.g., First Journal Entry) - logic can be added to BadgeManager later
            // For now, just simplistic check or placeholder

            alert('Journal entry saved!');

        } catch (error) {
            console.error('Error saving journal:', error);
            alert('Failed to save entry. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    document.getElementById('refreshEntries').addEventListener('click', loadJournalHistory);

    let moodChartInstance = null;

    async function loadJournalHistory() {
        const listContainer = document.getElementById('journalEntriesList');
        // Loading state handled in HTML initial render or keep previous content

        try {
            const { data: entries, error } = await supabase
                .from('user_journal')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            console.log('Journal entries:', entries);

            // Render List
            if (entries.length === 0) {
                listContainer.innerHTML = '<div class="text-center p-4 text-muted">No entries yet. Start your journey today!</div>';
            } else {
                listContainer.innerHTML = entries.map(entry => {
                    const date = new Date(entry.created_at);
                    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    const emojis = ['😫', '😢', '😰', '😐', '🙂', '😄', '🤩'];
                    const moodEmoji = emojis[entry.mood_rating - 1] || '😐';

                    return `
                        <div class="list-group-item p-3">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h6 class="mb-0 text-primary fw-bold">${formattedDate}</h6>
                                <span class="fs-4" title="Mood: ${entry.mood_rating}/7">${moodEmoji}</span>
                            </div>
                            <p class="mb-1 text-dark"><i class="bi bi-heart-fill text-danger me-2 small"></i>${entry.gratitude_text}</p>
                            ${entry.entry_text ? `<p class="mb-0 text-muted small bg-light p-2 rounded">${entry.entry_text}</p>` : ''}
                        </div>
                    `;
                }).join('');
            }

            // Render Chart
            renderChart(entries);

        } catch (err) {
            console.error('Failed to load history:', err);
            listContainer.innerHTML = '<div class="text-center p-4 text-danger">Failed to load entries.</div>';
        }
    }

    function renderChart(entries) {
        const ctx = document.getElementById('moodChart').getContext('2d');

        // Process data for chart (reverse strictly for time order: old -> new)
        const sortedEntries = [...entries].reverse(); // entries are desc, we want asc for chart x-axis

        // Limit to last 7 entries for cleaner chart if many
        const recentEntries = sortedEntries.slice(-7);

        const labels = recentEntries.map(e => new Date(e.created_at).toLocaleDateString(undefined, { weekday: 'short' }));
        const dataPoints = recentEntries.map(e => e.mood_rating);

        if (moodChartInstance) {
            moodChartInstance.destroy();
        }

        moodChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mood (1-7)',
                    data: dataPoints,
                    borderColor: '#f4623a', // Primary theme color
                    backgroundColor: 'rgba(244, 98, 58, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#f4623a',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 7,
                        ticks: {
                            stepSize: 1,
                            callback: function (value) {
                                const emojis = ['', '😫', '😢', '😰', '😐', '🙂', '😄', '🤩'];
                                return emojis[value] || value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

});
