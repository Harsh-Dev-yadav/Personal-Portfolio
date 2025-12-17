// ================================
// SMOOTH SCROLLING FOR NAV LINKS
// ================================

/**
 * Initialize smooth scrolling for all anchor links in navigation
 */
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ================================
// ACTIVE SECTION HIGHLIGHTING
// ================================

/**
 * Highlight the active section in navigation based on scroll position
 */
function initActiveNavHighlight() {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    function highlightActiveSection() {
        let currentSection = '';
        const scrollPosition = window.scrollY + 150; // Offset for sticky header
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Throttle scroll events for better performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                highlightActiveSection();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Initial check on page load
    highlightActiveSection();
}

// ================================
// HERO SECTION ANIMATIONS
// ================================

/**
 * Fade-in animation for hero section elements on page load
 */
function initHeroAnimations() {
    const heroSection = document.querySelector('#hero');
    if (!heroSection) return;
    
    const heroTitle = heroSection.querySelector('h1');
    const heroSubtitle = heroSection.querySelectorAll('p');
    
    // Add fade-in styles dynamically
    const animateElement = (element, delay) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, delay);
    };
    
    // Animate elements with staggered delays
    if (heroTitle) animateElement(heroTitle, 200);
    heroSubtitle.forEach((p, index) => {
        animateElement(p, 400 + (index * 200));
    });
}

/**
 * Optional: Typewriter effect for hero title
 * Uncomment the function call in DOMContentLoaded if you prefer this over fade-in
 */
function initTypewriterEffect() {
    const heroTitle = document.querySelector('#hero h1');
    if (!heroTitle) return;
    
    const originalText = heroTitle.textContent;
    heroTitle.textContent = '';
    heroTitle.style.opacity = '1';
    
    let charIndex = 0;
    const typingSpeed = 100; // milliseconds per character
    
    function typeNextChar() {
        if (charIndex < originalText.length) {
            heroTitle.textContent += originalText.charAt(charIndex);
            charIndex++;
            setTimeout(typeNextChar, typingSpeed);
        }
    }
    
    setTimeout(typeNextChar, 500); // Start after 500ms delay
}

// ================================
// FORM VALIDATION & SUBMISSION
// ================================

/**
 * Validate email format using regex
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show inline error message for a form field
 */
function showError(input, message) {
    const formGroup = input.parentElement;
    input.classList.add('error');
    
    // Remove existing error message if any
    let errorMsg = formGroup.querySelector('.error-message');
    if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        formGroup.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
}

/**
 * Clear error state for a form field
 */
function clearError(input) {
    input.classList.remove('error');
    const formGroup = input.parentElement;
    const errorMsg = formGroup.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.style.display = 'none';
    }
}

/**
 * Validate all form fields
 */
