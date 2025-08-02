// src/js/auth-modal.js - Reusable Authentication Modal

// Create authentication modal
function createAuthModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'authModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Welcome to Get Sober Spokane</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <ul class="nav nav-tabs" id="authTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="login-tab" data-bs-toggle="tab" data-bs-target="#login" type="button" role="tab">Login</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="register-tab" data-bs-toggle="tab" data-bs-target="#register" type="button" role="tab">Register</button>
                        </li>
                    </ul>
                    
                    <div class="tab-content" id="authTabContent">
                        <!-- Login Tab -->
                        <div class="tab-pane fade show active" id="login" role="tabpanel">
                            <div class="mt-3">
                                <form id="loginForm">
                                    <div class="mb-3">
                                        <label for="login-email" class="form-label">Email</label>
                                        <input type="email" class="form-control" id="login-email" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="login-password" class="form-label">Password</label>
                                        <input type="password" class="form-control" id="login-password" required>
                                    </div>
                                    <div class="d-grid">
                                        <button type="submit" class="btn btn-primary">Login</button>
                                    </div>
                                </form>
                                
                                <hr>
                                
                                <div class="d-grid gap-2">
                                    <button class="btn btn-outline-primary" onclick="handleGoogleLogin()">
                                        <i class="bi bi-google me-2"></i>Continue with Google
                                    </button>
                                    <button class="btn btn-outline-secondary" onclick="enableAnonymousMode()">
                                        <i class="bi bi-person-x me-2"></i>Continue Anonymously
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Register Tab -->
                        <div class="tab-pane fade" id="register" role="tabpanel">
                            <div class="mt-3">
                                <form id="registerForm">
                                    <div class="mb-3">
                                        <label for="register-display-name" class="form-label">Display Name</label>
                                        <input type="text" class="form-control" id="register-display-name" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="register-email" class="form-label">Email</label>
                                        <input type="email" class="form-control" id="register-email" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="register-password" class="form-label">Password</label>
                                        <input type="password" class="form-control" id="register-password" required>
                                    </div>
                                    <div class="mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="register-anonymous">
                                            <label class="form-check-label" for="register-anonymous">
                                                Register anonymously (no email required)
                                            </label>
                                        </div>
                                    </div>
                                    <div class="d-grid">
                                        <button type="submit" class="btn btn-primary">Register</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Show authentication modal
window.showAuthModal = function() {
    // Remove existing modal if present
    const existingModal = document.getElementById('authModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create and show new modal
    const modal = createAuthModal();
    document.body.appendChild(modal);
    
    // Setup form handlers
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(e);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister(e);
        });
    }
    
    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // Clean up when modal is hidden
    modal.addEventListener('hidden.bs.modal', function() {
        modal.remove();
    });
};

// Add auth button to navigation
function addAuthButton() {
    const navbar = document.querySelector('.navbar-nav');
    if (!navbar) return;
    
    // Check if auth button already exists
    if (document.getElementById('auth-button')) return;
    
    const authButton = document.createElement('li');
    authButton.className = 'nav-item';
    authButton.id = 'auth-button';
    authButton.innerHTML = `
        <button class="btn btn-outline-primary btn-sm" onclick="showAuthModal()">
            <i class="bi bi-person me-1"></i>Login
        </button>
    `;
    
    navbar.appendChild(authButton);
}

// Update auth button based on authentication state
function updateAuthButton() {
    const authButton = document.getElementById('auth-button');
    if (!authButton) return;
    
    if (auth.currentUser || auth.isAnonymous) {
        authButton.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person me-1"></i>${auth.userProfile?.display_name || 'User'}
                </button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="dashboard.html">Dashboard</a></li>
                    <li><a class="dropdown-item" href="dashboard.html#profile">Profile</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="handleLogout()">Logout</a></li>
                </ul>
            </div>
        `;
    } else {
        authButton.innerHTML = `
            <button class="btn btn-outline-primary btn-sm" onclick="showAuthModal()">
                <i class="bi bi-person me-1"></i>Login
            </button>
        `;
    }
}

// Initialize auth modal functionality
document.addEventListener('DOMContentLoaded', function() {
    addAuthButton();
    
    // Update button when auth state changes
    if (typeof auth !== 'undefined') {
        updateAuthButton();
        
        // Listen for auth state changes
        const originalUpdateUI = auth.updateUIForAuthenticatedUser;
        auth.updateUIForAuthenticatedUser = function() {
            originalUpdateUI();
            updateAuthButton();
        };
        
        const originalUpdateUnauthenticated = auth.updateUIForUnauthenticatedUser;
        auth.updateUIForUnauthenticatedUser = function() {
            originalUpdateUnauthenticated();
            updateAuthButton();
        };
    }
});

// Export functions for global access
window.authModal = {
    showAuthModal,
    addAuthButton,
    updateAuthButton
}; 