// Emergency Help System
class EmergencyHelp {
    constructor() {
        this.emergencyContacts = {
            crisis: {
                name: 'National Suicide Prevention Lifeline',
                number: '988',
                description: '24/7 crisis support and suicide prevention',
                category: 'crisis'
            },
            substance: {
                name: 'SAMHSA National Helpline',
                number: '1-800-662-4357',
                description: 'Treatment referral and information service',
                category: 'substance'
            },
            domestic: {
                name: 'National Domestic Violence Hotline',
                number: '1-800-799-7233',
                description: 'Support for domestic violence situations',
                category: 'domestic'
            },
            youth: {
                name: 'Crisis Text Line',
                number: 'Text HOME to 741741',
                description: 'Crisis support via text message',
                category: 'youth'
            },
            local: {
                name: 'Spokane Crisis Response',
                number: '(509) 456-7627',
                description: 'Local crisis intervention services',
                category: 'local'
            }
        };
        
        this.init();
    }

    init() {
        this.setupEmergencyButtons();
        this.setupQuickHelp();
    }

    setupEmergencyButtons() {
        // Add emergency buttons to the page
        const emergencyContainer = document.getElementById('emergencyHelp');
        if (emergencyContainer) {
            emergencyContainer.innerHTML = this.createEmergencyButtons();
            this.addEmergencyButtonListeners();
        }
    }

    createEmergencyButtons() {
        return `
            <div class="row g-3">
                <div class="col-md-6 col-lg-4">
                    <div class="card emergency-card crisis-card h-100">
                        <div class="card-body text-center">
                            <i class="bi bi-telephone-fill fs-1 text-danger mb-3"></i>
                            <h5 class="card-title">Crisis Support</h5>
                            <p class="card-text">Immediate help for crisis situations</p>
                            <button class="btn btn-danger btn-lg w-100" data-contact="crisis">
                                <i class="bi bi-telephone me-2"></i>Call 988
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4">
                    <div class="card emergency-card substance-card h-100">
                        <div class="card-body text-center">
                            <i class="bi bi-capsule fs-1 text-primary mb-3"></i>
                            <h5 class="card-title">Substance Use Help</h5>
                            <p class="card-text">Treatment and recovery support</p>
                            <button class="btn btn-primary btn-lg w-100" data-contact="substance">
                                <i class="bi bi-telephone me-2"></i>Call SAMHSA
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4">
                    <div class="card emergency-card local-card h-100">
                        <div class="card-body text-center">
                            <i class="bi bi-geo-alt-fill fs-1 text-success mb-3"></i>
                            <h5 class="card-title">Local Help</h5>
                            <p class="card-text">Spokane area crisis services</p>
                            <button class="btn btn-success btn-lg w-100" data-contact="local">
                                <i class="bi bi-telephone me-2"></i>Call Local
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    addEmergencyButtonListeners() {
        const buttons = document.querySelectorAll('[data-contact]');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const contactType = e.target.closest('[data-contact]').dataset.contact;
                this.handleEmergencyCall(contactType);
            });
        });
    }

    handleEmergencyCall(contactType) {
        const contact = this.emergencyContacts[contactType];
        if (!contact) return;

        // Show confirmation modal
        this.showEmergencyModal(contact);
    }

    showEmergencyModal(contact) {
        const modalContent = `
            <div class="modal fade" id="emergencyModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-exclamation-triangle me-2"></i>
                                Emergency Contact
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <h4>${contact.name}</h4>
                                <p class="text-muted">${contact.description}</p>
                                <div class="display-4 text-danger fw-bold">${contact.number}</div>
                            </div>
                            <div class="alert alert-info">
                                <i class="bi bi-info-circle me-2"></i>
                                This service is available 24/7 and provides confidential support.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <a href="tel:${contact.number.replace(/\D/g, '')}" class="btn btn-danger">
                                <i class="bi bi-telephone me-2"></i>Call Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if present
        const existingModal = document.getElementById('emergencyModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add new modal to page
        document.body.insertAdjacentHTML('beforeend', modalContent);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('emergencyModal'));
        modal.show();
    }

    setupQuickHelp() {
        // Add quick help section if it exists
        const quickHelpContainer = document.getElementById('quickHelp');
        if (quickHelpContainer) {
            quickHelpContainer.innerHTML = this.createQuickHelpSection();
        }
    }

    createQuickHelpSection() {
        return `
            <div class="row g-4">
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">
                                <i class="bi bi-shield-check text-success me-2"></i>
                                Safe Exit
                            </h5>
                            <p class="card-text">If you need to quickly leave this page for safety reasons, click the button below.</p>
                            <button class="btn btn-outline-success" onclick="window.open('https://www.google.com', '_blank')">
                                <i class="bi bi-box-arrow-up-right me-2"></i>Safe Exit
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">
                                <i class="bi bi-geo-alt text-primary me-2"></i>
                                Find Nearest Help
                            </h5>
                            <p class="card-text">Get directions to the nearest emergency services or treatment centers.</p>
                            <button class="btn btn-outline-primary" onclick="findNearestHelp()">
                                <i class="bi bi-map me-2"></i>Find Help
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Global function to find nearest help
function findNearestHelp() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const url = `https://www.google.com/maps/search/emergency+services/@${lat},${lng},13z`;
                window.open(url, '_blank');
            },
            (error) => {
                // Fallback to Spokane area
                const url = 'https://www.google.com/maps/search/emergency+services/@47.6588,-117.426,13z';
                window.open(url, '_blank');
            }
        );
    } else {
        // Fallback to Spokane area
        const url = 'https://www.google.com/maps/search/emergency+services/@47.6588,-117.426,13z';
        window.open(url, '_blank');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmergencyHelp();
}); 