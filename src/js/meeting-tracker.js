// Meeting Tracker Logic

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Supabase
    while (typeof window.supabase === 'undefined') {
        await new Promise(r => setTimeout(r, 100));
    }

    const supabaseUrl = window.APP_CONFIG.SUPABASE_URL;
    const supabaseKey = window.APP_CONFIG.SUPABASE_ANON_KEY;
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    // const badgeManager = new BadgeManager(supabase);

    let currentUser = null;

    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '/auth/login.html';
        return;
    }
    currentUser = session.user;

    // Load initial data
    loadMeetingHistory();

    // Handle Form Submit
    document.getElementById('meetingForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const type = document.getElementById('meetingType').value;
        const name = document.getElementById('meetingName').value;
        const notes = document.getElementById('meetingNotes').value;

        if (!type || !name) {
            alert('Please fill in required fields.');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
        submitBtn.disabled = true;

        try {
            // Save to DB
            const { error } = await supabase
                .from('user_meetings')
                .insert({
                    user_id: currentUser.id,
                    meeting_type: type,
                    meeting_name: name,
                    notes: notes
                });

            if (error) throw error;

            // Clear form
            e.target.reset();

            // Reload history
            await loadMeetingHistory();

            alert('Meeting logged successfully!');

        } catch (error) {
            console.error('Error saving meeting:', error);
            alert('Failed to save meeting. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    document.getElementById('refreshMeetings').addEventListener('click', loadMeetingHistory);

    async function loadMeetingHistory() {
        const listContainer = document.getElementById('meetingList');

        try {
            const { data: meetings, error } = await supabase
                .from('user_meetings')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('attended_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            // Render List
            if (meetings.length === 0) {
                listContainer.innerHTML = '<div class="text-center p-4 text-muted">No meetings logged yet.</div>';
            } else {
                listContainer.innerHTML = meetings.map(meeting => {
                    const date = new Date(meeting.attended_at);
                    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    let badgeColor = 'bg-secondary';
                    if (meeting.meeting_type === 'AA') badgeColor = 'bg-primary';
                    if (meeting.meeting_type === 'NA') badgeColor = 'bg-danger';
                    if (meeting.meeting_type === 'Smart') badgeColor = 'bg-info';
                    if (meeting.meeting_type === 'Celebrate') badgeColor = 'bg-warning text-dark';

                    return `
                        <div class="list-group-item p-3">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="badge ${badgeColor}">${meeting.meeting_type}</span>
                                <small class="text-muted">${formattedDate}</small>
                            </div>
                            <h6 class="mb-1 fw-bold">${meeting.meeting_name}</h6>
                            ${meeting.notes ? `<p class="mb-0 text-muted small fst-italic">"${meeting.notes}"</p>` : ''}
                        </div>
                    `;
                }).join('');
            }

        } catch (err) {
            console.error('Failed to load history:', err);
            listContainer.innerHTML = '<div class="text-center p-4 text-danger">Failed to load meetings.</div>';
        }
    }
});
