// Resource Directory Management System
class ResourceDirectory {
    constructor() {
        this.resources = [];
        this.filteredResources = [];
        this.currentFilters = {
            category: 'all',
            location: 'all',
            availability: 'all',
            search: ''
        };
        this.init();
    }

    init() {
        console.log('Initializing ResourceDirectory');
        this.loadResources();
        console.log('Loaded', this.resources.length, 'resources');
        this.setupEventListeners();
        this.renderResources();
        console.log('ResourceDirectory initialization complete');
    }

    loadResources() {
        // Comprehensive resource database
        this.resources = [
            // Shelters
            {
                id: 'shelter-1',
                name: 'Crosswalk Youth Shelter',
                category: 'shelter',
                subcategory: 'youth',
                address: '525 W 2nd Ave, Spokane, WA 99201',
                phone: '(509) 455-0730',
                hours: '24/7',
                availability: 'available',
                description: 'Emergency shelter for youth ages 13-17',
                services: ['emergency shelter', 'case management', 'counseling'],
                coordinates: { lat: 47.65813, lng: -117.41798 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['youth 13-17', 'photo ID'],
                website: 'https://crosswalkyouth.org',
                rating: 4.5,
                reviews: 12
            },
            {
                id: 'shelter-2',
                name: 'House of Charity Shelter',
                category: 'shelter',
                subcategory: 'adult',
                address: '32 W Pacific, Spokane, WA 99201',
                phone: '(509) 456-7111',
                hours: '7:00 PM - 7:00 AM',
                availability: 'available',
                description: 'Emergency shelter for adults',
                services: ['emergency shelter', 'meals', 'showers'],
                coordinates: { lat: 47.6537, lng: -117.4112 },
                accessibility: ['wheelchair accessible'],
                requirements: ['adult', 'sobriety required'],
                website: '',
                rating: 4.2,
                reviews: 8
            },
            {
                id: 'shelter-3',
                name: "Hope House Women's Shelter",
                category: 'shelter',
                subcategory: 'women',
                address: '318 S Adams, Spokane, WA 99201',
                phone: '(509) 455-2886',
                hours: '24/7',
                availability: 'limited',
                description: 'Emergency shelter for women and children',
                services: ['emergency shelter', 'case management', 'childcare'],
                coordinates: { lat: 47.6542, lng: -117.4267 },
                accessibility: ['wheelchair accessible'],
                requirements: ['women and children only'],
                website: '',
                rating: 4.7,
                reviews: 15
            },

            // Food Banks
            {
                id: 'food-1',
                name: 'Second Harvest Inland Northwest',
                category: 'food',
                subcategory: 'food bank',
                address: '1234 E Front Ave, Spokane, WA 99202',
                phone: '(509) 534-6678',
                hours: 'Mon-Fri 8:00 AM - 4:00 PM',
                availability: 'available',
                description: 'Large food bank serving the Inland Northwest',
                services: ['food distribution', 'nutrition education', 'SNAP assistance'],
                coordinates: { lat: 47.6607, lng: -117.3932 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['proof of income', 'photo ID'],
                website: 'https://2-harvest.org',
                rating: 4.8,
                reviews: 25
            },
            {
                id: 'food-2',
                name: 'Serve Spokane',
                category: 'food',
                subcategory: 'food bank',
                address: '8303 B, N Division St, Spokane, WA 99208',
                phone: '(509) 489-1133',
                hours: 'Mon-Sat 9:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Community food bank and resource center',
                services: ['food distribution', 'clothing', 'household items'],
                coordinates: { lat: 47.7292, lng: -117.4102 },
                accessibility: ['wheelchair accessible'],
                requirements: ['proof of address'],
                website: '',
                rating: 4.3,
                reviews: 18
            },

            // Treatment Centers
            {
                id: 'treatment-1',
                name: 'Spokane Treatment & Recovery Services (STARS)',
                category: 'treatment',
                subcategory: 'outpatient',
                address: '628 S Cowley St, Spokane, WA 99202',
                phone: '(509) 456-7627',
                hours: 'Mon-Fri 8:00 AM - 6:00 PM',
                availability: 'available',
                description: 'Comprehensive outpatient addiction treatment',
                services: ['individual therapy', 'group therapy', 'medication-assisted treatment', 'case management'],
                coordinates: { lat: 47.6482, lng: -117.4047 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['assessment required', 'insurance or sliding scale'],
                website: 'https://spokanehealth.org',
                rating: 4.6,
                reviews: 32
            },
            {
                id: 'treatment-2',
                name: 'CAT SPOKANE',
                category: 'treatment',
                subcategory: 'residential',
                address: '960 E 3rd Ave, Spokane, WA 99202',
                phone: '(509) 456-7627',
                hours: '24/7',
                availability: 'limited',
                description: 'Comprehensive residential addiction treatment',
                services: ['residential treatment', 'detox', 'aftercare planning'],
                coordinates: { lat: 47.6531, lng: -117.3936 },
                accessibility: ['wheelchair accessible'],
                requirements: ['assessment required', 'insurance or payment plan'],
                website: '',
                rating: 4.4,
                reviews: 28
            },

            // Support Groups
            {
                id: 'support-1',
                name: 'Al-Anon/Alateen',
                category: 'support',
                subcategory: '12-step',
                address: '1700 W. 7th Ave, Suite 100, Spokane, WA 99204',
                phone: '(509) 456-7627',
                hours: 'Various meeting times',
                availability: 'available',
                description: 'Support for families and friends of alcoholics',
                services: ['12-step meetings', 'family support', 'teen support'],
                coordinates: { lat: 47.6462, lng: -117.4457 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://al-anon.org',
                rating: 4.9,
                reviews: 45
            },
            {
                id: 'support-2',
                name: 'Celebrate Recovery',
                category: 'support',
                subcategory: 'christian',
                address: '1504 W. Grace Ave, Spokane, WA 99205',
                phone: '(509) 456-7627',
                hours: 'Thursdays 6:00 PM',
                availability: 'available',
                description: 'Christian-based recovery support group',
                services: ['12-step meetings', 'bible study', 'fellowship'],
                coordinates: { lat: 47.6822, lng: -117.4397 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: '',
                rating: 4.7,
                reviews: 22
            },

            // Medical & Mental Health
            {
                id: 'medical-1',
                name: 'Providence Sacred Heart Medical Center',
                category: 'medical',
                subcategory: 'hospital',
                address: '101 W 8th Ave, Spokane, WA 99204',
                phone: '(509) 474-3131',
                hours: '24/7',
                availability: 'available',
                description: 'Full-service hospital with mental health services',
                services: ['emergency care', 'mental health', 'addiction medicine'],
                coordinates: { lat: 47.6486, lng: -117.4116 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['insurance or payment plan'],
                website: 'https://providence.org',
                rating: 4.5,
                reviews: 156
            },
            {
                id: 'medical-2',
                name: 'MultiCare Deaconess Hospital',
                category: 'medical',
                subcategory: 'hospital',
                address: '800 W 5th Ave, Spokane, WA 99204',
                phone: '(509) 473-5800',
                hours: '24/7',
                availability: 'available',
                description: 'Hospital with behavioral health services',
                services: ['emergency care', 'mental health', 'addiction treatment'],
                coordinates: { lat: 47.6512, lng: -117.4262 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['insurance or payment plan'],
                website: 'https://multicare.org',
                rating: 4.3,
                reviews: 89
            }
        ];
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('resourceSearch');
        const searchButton = document.querySelector('.search-btn');
        
        console.log('Search input found:', searchInput);
        console.log('Search button found:', searchButton);
        
        if (searchInput) {
            // Handle input changes (real-time search)
            searchInput.addEventListener('input', (e) => {
                console.log('Search input changed:', e.target.value);
                this.currentFilters.search = e.target.value.toLowerCase();
                this.filterResources();
            });
            
            // Handle Enter key press
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    console.log('Enter pressed, searching for:', e.target.value);
                    this.currentFilters.search = e.target.value.toLowerCase();
                    this.filterResources();
                }
            });
        }
        
        // Handle search button click
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const searchValue = searchInput ? searchInput.value.toLowerCase() : '';
                console.log('Search button clicked, searching for:', searchValue);
                this.currentFilters.search = searchValue;
                this.filterResources();
            });
        }
        
        // Add clear search functionality
        this.setupClearSearch();

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.filterResources();
            });
        }

        // Location filter
        const locationFilter = document.getElementById('locationFilter');
        if (locationFilter) {
            locationFilter.addEventListener('change', (e) => {
                this.currentFilters.location = e.target.value;
                this.filterResources();
            });
        }

        // Availability filter
        const availabilityFilter = document.getElementById('availabilityFilter');
        if (availabilityFilter) {
            availabilityFilter.addEventListener('change', (e) => {
                this.currentFilters.availability = e.target.value;
                this.filterResources();
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('sortResources');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortResources(e.target.value);
            });
        }
    }

    filterResources() {
        console.log('Filtering resources with:', this.currentFilters);
        this.filteredResources = this.resources.filter(resource => {
            // Search filter
            if (this.currentFilters.search && this.currentFilters.search.trim() !== '') {
                const searchTerm = this.currentFilters.search.trim();
                const searchableText = `${resource.name} ${resource.description} ${resource.services.join(' ')}`.toLowerCase();
                console.log('Checking resource:', resource.name, 'against search term:', searchTerm);
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            // Category filter
            if (this.currentFilters.category !== 'all' && resource.category !== this.currentFilters.category) {
                return false;
            }

            // Location filter (simplified - could be enhanced with actual location logic)
            if (this.currentFilters.location !== 'all') {
                // This would need more sophisticated location filtering
                return true;
            }

            // Availability filter
            if (this.currentFilters.availability !== 'all' && resource.availability !== this.currentFilters.availability) {
                return false;
            }

            return true;
        });

        this.renderResources();
    }

    sortResources(sortBy) {
        this.filteredResources.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'rating':
                    return b.rating - a.rating;
                case 'distance':
                    // This would need user location to work properly
                    return 0;
                case 'relevance':
                    // Default sort - keep current order
                    return 0;
                default:
                    return 0;
            }
        });

        this.renderResources();
    }

    renderResources() {
        const container = document.getElementById('resourceResults');
        console.log('Rendering resources, container found:', container);
        console.log('Filtered resources count:', this.filteredResources.length);
        if (!container) return;

        if (this.filteredResources.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-search fs-1 text-muted mb-3"></i>
                    <h4 class="text-muted">No resources found</h4>
                    <p class="text-muted">Try adjusting your search criteria or filters.</p>
                </div>
            `;
            return;
        }

        const resourcesHTML = this.filteredResources.map(resource => this.createResourceCard(resource)).join('');
        container.innerHTML = resourcesHTML;

        // Add event listeners to resource cards
        this.setupResourceCardListeners();
    }

    createResourceCard(resource) {
        const ratingStars = this.generateRatingStars(resource.rating);
        const categoryIcon = this.getCategoryIcon(resource.category);
        const availabilityBadge = this.getAvailabilityBadge(resource.availability);

        return `
            <div class="col-lg-6 col-xl-4 mb-4" data-resource-id="${resource.id}">
                <div class="card h-100 resource-card" style="transition: transform 0.2s;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="d-flex align-items-center">
                                <i class="bi ${categoryIcon} fs-4 text-primary me-2"></i>
                                <h5 class="card-title mb-0">${resource.name}</h5>
                            </div>
                            ${availabilityBadge}
                        </div>
                        
                        <p class="card-text text-muted small mb-2">
                            <i class="bi bi-geo-alt me-1"></i>${resource.address}
                        </p>
                        
                        <p class="card-text">${resource.description}</p>
                        
                        <div class="mb-3">
                            <strong>Services:</strong>
                            <div class="mt-1">
                                ${resource.services.map(service => 
                                    `<span class="badge bg-light text-dark me-1 mb-1">${service}</span>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-6">
                                <small class="text-muted">
                                    <i class="bi bi-clock me-1"></i>${resource.hours}
                                </small>
                            </div>
                            <div class="col-6 text-end">
                                <small class="text-muted">
                                    <i class="bi bi-star-fill text-warning me-1"></i>${resource.rating} (${resource.reviews})
                                </small>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <button class="btn btn-sm btn-outline-primary resource-details-btn" 
                                    data-resource-id="${resource.id}">
                                <i class="bi bi-info-circle me-1"></i>Details
                            </button>
                            <div class="d-flex gap-1">
                                <button class="btn btn-sm btn-outline-warning feedback-btn" 
                                        data-resource-id="${resource.id}">
                                    <i class="bi bi-star me-1"></i>Rate
                                </button>
                                ${resource.phone ? `
                                    <a href="tel:${resource.phone}" class="btn btn-sm btn-success">
                                        <i class="bi bi-telephone me-1"></i>Call
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="bi bi-star-fill text-warning"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="bi bi-star-half text-warning"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="bi bi-star text-muted"></i>';
        }
        return stars;
    }

    getCategoryIcon(category) {
        const icons = {
            'shelter': 'bi-house-door',
            'food': 'bi-bag-heart',
            'treatment': 'bi-capsule',
            'support': 'bi-people-fill',
            'medical': 'bi-heart-pulse'
        };
        return icons[category] || 'bi-question-circle';
    }

    getAvailabilityBadge(availability) {
        const badges = {
            'available': '<span class="badge bg-success">Available</span>',
            'limited': '<span class="badge bg-warning">Limited</span>',
            'full': '<span class="badge bg-danger">Full</span>',
            'closed': '<span class="badge bg-secondary">Closed</span>'
        };
        return badges[availability] || '<span class="badge bg-secondary">Unknown</span>';
    }

    setupResourceCardListeners() {
        // Add hover effects
        const cards = document.querySelectorAll('.resource-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });

        // Add details button listeners
        const detailButtons = document.querySelectorAll('.resource-details-btn');
        detailButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const resourceId = e.target.closest('.resource-details-btn').dataset.resourceId;
                this.showResourceDetails(resourceId);
            });
        });
    }

    setupClearSearch() {
        // Add clear search button after search results
        const resultsContainer = document.getElementById('resourceResults');
        if (resultsContainer) {
            const clearButton = document.createElement('button');
            clearButton.className = 'btn btn-outline-secondary btn-sm ms-2';
            clearButton.innerHTML = '<i class="bi bi-x-circle me-1"></i>Clear Search';
            clearButton.addEventListener('click', () => {
                this.currentFilters.search = '';
                const searchInput = document.getElementById('resourceSearch');
                if (searchInput) {
                    searchInput.value = '';
                }
                this.filterResources();
            });
            
            // Add clear button to search area
            const searchContainer = document.querySelector('.input-group');
            if (searchContainer) {
                searchContainer.appendChild(clearButton);
            }
        }
    }

    showResourceDetails(resourceId) {
        const resource = this.resources.find(r => r.id === resourceId);
        if (!resource) return;

        // Create modal content
        const modalContent = `
            <div class="modal fade" id="resourceModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi ${this.getCategoryIcon(resource.category)} me-2"></i>
                                ${resource.name}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <h6>Description</h6>
                                    <p>${resource.description}</p>
                                    
                                    <h6>Services</h6>
                                    <div class="mb-3">
                                        ${resource.services.map(service => 
                                            `<span class="badge bg-primary me-1 mb-1">${service}</span>`
                                        ).join('')}
                                    </div>
                                    
                                    <h6>Requirements</h6>
                                    <p>${resource.requirements.join(', ')}</p>
                                    
                                    <h6>Accessibility</h6>
                                    <p>${resource.accessibility.join(', ')}</p>
                                </div>
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-body">
                                            <h6>Contact Information</h6>
                                            <p><i class="bi bi-geo-alt me-2"></i>${resource.address}</p>
                                            ${resource.phone ? `<p><i class="bi bi-telephone me-2"></i>${resource.phone}</p>` : ''}
                                            ${resource.website ? `<p><i class="bi bi-globe me-2"></i><a href="${resource.website}" target="_blank">Website</a></p>` : ''}
                                            <p><i class="bi bi-clock me-2"></i>${resource.hours}</p>
                                            
                                            <hr>
                                            
                                            <h6>Rating</h6>
                                            <div class="mb-2">${this.generateRatingStars(resource.rating)}</div>
                                            <small class="text-muted">${resource.rating}/5 (${resource.reviews} reviews)</small>
                                            
                                            <hr>
                                            
                                            <div class="d-grid gap-2">
                                                ${resource.phone ? `<a href="tel:${resource.phone}" class="btn btn-success"><i class="bi bi-telephone me-2"></i>Call Now</a>` : ''}
                                                ${resource.website ? `<a href="${resource.website}" target="_blank" class="btn btn-outline-primary"><i class="bi bi-globe me-2"></i>Visit Website</a>` : ''}
                                                <button class="btn btn-outline-secondary" onclick="showDirections('${resource.coordinates.lat}', '${resource.coordinates.lng}')">
                                                    <i class="bi bi-map me-2"></i>Get Directions
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if present
        const existingModal = document.getElementById('resourceModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add new modal to page
        document.body.insertAdjacentHTML('beforeend', modalContent);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('resourceModal'));
        modal.show();
    }
}

// Global function for directions
function showDirections(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('resourceDirectory')) {
        new ResourceDirectory();
    }
}); 