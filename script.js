// Global variables
let currentLocation = null;
let uploadedFiles = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize app
function initializeApp() {
    setupNavigation();
    setupFilters();
    setupFormValidation();
    setupMediaUpload();
    setupLocationServices();
}

// Navigation functionality
function setupNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }

            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });
}

// Utility function to scroll to section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offsetTop = element.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Filter functionality
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const reportCards = document.querySelectorAll('.report-card');
    const reportsCount = document.getElementById('reports-found');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const status = button.getAttribute('data-status');
            filterReports(status);
        });
    });

    function filterReports(status) {
        let visibleCount = 0;

        reportCards.forEach(card => {
            const cardStatus = card.getAttribute('data-status');

            if (status === 'all' || cardStatus === status) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update count
        if (reportsCount) {
            reportsCount.textContent = `${visibleCount} Reports Found`;
        }
    }
}

// Refresh reports
function refreshReports() {
    const refreshBtn = document.querySelector('.refresh-btn i');
    if (refreshBtn) {
        refreshBtn.style.animation = 'spin 1s linear';
        setTimeout(() => {
            refreshBtn.style.animation = '';
        }, 1000);
    }

    // Simulate refresh - in real app, this would fetch new data
    console.log('Refreshing reports...');
}

// Form validation and submission
function setupFormValidation() {
    const form = document.getElementById('report-form');

    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
}

function handleFormSubmission(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    // Basic validation
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#d32f2f';
            showError(field, 'This field is required');
        } else {
            field.style.borderColor = '#e0e0e0';
            clearError(field);
        }
    });

    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Show loading state
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Show success message
        showNotification('Report submitted successfully! We\'ll review it shortly.', 'success');

        // Reset form
        form.reset();
        clearMediaPreviews();

        // Scroll to top of form
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 2000);
}

function showError(field, message) {
    clearError(field);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#d32f2f';
    errorDiv.style.fontSize = '0.85rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);
}

function clearError(field) {
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        z-index: 10000;
        max-width: 300px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Media upload functionality
function setupMediaUpload() {
    const mediaInput = document.getElementById('media');
    const mediaPreview = document.getElementById('media-preview');

    if (mediaInput && mediaPreview) {
        mediaInput.addEventListener('change', handleMediaUpload);

        // Drag and drop functionality
        const uploadLabel = document.querySelector('.upload-label');
        if (uploadLabel) {
            uploadLabel.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadLabel.style.background = '#e3f2fd';
            });

            uploadLabel.addEventListener('dragleave', () => {
                uploadLabel.style.background = '';
            });

            uploadLabel.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadLabel.style.background = '';

                const files = Array.from(e.dataTransfer.files);
                handleFiles(files);
            });
        }
    }
}

function handleMediaUpload(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
}

function handleFiles(files) {
    const mediaPreview = document.getElementById('media-preview');
    const maxSize = 10 * 1024 * 1024; // 10MB

    files.forEach(file => {
        if (file.size > maxSize) {
            showNotification(`File ${file.name} is too large. Maximum size is 10MB.`, 'error');
            return;
        }

        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            showNotification(`File ${file.name} is not a valid image or video.`, 'error');
            return;
        }

        uploadedFiles.push(file);
        createMediaPreview(file, mediaPreview);
    });
}