function validateForm(form) {
    let isValid = true;
    
    // Get form fields
    const fullname = form.querySelector('#fullname');
    const email = form.querySelector('#email');
    const reason = form.querySelector('#reason');
    const subject = form.querySelector('#subject');
    const message = form.querySelector('#message');
    
    // Clear previous errors
    [fullname, email, reason, subject, message].forEach(clearError);
    
    // Validate full name
    if (!fullname.value.trim()) {
        showError(fullname, 'Please enter your full name');
        isValid = false;
    }
    
    // Validate email
    if (!email.value.trim()) {
        showError(email, 'Please enter your email address');
        isValid = false;
    } else if (!isValidEmail(email.value.trim())) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate reason selection
    if (!reason.value) {
        showError(reason, 'Please select a reason for contact');
        isValid = false;
    }
    
    // Validate subject
    if (!subject.value.trim()) {
        showError(subject, 'Please enter a subject');
        isValid = false;
    }
    
    // Validate message
    if (!message.value.trim()) {
        showError(message, 'Please enter your message');
        isValid = false;
    } else if (message.value.trim().length < 10) {
        showError(message, 'Message must be at least 10 characters long');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Display success message after form submission
 */
function showSuccessMessage(form) {
    // Create success message element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <h3>Thank You!</h3>
        <p>Your message has been sent successfully. I'll get back to you soon!</p>
    `;
    
    // Add styles for success message
    successDiv.style.cssText = `
        background-color: #d4edda;
        border: 2px solid #28a745;
        color: #155724;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
        margin-top: 1.5rem;
        animation: slideIn 0.5s ease;
    `;
    
    // Hide form and show success message
    form.style.display = 'none';
    form.parentElement.appendChild(successDiv);
    
    // Scroll to success message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Optional: Reset form after a delay and show it again
    setTimeout(() => {
        form.reset();
        successDiv.remove();
        form.style.display = 'block';
    }, 8000); // Show success message for 8 seconds
}

/**
 * Display error message if form submission fails
 */
function showSubmissionError(form, errorMessage = 'Something went wrong. Please try again.') {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'submission-error';
    errorDiv.innerHTML = `
        <h3>Oops!</h3>
        <p>${errorMessage}</p>
    `;
    
    errorDiv.style.cssText = `
        background-color: #f8d7da;
        border: 2px solid #dc3545;
        color: #721c24;
        padding: 1.5rem;
        border-radius: 8px;
        text-align: center;
        margin-top: 1.5rem;
    `;
    
    // Remove existing error message if any
    const existingError = form.parentElement.querySelector('.submission-error');
    if (existingError) {
        existingError.remove();
    }
    
    form.parentElement.insertBefore(errorDiv, form.nextSibling);
    
    // Auto-remove error message after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

/**
 * Initialize form submission with AJAX
 */
function initFormSubmission() {
    const form = document.querySelector('#contact form');
    if (!form) return;
    
    // Add real-time validation on input
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim()) {
                if (input.type === 'email') {
                    if (!isValidEmail(input.value.trim())) {
                        showError(input, 'Please enter a valid email address');
                    } else {
                        clearError(input);
                    }
                } else {
                    clearError(input);
                }
            }
        });
        
        // Clear error on input
        input.addEventListener('input', () => {
            if (input.classList.contains('error') && input.value.trim()) {
                clearError(input);
            }
        });
    });
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm(form)) {
            return;
        }
        
        // Get form data
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        submitButton.style.opacity = '0.6';
        
        try {
            // Send form data using fetch API
            const response = await fetch('process_form.php', {
                method: 'POST',
                body: formData
            });
            
            // Check if response is ok
            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    showSuccessMessage(form);
                } else {
                    showSubmissionError(form, result.message || 'Failed to send message. Please try again.');
                }
            } else {
                showSubmissionError(form, 'Server error. Please try again later.');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            showSubmissionError(form, 'Network error. Please check your connection and try again.');
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            submitButton.style.opacity = '1';
        }
    });
}

// ================================
// ADDITIONAL ENHANCEMENTS
// ================================

/**
 * Add subtle scroll animations to sections
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe project and experience articles
    const animatedElements = document.querySelectorAll('#projects article, #experience article');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
}

/**
 * Add "Back to Top" button functionality
 */
function initBackToTop() {
    // Create back to top button
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.className = 'back-to-top';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    
    // Add styles
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease, background-color 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 999;
    `;
    
    document.body.appendChild(backToTopButton);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.visibility = 'visible';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top on click
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effect
    backToTopButton.addEventListener('mouseenter', () => {
        backToTopButton.style.backgroundColor = '#2980b9';
    });
    
    backToTopButton.addEventListener('mouseleave', () => {
        backToTopButton.style.backgroundColor = '#3498db';
    });
}

// ================================
// INITIALIZE ALL FEATURES
// ================================

/**
 * Initialize all JavaScript features when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Core navigation features
    initSmoothScrolling();
    initActiveNavHighlight();
    
    // Hero animations (choose one - fade-in is default)
    initHeroAnimations();
    // initTypewriterEffect(); // Uncomment to use typewriter instead of fade-in
    
    // Form functionality
    initFormSubmission();
    
    // Additional enhancements
    initScrollAnimations();
    initBackToTop();
    
    console.log('Resume website initialized successfully! 🚀');
});