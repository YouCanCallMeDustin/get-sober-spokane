// Sponsor Finder JavaScript
class SponsorFinder {
  constructor() {
    this.supabase = null;
    this.currentUser = null;
    this.availableSponsors = [];
    this.currentFilters = {};
    this.sponsorRequests = [];
  }

  async init() {
    try {
      await this.initializeSupabase();
      await this.loadAvailableSponsors();
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize sponsor finder:', error);
      this.showMessage('Failed to load sponsor finder. Please refresh the page.', 'danger');
    }
  }

  async initializeSupabase() {
    try {
      // Get Supabase credentials from config
      const supabaseUrl = window.APP_CONFIG?.SUPABASE_URL || '';
      const supabaseKey = window.APP_CONFIG?.SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase credentials not found');
        throw new Error('Supabase credentials not available');
      }
      
      // Create Supabase client
      this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
      console.log('Supabase client initialized for sponsor finder');
      
      // Check authentication state
      const { data: { session } } = await this.supabase.auth.getSession();
      if (session) {
        this.currentUser = session.user;
        console.log('User authenticated:', this.currentUser.id);
      } else {
        console.log('No active session found');
        // Show a message to the user that they need to sign in
        this.showMessage('Please sign in to use the sponsor finder feature.', 'info');
      }
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      throw error;
    }
  }

  async loadAvailableSponsors() {
    try {
      if (!this.supabase) {
        throw new Error('Supabase not initialized');
      }

      console.log('Loading available sponsors...');

      // Query sponsor profiles first
      const { data: sponsors, error: sponsorsError } = await this.supabase
        .from('sponsor_profiles')
        .select('*')
        .eq('is_available_sponsor', true)
        .eq('is_verified_sponsor', true);

      if (sponsorsError) {
        console.error('Error loading sponsors:', sponsorsError);
        throw sponsorsError;
      }

      if (!sponsors || sponsors.length === 0) {
        this.availableSponsors = [];
        this.displaySponsors();
        return;
      }

      // Get user IDs from sponsors
      const userIds = sponsors.map(s => s.user_id);

      // Load profiles for these users
      const { data: profiles, error: profilesError } = await this.supabase
        .from('profiles_consolidated')
        .select('*')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        // Continue without profiles - we'll use default values
      }

      // Combine sponsor data with profile data
      this.availableSponsors = sponsors.map(sponsor => {
        const profile = profiles?.find(p => p.user_id === sponsor.user_id);
        return {
          ...sponsor,
          profiles_consolidated: profile || {
            display_name: 'Anonymous Sponsor',
            bio: 'Committed to helping others in recovery',
            avatar_url: null,
            location: 'Spokane, WA',
            sobriety_date: null
          }
        };
      });

      console.log('Loaded sponsors:', this.availableSponsors.length);

      // Load sponsor reviews for each sponsor
      await this.loadSponsorReviews();

      this.displaySponsors();
    } catch (error) {
      console.error('Failed to load sponsors:', error);
      this.showMessage('Failed to load available sponsors. Please try again.', 'danger');
    }
  }

  async loadSponsorReviews() {
    try {
      if (this.availableSponsors.length === 0) return;

      const sponsorIds = this.availableSponsors.map(s => s.user_id);
      
      const { data: reviews, error } = await this.supabase
        .from('sponsor_reviews')
        .select('*')
        .in('sponsor_id', sponsorIds)
        .eq('is_public', true);

      if (error) {
        console.error('Error loading reviews:', error);
        return;
      }

      // Group reviews by sponsor
      const reviewsBySponsor = {};
      reviews.forEach(review => {
        if (!reviewsBySponsor[review.sponsor_id]) {
          reviewsBySponsor[review.sponsor_id] = [];
        }
        reviewsBySponsor[review.sponsor_id].push(review);
      });

      // Calculate average ratings for each sponsor
      this.availableSponsors.forEach(sponsor => {
        const sponsorReviews = reviewsBySponsor[sponsor.user_id] || [];
        sponsor.averageRating = this.calculateAverageRating(sponsorReviews);
        sponsor.reviewCount = sponsorReviews.length;
        sponsor.reviews = sponsorReviews;
      });
    } catch (error) {
      console.error('Failed to load sponsor reviews:', error);
    }
  }

  calculateAverageRating(reviews) {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return Math.round((totalRating / reviews.length) * 10) / 10;
  }

  displaySponsors() {
    const sponsorsList = document.getElementById('sponsorsList');
    const noSponsorsMessage = document.getElementById('noSponsorsMessage');

    if (!sponsorsList) return;

    // Filter sponsors based on current filters
    const filteredSponsors = this.filterSponsors();

    if (filteredSponsors.length === 0) {
      sponsorsList.innerHTML = `
        <div class="col-12">
          <div class="no-sponsors">
            <i class="bi bi-people"></i>
            <h4>No sponsors match your criteria</h4>
            <p>Try adjusting your filters or submit a request to be matched with a sponsor.</p>
          </div>
        </div>
      `;
      return;
    }

    sponsorsList.innerHTML = filteredSponsors.map(sponsor => this.createSponsorCard(sponsor)).join('');
  }

  filterSponsors() {
    let filtered = [...this.availableSponsors];

    // Apply filters
    if (this.currentFilters.recoveryProgram) {
      filtered = filtered.filter(s => s.recovery_program === this.currentFilters.recoveryProgram);
    }

    if (this.currentFilters.yearsSober) {
      const years = parseInt(s.sponsor_profiles?.years_sober || 0);
      switch (this.currentFilters.yearsSober) {
        case '1-2':
          filtered = filtered.filter(s => years >= 1 && years <= 2);
          break;
        case '3-5':
          filtered = filtered.filter(s => years >= 3 && years <= 5);
          break;
        case '5+':
          filtered = filtered.filter(s => years >= 5);
          break;
      }
    }

    if (this.currentFilters.meetingPreference) {
      filtered = filtered.filter(s => 
        s.meeting_preferences && 
        s.meeting_preferences.includes(this.currentFilters.meetingPreference)
      );
    }

    if (this.currentFilters.specialization) {
      filtered = filtered.filter(s => 
        s.specializations && 
        s.specializations.includes(this.currentFilters.specialization)
      );
    }

    return filtered;
  }

  createSponsorCard(sponsor) {
    const profile = sponsor.profiles_consolidated;
    const yearsSober = sponsor.years_sober || 0;
    const maxSponsees = sponsor.max_sponsees || 3;
    const currentSponsees = 0; // This would need to be calculated from relationships

    const specializations = sponsor.specializations || [];
    const meetingPrefs = sponsor.meeting_preferences || [];

    return `
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="card sponsor-card h-100">
          <div class="card-body text-center">
            <div class="sponsor-avatar">
              ${profile.avatar_url ? 
                `<img src="${profile.avatar_url}" alt="${profile.display_name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` :
                `<i class="bi bi-person-circle"></i>`
              }
            </div>
            
            <div class="sponsor-badge">
              <i class="bi bi-star-fill me-2"></i>
              Verified Sponsor
            </div>
            
            <h5 class="card-title">${profile.display_name || 'Anonymous'}</h5>
            <p class="text-muted">${profile.location || 'Spokane, WA'}</p>
            
            <div class="sponsor-stats">
              <div class="stat-item">
                <div class="stat-number">${yearsSober}</div>
                <div class="stat-label">Years Sober</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${sponsor.averageRating || 'N/A'}</div>
                <div class="stat-label">Rating</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${currentSponsees}/${maxSponsees}</div>
                <div class="stat-label">Sponsees</div>
              </div>
            </div>
            
            <div class="mb-3">
              <strong>Recovery Program:</strong> ${sponsor.recovery_program || 'Not specified'}
            </div>
            
            ${sponsor.sponsor_bio ? `
              <p class="card-text">${this.truncateText(sponsor.sponsor_bio, 100)}</p>
            ` : ''}
            
            ${specializations.length > 0 ? `
              <div class="sponsor-specializations">
                ${specializations.map(spec => `<span class="specialization-tag">${this.formatSpecialization(spec)}</span>`).join('')}
              </div>
            ` : ''}
            
            ${meetingPrefs.length > 0 ? `
              <div class="mt-2">
                <small class="text-muted">
                  <i class="bi bi-geo-alt me-1"></i>
                  ${meetingPrefs.map(pref => this.formatMeetingPreference(pref)).join(', ')}
                </small>
              </div>
            ` : ''}
            
            <div class="mt-3">
              <button class="btn btn-sponsor-primary btn-sm me-2" onclick="sponsorFinder.requestSponsor('${sponsor.user_id}')">
                <i class="bi bi-person-plus me-1"></i>
                Request Sponsor
              </button>
              <button class="btn btn-outline-primary btn-sm" onclick="sponsorFinder.viewSponsorProfile('${sponsor.user_id}')">
                <i class="bi bi-eye me-1"></i>
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  formatSpecialization(spec) {
    const specializations = {
      'early_recovery': 'Early Recovery',
      'relapse_prevention': 'Relapse Prevention',
      'family_support': 'Family Support',
      'step_work': 'Step Work',
      'crisis_support': 'Crisis Support',
      'life_skills': 'Life Skills'
    };
    return specializations[spec] || spec;
  }

  formatMeetingPreference(pref) {
    const preferences = {
      'in_person': 'In Person',
      'online': 'Online',
      'phone': 'Phone'
    };
    return preferences[pref] || pref;
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  applyFilters() {
    this.currentFilters = {
      recoveryProgram: document.getElementById('recoveryProgramFilter').value,
      yearsSober: document.getElementById('yearsSoberFilter').value,
      meetingPreference: document.getElementById('meetingPreferenceFilter').value,
      specialization: document.getElementById('specializationFilter').value
    };

    this.displaySponsors();
    this.showMessage('Filters applied successfully!', 'success');
  }

  clearFilters() {
    this.currentFilters = {};
    document.getElementById('recoveryProgramFilter').value = '';
    document.getElementById('yearsSoberFilter').value = '';
    document.getElementById('meetingPreferenceFilter').value = '';
    document.getElementById('specializationFilter').value = '';
    
    this.displaySponsors();
    this.showMessage('Filters cleared!', 'info');
  }

  async requestSponsor(sponsorId) {
    if (!this.currentUser) {
      this.showMessage('Please sign in to request a sponsor.', 'warning');
      return;
    }

    try {
      const sponsor = this.availableSponsors.find(s => s.user_id === sponsorId);
      if (!sponsor) {
        this.showMessage('Sponsor not found.', 'error');
        return;
      }

      // Check if user already has an active sponsor
      const { data: existingRelationship } = await this.supabase
        .from('sponsor_relationships')
        .select('*')
        .eq('sponsee_id', this.currentUser.id)
        .eq('relationship_status', 'active')
        .single();

      if (existingRelationship) {
        this.showMessage('You already have an active sponsor relationship.', 'warning');
        return;
      }

      // Create sponsor request
      const { error } = await this.supabase
        .from('sponsor_requests')
        .insert({
          requester_id: this.currentUser.id,
          requested_sponsor_id: sponsorId,
          request_type: 'request_specific_sponsor',
          request_status: 'pending'
        });

      if (error) throw error;

      this.showMessage('Sponsor request sent successfully! The sponsor will be notified.', 'success');
    } catch (error) {
      console.error('Failed to request sponsor:', error);
      this.showMessage('Failed to send sponsor request. Please try again.', 'danger');
    }
  }

  async submitSponsorRequest() {
    if (!this.currentUser) {
      this.showMessage('Please sign in to submit a request.', 'warning');
      return;
    }

    // Double-check authentication with Supabase
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) {
      this.showMessage('Your session has expired. Please refresh the page and sign in again.', 'warning');
      return;
    }

    try {
      const formData = new FormData(document.getElementById('requestSponsorForm'));
      const requestData = {
        requester_id: this.currentUser.id,
        request_type: formData.get('requestType'),
        sobriety_date: formData.get('sobrietyDate'),
        recovery_program: formData.get('recoveryProgram'),
        sponsor_experience: formData.get('sponsorExperience'),
        support_offer: formData.get('supportOffer'),
        availability_notes: formData.get('availabilityNotes'),
        preferred_contact_method: formData.get('contactMethod'),
        request_status: 'pending'
      };

      console.log('Submitting sponsor request:', requestData);
      console.log('Current user:', this.currentUser);
      console.log('User authenticated:', !!this.currentUser);
      console.log('Supabase client initialized:', !!this.supabase);

      const { data, error } = await this.supabase
        .from('sponsor_requests')
        .insert(requestData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        
        // Provide more specific error messages
        if (error.code === '42501') {
          this.showMessage('Authentication error. Please refresh the page and sign in again.', 'danger');
        } else if (error.code === '23505') {
          this.showMessage('You already have a pending request. Please wait for a response.', 'warning');
        } else {
          this.showMessage(`Failed to submit request: ${error.message}`, 'danger');
        }
        return;
      }

      console.log('Sponsor request submitted successfully:', data);
      this.showMessage('Your request has been submitted successfully! We will match you with a suitable sponsor.', 'success');
      document.getElementById('requestSponsorForm').reset();
      document.getElementById('sponsorRequestForm').style.display = 'none';
    } catch (error) {
      console.error('Failed to submit sponsor request:', error);
      this.showMessage('Failed to submit request. Please try again.', 'danger');
    }
  }

  viewSponsorProfile(sponsorId) {
    // Navigate to the user profile page
    window.location.href = `/user/${sponsorId}`;
  }

  setupEventListeners() {
    // Additional event listeners can be added here
    console.log('Sponsor finder event listeners set up');
  }

  showMessage(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
      container.insertBefore(alertDiv, container.firstChild);
      
      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.remove();
        }
      }, 5000);
    }
  }
}

// Make SponsorFinder available globally
window.SponsorFinder = SponsorFinder;