function createMediaPreview(file, container) {
    const previewDiv = document.createElement('div');
    previewDiv.style.cssText = `
        position: relative;
        display: inline-block;
        margin-right: 10px;
        margin-bottom: 10px;
    `;

    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.style.cssText = `
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #e0e0e0;
        `;

        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        previewDiv.appendChild(img);
    } else {
        const videoDiv = document.createElement('div');
        videoDiv.style.cssText = `
            width: 80px;
            height: 80px;
            background: #f0f0f0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #e0e0e0;
        `;
        videoDiv.innerHTML = '<i class="fas fa-video" style="color: #666; font-size: 1.5rem;"></i>';
        previewDiv.appendChild(videoDiv);
    }

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.style.cssText = `
        position: absolute;
        top: -5px;
        right: -5px;
        background: #d32f2f;
        color: white;
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 0.7rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', () => {
        const index = uploadedFiles.indexOf(file);
        if (index > -1) {
            uploadedFiles.splice(index, 1);
        }
        container.removeChild(previewDiv);
    });

    previewDiv.appendChild(removeBtn);
    container.appendChild(previewDiv);
}

function clearMediaPreviews() {
    const mediaPreview = document.getElementById('media-preview');
    if (mediaPreview) {
        mediaPreview.innerHTML = '';
    }
    uploadedFiles = [];
}

// Location services
function setupLocationServices() {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser.');
    }
}

function getCurrentLocation() {
    const locationStatus = document.getElementById('location-status');
    const locationInput = document.getElementById('location');

    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by your browser', 'error');
        return;
    }

    locationStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting your location...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            currentLocation = { lat, lng };

            // Use reverse geocoding (in real app, you'd use a service like Google Maps)
            locationStatus.innerHTML = '<i class="fas fa-check"></i> Location detected successfully';
            locationInput.value = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;

            // In a real application, you would reverse geocode this to get a readable address
            reverseGeocode(lat, lng);
        },
        (error) => {
            let errorMessage = 'Unable to get location. ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Please allow location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out.';
                    break;
            }

            locationStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + errorMessage;
            locationStatus.style.color = '#d32f2f';
            showNotification(errorMessage, 'error');
        },
        {
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

// Reverse geocoding (mock function - in real app use Google Maps API)
function reverseGeocode(lat, lng) {
    // Mock reverse geocoding - in real app, use Google Maps Geocoding API
    setTimeout(() => {
        const locationInput = document.getElementById('location');
        const mockAddress = `${Math.floor(Math.random() * 100) + 1} Main Street, Block ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}, City`;
        locationInput.value = mockAddress;

        const locationStatus = document.getElementById('location-status');
        locationStatus.innerHTML = '<i class="fas fa-check"></i> Address found and filled';
    }, 1000);
}

// AI Assistant functionality
function toggleAiChat() {
    showNotification('AI Assistant feature coming soon! This will help you describe your issues more effectively.', 'info');
}

// Intersection Observer for animations
function setupAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.report-card, .about-card, .form-container');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', setupAnimations);

// Add CSS for animations
const animationCSS = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .fade-in-up {
        animation: fadeInUp 0.6s ease forwards;
    }
`;

// Add animation styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = animationCSS;
document.head.appendChild(styleSheet);

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search functionality (for future enhancement)
function searchReports(query) {
    const reportCards = document.querySelectorAll('.report-card');
    const searchTerm = query.toLowerCase();

    reportCards.forEach(card => {
        const title = card.querySelector('h4').textContent.toLowerCase();
        const description = card.querySelector('.report-description').textContent.toLowerCase();

        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Performance optimization: Lazy loading for images (if any)
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Call setup functions
document.addEventListener('DOMContentLoaded', setupLazyLoading);

// Service Worker registration for PWA capabilities (future enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when you have a service worker file
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}




// Login/Register Popup functionality
const loginPopup = document.getElementById('login-popup');
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const profileSection = document.getElementById('profile-section');

function openLoginPopup() {
    if (loginPopup) {
        loginPopup.classList.add('active');
    }
}

function closeLoginPopup() {
    if (loginPopup) {
        loginPopup.classList.remove('active');
    }
}

function toggleForms() {
    if (loginView.style.display === 'none') {
        loginView.style.display = 'block';
        registerView.style.display = 'none';
    } else {
        loginView.style.display = 'none';
        registerView.style.display = 'block';
    }
}

function checkFirstVisit() {
    if (!localStorage.getItem('isLoggedIn')) {
        setTimeout(() => {
            openLoginPopup();
        }, 1000); // Show after 1 second
    } else {
        profileSection.style.display = 'block';
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Login successful!', 'success');
        localStorage.setItem('isLoggedIn', 'true');
        closeLoginPopup();
        profileSection.style.display = 'block';
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Registration successful!', 'success');
        localStorage.setItem('isLoggedIn', 'true');
        closeLoginPopup();
        profileSection.style.display = 'block';
    });
}

// Check for first visit on DOM load
document.addEventListener('DOMContentLoaded', checkFirstVisit);
