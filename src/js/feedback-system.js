// Feedback and Rating System
class FeedbackSystem {
    constructor() {
        this.feedback = this.loadFeedback();
        this.init();
    }

    init() {
        this.setupFeedbackModals();
        this.setupRatingListeners();
    }

    loadFeedback() {
        // Load feedback from localStorage or initialize empty
        const stored = localStorage.getItem('resourceFeedback');
        return stored ? JSON.parse(stored) : {};
    }

    saveFeedback() {
        localStorage.setItem('resourceFeedback', JSON.stringify(this.feedback));
    }

    setupFeedbackModals() {
        // Add feedback button to resource cards
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('feedback-btn')) {
                const resourceId = e.target.dataset.resourceId;
                this.showFeedbackModal(resourceId);
            }
        });
    }

    setupRatingListeners() {
        // Handle star rating clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('rating-star')) {
                const rating = parseInt(e.target.dataset.rating);
                const resourceId = e.target.dataset.resourceId;
                this.setRating(resourceId, rating);
            }
        });
    }

    showFeedbackModal(resourceId) {
        const resource = this.getResourceById(resourceId);
        if (!resource) return;

        const modalContent = `
            <div class="modal fade" id="feedbackModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-star me-2"></i>
                                Rate ${resource.name}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <h6>How would you rate your experience?</h6>
                                <div class="rating-stars mb-3" data-resource-id="${resourceId}">
                                    <i class="bi bi-star rating-star" data-rating="1" data-resource-id="${resourceId}"></i>
                                    <i class="bi bi-star rating-star" data-rating="2" data-resource-id="${resourceId}"></i>
                                    <i class="bi bi-star rating-star" data-rating="3" data-resource-id="${resourceId}"></i>
                                    <i class="bi bi-star rating-star" data-rating="4" data-resource-id="${resourceId}"></i>
                                    <i class="bi bi-star rating-star" data-rating="5" data-resource-id="${resourceId}"></i>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="feedbackText" class="form-label">Additional Comments (Optional)</label>
                                <textarea class="form-control" id="feedbackText" rows="3" placeholder="Share your experience, suggestions, or concerns..."></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">What services did you use?</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="emergency shelter" id="service1">
                                    <label class="form-check-label" for="service1">Emergency Shelter</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="food assistance" id="service2">
                                    <label class="form-check-label" for="service2">Food Assistance</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="treatment" id="service3">
                                    <label class="form-check-label" for="service3">Treatment Services</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="support group" id="service4">
                                    <label class="form-check-label" for="service4">Support Group</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="medical care" id="service5">
                                    <label class="form-check-label" for="service5">Medical Care</label>
                                </div>
                            </div>
                            
                            <div class="alert alert-info">
                                <i class="bi bi-info-circle me-2"></i>
                                Your feedback helps improve services for others in the community. All feedback is anonymous.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="feedbackSystem.submitFeedback('${resourceId}')">
                                <i class="bi bi-send me-2"></i>Submit Feedback
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if present
        const existingModal = document.getElementById('feedbackModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add new modal to page
        document.body.insertAdjacentHTML('beforeend', modalContent);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
        modal.show();
    }

    setRating(resourceId, rating) {
        const stars = document.querySelectorAll(`[data-resource-id="${resourceId}"].rating-star`);
        stars.forEach((star, index) => {
            const starRating = index + 1;
            if (starRating <= rating) {
                star.classList.remove('bi-star');
                star.classList.add('bi-star-fill', 'text-warning');
            } else {
                star.classList.remove('bi-star-fill', 'text-warning');
                star.classList.add('bi-star');
            }
        });
    }

    submitFeedback(resourceId) {
        const rating = document.querySelectorAll(`[data-resource-id="${resourceId}"].bi-star-fill`).length;
        const feedbackText = document.getElementById('feedbackText').value;
        const services = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);

        if (rating === 0) {
            alert('Please provide a rating before submitting feedback.');
            return;
        }

        const feedback = {
            rating: rating,
            comment: feedbackText,
            services: services,
            timestamp: new Date().toISOString(),
            resourceId: resourceId
        };

        // Store feedback
        if (!this.feedback[resourceId]) {
            this.feedback[resourceId] = [];
        }
        this.feedback[resourceId].push(feedback);
        this.saveFeedback();

        // Update resource rating
        this.updateResourceRating(resourceId);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('feedbackModal'));
        modal.hide();

        // Show success message
        this.showSuccessMessage();
    }

    updateResourceRating(resourceId) {
        const resourceFeedbacks = this.feedback[resourceId] || [];
        if (resourceFeedbacks.length === 0) return;

        const totalRating = resourceFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
        const averageRating = totalRating / resourceFeedbacks.length;

        // Update the resource's rating display
        const ratingElement = document.querySelector(`[data-resource-id="${resourceId}"] .resource-rating`);
        if (ratingElement) {
            ratingElement.innerHTML = this.generateRatingStars(averageRating);
            ratingElement.innerHTML += ` <small class="text-muted">(${resourceFeedbacks.length} reviews)</small>`;
        }
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

    showSuccessMessage() {
        const successAlert = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="bi bi-check-circle me-2"></i>
                Thank you for your feedback! It helps improve services for the community.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Add to page
        const container = document.querySelector('.container');
        if (container) {
            container.insertAdjacentHTML('afterbegin', successAlert);
        }
    }

    getResourceById(resourceId) {
        // This would need to be connected to the actual resource data
        // For now, return a basic object
        return {
            name: 'Resource',
            id: resourceId
        };
    }

    getFeedbackStats(resourceId) {
        const feedbacks = this.feedback[resourceId] || [];
        if (feedbacks.length === 0) return null;

        const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
        const averageRating = totalRating / feedbacks.length;

        return {
            averageRating: averageRating,
            totalReviews: feedbacks.length,
            recentFeedback: feedbacks.slice(-3) // Last 3 feedbacks
        };
    }
}

// Initialize feedback system
let feedbackSystem;
document.addEventListener('DOMContentLoaded', () => {
    feedbackSystem = new FeedbackSystem();
}); 