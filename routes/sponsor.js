const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables for sponsor routes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware to check authentication - for client-side requests
const requireAuth = async (req, res, next) => {
  try {
    // For client-side requests, we'll rely on the frontend to pass the user ID
    // The RLS policies will handle the actual authorization
    const userId = req.body.user_id || req.query.user_id || req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    req.user = { id: userId };
    next();
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Authentication check failed' });
  }
};

// =====================================================
// SPONSOR PROFILES ROUTES
// =====================================================

// Get all available sponsors
router.get('/sponsors', async (req, res) => {
  try {
    const { data: sponsors, error } = await supabase
      .from('sponsor_profiles')
      .select(`
        *,
        profiles_consolidated!inner(
          display_name,
          bio,
          avatar_url,
          location,
          sobriety_date
        )
      `)
      .eq('is_available_sponsor', true)
      .eq('is_verified_sponsor', true);

    if (error) throw error;

    res.json({ sponsors: sponsors || [] });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

// Get sponsor profile by user ID
router.get('/sponsors/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: sponsor, error } = await supabase
      .from('sponsor_profiles')
      .select(`
        *,
        profiles_consolidated!inner(
          display_name,
          bio,
          avatar_url,
          location,
          sobriety_date
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Sponsor not found' });
      }
      throw error;
    }

    res.json({ sponsor });
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    res.status(500).json({ error: 'Failed to fetch sponsor' });
  }
});

// Create or update sponsor profile
router.post('/sponsors/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sponsorData = {
      user_id: userId,
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('sponsor_profiles')
      .upsert(sponsorData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    res.json({ sponsor: data });
  } catch (error) {
    console.error('Error creating/updating sponsor profile:', error);
    res.status(500).json({ error: 'Failed to save sponsor profile' });
  }
});

// =====================================================
// SPONSOR RELATIONSHIPS ROUTES
// =====================================================

// Get user's sponsor relationships
router.get('/relationships', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: relationships, error } = await supabase
      .from('sponsor_relationships')
      .select(`
        *,
        sponsor:sponsor_id(
          profiles_consolidated(
            display_name,
            avatar_url
          )
        ),
        sponsee:sponsee_id(
          profiles_consolidated(
            display_name,
            avatar_url
          )
        )
      `)
      .or(`sponsor_id.eq.${userId},sponsee_id.eq.${userId}`);

    if (error) throw error;

    res.json({ relationships: relationships || [] });
  } catch (error) {
    console.error('Error fetching relationships:', error);
    res.status(500).json({ error: 'Failed to fetch relationships' });
  }
});

// Create sponsor relationship
router.post('/relationships', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sponsorId, sponseeId, relationshipType = 'sponsor' } = req.body;

    // Validate that user is either the sponsor or sponsee
    if (userId !== sponsorId && userId !== sponseeId) {
      return res.status(403).json({ error: 'Unauthorized to create this relationship' });
    }

    // Check if sponsee already has an active sponsor
    if (userId === sponseeId) {
      const { data: existingRelationship } = await supabase
        .from('sponsor_relationships')
        .select('*')
        .eq('sponsee_id', sponseeId)
        .eq('relationship_status', 'active')
        .single();

      if (existingRelationship) {
        return res.status(400).json({ error: 'Sponsee already has an active sponsor' });
      }
    }

    const relationshipData = {
      sponsor_id: sponsorId,
      sponsee_id: sponseeId,
      relationship_type: relationshipType,
      relationship_status: 'active',
      started_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('sponsor_relationships')
      .insert(relationshipData)
      .select()
      .single();

    if (error) throw error;

    res.json({ relationship: data });
  } catch (error) {
    console.error('Error creating relationship:', error);
    res.status(500).json({ error: 'Failed to create relationship' });
  }
});

// Update sponsor relationship
router.put('/relationships/:relationshipId', requireAuth, async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const userId = req.user.id;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    // First check if user is part of this relationship
    const { data: relationship, error: fetchError } = await supabase
      .from('sponsor_relationships')
      .select('*')
      .eq('id', relationshipId)
      .single();

    if (fetchError) throw fetchError;

    if (relationship.sponsor_id !== userId && relationship.sponsee_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this relationship' });
    }

    const { data, error } = await supabase
      .from('sponsor_relationships')
      .update(updateData)
      .eq('id', relationshipId)
      .select()
      .single();

    if (error) throw error;

    res.json({ relationship: data });
  } catch (error) {
    console.error('Error updating relationship:', error);
    res.status(500).json({ error: 'Failed to update relationship' });
  }
});

// =====================================================
// SPONSOR REQUESTS ROUTES
// =====================================================

// Get sponsor requests
router.get('/requests', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, status } = req.query;

    let query = supabase
      .from('sponsor_requests')
      .select(`
        *,
        requester:requester_id(
          profiles_consolidated(
            display_name,
            avatar_url
          )
        ),
        requested_sponsor:requested_sponsor_id(
          profiles_consolidated(
            display_name,
            avatar_url
          )
        )
      `)
      .or(`requester_id.eq.${userId},requested_sponsor_id.eq.${userId}`);

    if (type) {
      query = query.eq('request_type', type);
    }

    if (status) {
      query = query.eq('request_status', status);
    }

    const { data: requests, error } = await query;

    if (error) throw error;

    res.json({ requests: requests || [] });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Create sponsor request
router.post('/requests', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const requestData = {
      requester_id: userId,
      ...req.body,
      request_status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('sponsor_requests')
      .insert(requestData)
      .select()
      .single();

    if (error) throw error;

    res.json({ request: data });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Update sponsor request
router.put('/requests/:requestId', requireAuth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    // First check if user is authorized to update this request
    const { data: request, error: fetchError } = await supabase
      .from('sponsor_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    if (request.requester_id !== userId && request.requested_sponsor_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this request' });
    }

    const { data, error } = await supabase
      .from('sponsor_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    res.json({ request: data });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// =====================================================
// SPONSOR REVIEWS ROUTES
// =====================================================

// Get sponsor reviews
router.get('/reviews/:sponsorId', async (req, res) => {
  try {
    const { sponsorId } = req.params;

    const { data: reviews, error } = await supabase
      .from('sponsor_reviews')
      .select(`
        *,
        reviewer:reviewer_id(
          profiles_consolidated(
            display_name,
            avatar_url
          )
        )
      `)
      .eq('sponsor_id', sponsorId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ reviews: reviews || [] });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create sponsor review
router.post('/reviews', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewData = {
      reviewer_id: userId,
      ...req.body,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('sponsor_reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) throw error;

    res.json({ review: data });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// =====================================================
// SPONSOR MATCHING ROUTES
// =====================================================

// Find matching sponsors based on criteria
router.post('/match', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { criteria } = req.body;

    let query = supabase
      .from('sponsor_profiles')
      .select(`
        *,
        profiles_consolidated!inner(
          display_name,
          bio,
          avatar_url,
          location,
          sobriety_date
        )
      `)
      .eq('is_available_sponsor', true)
      .eq('is_verified_sponsor', true);

    // Apply filters based on criteria
    if (criteria.recoveryProgram) {
      query = query.eq('recovery_program', criteria.recoveryProgram);
    }

    if (criteria.minYearsSober) {
      query = query.gte('years_sober', criteria.minYearsSober);
    }

    if (criteria.meetingPreference) {
      query = query.contains('meeting_preferences', [criteria.meetingPreference]);
    }

    if (criteria.specialization) {
      query = query.contains('specializations', [criteria.specialization]);
    }

    if (criteria.maxDistance) {
      // This would require location-based filtering
      // For now, we'll just return all matching sponsors
    }

    const { data: sponsors, error } = await query;

    if (error) throw error;

    // Calculate match scores based on criteria
    const scoredSponsors = (sponsors || []).map(sponsor => {
      let score = 0;
      
      if (criteria.recoveryProgram && sponsor.recovery_program === criteria.recoveryProgram) {
        score += 30;
      }
      
      if (criteria.minYearsSober && sponsor.years_sober >= criteria.minYearsSober) {
        score += 25;
      }
      
      if (criteria.meetingPreference && sponsor.meeting_preferences?.includes(criteria.meetingPreference)) {
        score += 20;
      }
      
      if (criteria.specialization && sponsor.specializations?.includes(criteria.specialization)) {
        score += 25;
      }

      return { ...sponsor, matchScore: score };
    });

    // Sort by match score
    scoredSponsors.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ sponsors: scoredSponsors });
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ error: 'Failed to find matching sponsors' });
  }
});

// =====================================================
// STATISTICS ROUTES
// =====================================================

// Get sponsor statistics
router.get('/stats', async (req, res) => {
  try {
    const { data: sponsorCount } = await supabase
      .from('sponsor_profiles')
      .select('id', { count: 'exact' })
      .eq('is_available_sponsor', true);

    const { data: relationshipCount } = await supabase
      .from('sponsor_relationships')
      .select('id', { count: 'exact' })
      .eq('relationship_status', 'active');

    const { data: requestCount } = await supabase
      .from('sponsor_requests')
      .select('id', { count: 'exact' })
      .eq('request_status', 'pending');

    res.json({
      availableSponsors: sponsorCount?.length || 0,
      activeRelationships: relationshipCount?.length || 0,
      pendingRequests: requestCount?.length || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
