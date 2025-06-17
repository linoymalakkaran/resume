/* ===== PORTFOLIO WEBSITE JAVASCRIPT ===== */
/* Complete interactive functionality for Linoy Pappachan Malakkaran's resume website */

/* ===== SMOOTH SCROLLING NAVIGATION ===== */
/**
 * Enhanced smooth scrolling for navigation links
 * Provides smooth transitions when clicking navigation links with proper offset calculation
 */
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                // Calculate proper offset to account for fixed navigation
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ===== SCROLL ANIMATION OBSERVER ===== */
/**
 * Intersection Observer for fade-in animations
 * Optimized for performance by disconnecting observers after animation triggers
 */
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the visible class to trigger fade-in animation
                entry.target.classList.add('visible');
                // Disconnect observer for this element to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with fade-in class
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

/* ===== ENHANCED NAVBAR FUNCTIONALITY ===== */
/**
 * Navbar scroll effects with performance optimization
 * Uses requestAnimationFrame for smooth scroll handling
 */
function initializeNavbarEffects() {
    let lastScrollTop = 0;
    let ticking = false;

    function updateNavbar() {
        const st = window.pageYOffset;
        const navbar = document.getElementById('navbar');
        
        // Add scrolled class when user scrolls down
        if (st > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = st <= 0 ? 0 : st;
        ticking = false;
    }

    // Throttle scroll events using requestAnimationFrame for better performance
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });
}

/* ===== MOBILE HAMBURGER MENU ===== */
/**
 * Mobile navigation toggle functionality
 * Handles hamburger menu animation and mobile menu display
 */
function initializeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    // Toggle mobile menu when hamburger is clicked
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scrolling when mobile menu is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
    });

    // Close mobile menu when clicking on navigation links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
}

/* ===== INTERACTIVE HOVER EFFECTS ===== */
/**
 * Enhanced interaction effects for various elements
 * Provides sophisticated hover animations for better user experience
 */
function initializeHoverEffects() {
    
    // Experience cards hover effects
    document.querySelectorAll('.experience-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Technology tags interactive effects
    document.querySelectorAll('.tech-tag').forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(3deg)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });

    // Company logo rotation effects
    document.querySelectorAll('.company-logo').forEach(logo => {
        logo.addEventListener('mouseenter', function() {
            this.style.transform = 'rotate(8deg) scale(1.1)';
        });
        
        logo.addEventListener('mouseleave', function() {
            this.style.transform = 'rotate(0deg) scale(1)';
        });
    });

    // Achievement items sliding effects
    document.querySelectorAll('.achievement-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(15px)';
            this.style.borderLeftColor = '#667eea';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            this.style.borderLeftColor = '#4c51bf';
        });
    });

    // Certification items hover effects
    document.querySelectorAll('.cert-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

/* ===== IMAGE LOADING ERROR HANDLING ===== */
/**
 * Enhanced image loading with fallback support
 * Ensures graceful degradation when images fail to load
 */
function initializeImageHandling() {
    // Handle profile image loading
    const profileImage = document.querySelector('.profile-image');
    if (profileImage) {
        profileImage.addEventListener('error', function() {
            console.warn('Profile image failed to load, using fallback icon');
            this.style.display = 'none';
            this.parentNode.innerHTML = '<i class="fas fa-user-tie"></i>';
        });
        
        profileImage.addEventListener('load', function() {
            console.log('Profile image loaded successfully');
            this.style.opacity = '1';
        });
    }

    // Handle company logo images
    document.querySelectorAll('.company-logo img').forEach(img => {
        img.addEventListener('error', function() {
            console.warn('Company logo failed to load:', this.src);
            this.style.display = 'none';
            
            // Add appropriate fallback class based on company
            const logoContainer = this.parentNode;
            if (this.src.includes('Adports')) {
                logoContainer.classList.add('logo-adp');
                logoContainer.innerHTML = 'ADP';
            } else if (this.src.includes('Emirates')) {
                logoContainer.classList.add('logo-epg');
                logoContainer.innerHTML = 'EPG';
            } else if (this.src.includes('Keybs')) {
                logoContainer.classList.add('logo-kbs');
                logoContainer.innerHTML = 'KBS';
            } else if (this.src.includes('Suyati')) {
                logoContainer.classList.add('logo-suyati');
                logoContainer.innerHTML = 'SUYATI';
            }
        });
    });

    // Handle certification images
    document.querySelectorAll('.cert-image').forEach(img => {
        img.addEventListener('error', function() {
            console.warn('Certification image failed to load:', this.src);
            this.style.display = 'none';
            this.parentNode.innerHTML = '<i class="fas fa-certificate"></i>';
        });
    });
}

/* ===== ENHANCED RESUME DOWNLOAD FUNCTIONALITY ===== */
/**
 * Resume download function with multiple options
 * Provides both PDF download and text version generation
 */
function downloadResume() {
    // The download buttons in HTML now handle direct PDF downloads
    // This function is kept for backward compatibility and additional features
    showNotification('Resume download initiated! 📄', 'success');
}

/**
 * Download cover letter function
 */
function downloadCoverLetter() {
    showNotification('Cover letter download initiated! 📄', 'success');
}

/**
 * Fallback text resume generation
 * Creates a comprehensive text-based resume when PDF is not available
 */
function downloadTextResume() {
    const resumeContent = `
LINOY PAPPACHAN MALAKKARAN
Solution Consultant & Technical Architect
13+ years driving enterprise digital transformation

CONTACT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: linoymalakkaran@gmail.com
Phone: +971-565921499
Location: Abu Dhabi, UAE
LinkedIn: https://www.linkedin.com/in/linoy-pappachan-malakkaran-665a6068/
GitHub: https://github.com/linoymalakkaran/

PROFESSIONAL EXPERIENCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Abu Dhabi Ports - Maqta Gateway LLC | Solution Consultant | April 2020 - Current
• Architected comprehensive low-code platform enabling rapid development via drag-and-drop UI and microservices
• Led digital transformation initiatives contributing to innovative trade facilitation solutions in UAE's maritime sector
• Spearheaded MAMAR Customs Solution development streamlining processing across maritime, aviation, and terrestrial cargo
• Implemented Power BI analytics delivering actionable intelligence and predictive forecasting to stakeholders

Emirates Post Group | Technical Architect | December 2016 - March 2020
• Led technical transformation of national postal service platform for nationwide customer base
• Architected integrated ecosystem featuring real-time communication and secure payment processing
• Designed high-volume client-server payment processing system with POS integration across UAE market
• Implemented Universal Postal Union integration for global courier tracking and compliance

Key Business Solution | Senior Software Engineer | April 2016 - November 2016
• Spearheaded enterprise payment ecosystem architecture across MENA region
• Executed complex multi-channel integration across Angola, Bahrain, and Saudi Arabia

Suyati Technologies | Software Engineer | 2014 - 2016
• Developed scalable web applications using modern frameworks and technologies
• Delivered custom solutions for diverse industry clients across multiple domains

Multiple Technology Companies | Software Engineer & Technical Specialist | June 2012 - 2014
• Developed comprehensive ERP systems, social media platforms, and SaaS applications
• Created comprehensive management solutions for healthcare and education sectors

TECHNICAL EXPERTISE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cloud Platforms:
• Microsoft Azure | AWS | Google Cloud Platform

Programming Languages:
• C# | Java | Python | JavaScript | TypeScript

Frontend Technologies:
• Angular | React | Vue.js | HTML5 | CSS3

Backend Frameworks:
• .NET Core | Node.js | Spring Boot | REST APIs

Databases:
• SQL Server | PostgreSQL | MongoDB | Redis | Vector Databases

DevOps & Containerization:
• Docker | Kubernetes | CI/CD Pipelines | Azure DevOps

AI & Analytics:
• Azure Machine Learning | Generative AI | Computer Vision | Power BI

Architecture:
• Microservices | TOGAF | Domain-Driven Design | Event-Driven Architecture

KEY ACHIEVEMENTS & AWARDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 Outstanding Performance Award - Emirates Post Group (2019)
   Led digital transformation reducing operational costs by $2M annually

🥇 Contact Center Solution Award - Emirates Post Group (2017)
   Improved customer satisfaction by 40% through innovative architecture

🚀 Co-founder of Socxo
   Built enterprise social advocacy platform serving 100+ corporate clients with scalable SaaS architecture

📋 Professional Certifications:
   • TOGAF Enterprise Architecture Certification
   • Microsoft Azure Solutions Architect Expert
   • Oracle Database Certification
   • Multiple specialized technology certifications

CORE COMPETENCIES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Enterprise Digital Transformation    ✓ Cloud-Native Architecture
✓ Solution Architecture Design         ✓ Low-Code Platform Development
✓ Technical Leadership                 ✓ Cross-Functional Team Management
✓ Stakeholder Communication           ✓ Agile/Scrum Methodologies
✓ Performance Optimization            ✓ Scalable System Design

Generated from: Portfolio Website
Contact: linoymalakkaran@gmail.com | +971-565921499
`;
    
    try {
        // Create downloadable blob
        const blob = new Blob([resumeContent], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        
        // Create temporary download link
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Linoy_Pappachan_Malakkaran_Resume.txt';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up object URL
        window.URL.revokeObjectURL(url);
        
        // Show success notification
        showNotification('Text resume downloaded successfully! 📄', 'success');
        
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Download failed. Please try again.', 'error');
    }
}

/* ===== NOTIFICATION SYSTEM ===== */
/**
 * Advanced notification system with multiple types and animations
 * Provides user feedback for various actions
 */
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    
    // Set notification styles based on type
    const styles = {
        success: {
            background: 'linear-gradient(135deg, #10B981, #059669)',
            icon: '✅'
        },
        error: {
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            icon: '❌'
        },
        info: {
            background: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
            icon: 'ℹ️'
        }
    };
    
    const style = styles[type] || styles.success;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${style.background};
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 500;
        font-family: 'Inter', sans-serif;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    notification.innerHTML = `${style.icon} ${message}`;
    
    // Add animation keyframes if not already present
    if (!document.getElementById('notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(styleSheet);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove notification after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

/* ===== STAGGERED ANIMATIONS ===== */
/**
 * Initialize staggered animations for better visual flow
 * Creates cascading entrance effects for grouped elements
 */
function initializeStaggeredAnimations() {
    // Experience cards staggered animation
    document.querySelectorAll('.experience-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });

    // Skill categories staggered animation
    document.querySelectorAll('.skill-category').forEach((category, index) => {
        category.style.animationDelay = `${index * 0.1}s`;
    });

    // Award cards staggered animation
    document.querySelectorAll('.award-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.15}s`;
    });

    // Contact cards staggered animation
    document.querySelectorAll('.contact-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Certification items staggered animation
    document.querySelectorAll('.cert-item').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}

/* ===== SCROLL PROGRESS INDICATOR ===== */
/**
 * Visual scroll progress indicator
 * Shows user's reading progress through the page
 */
function initializeScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        z-index: 10001;
        transition: width 0.1s ease-out;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = Math.min(scrolled, 100) + '%';
    });
}

/* ===== PERFORMANCE OPTIMIZATIONS ===== */
/**
 * Preload critical resources for better performance
 * Loads important assets before they're needed
 */
function preloadResources() {
    // Preload Font Awesome icons
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'preload';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    fontAwesome.as = 'style';
    document.head.appendChild(fontAwesome);
    
    // Preload Google Fonts
    const googleFonts = document.createElement('link');
    googleFonts.rel = 'preload';
    googleFonts.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
    googleFonts.as = 'style';
    document.head.appendChild(googleFonts);

    // Preload critical images
    const criticalImages = [
        'Images/ProfilePhoto.png',
        'Images/Adports.png',
        'Images/EmiratesPost.png',
        'Images/Keybs.png'
    ];

    criticalImages.forEach(imageSrc => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => console.log(`Preloaded: ${imageSrc}`);
        img.onerror = () => console.warn(`Failed to preload: ${imageSrc}`);
    });
}

/* ===== ACCESSIBILITY ENHANCEMENTS ===== */
/**
 * Keyboard navigation and accessibility improvements
 * Ensures the site is usable by all users
 */
function initializeAccessibility() {
    // Add keyboard navigation for custom elements
    document.querySelectorAll('.download-btn, .contact-btn, .social-link, .cert-item').forEach(element => {
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Enhanced focus management
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
}

/* ===== LOADING ANIMATION ===== */
/**
 * Smooth page loading transition
 * Creates professional entrance effect
 */
function initializePageLoading() {
    document.body.style.opacity = '0';
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease-in-out';
            document.body.style.opacity = '1';
        }, 100);
    });
}

/* ===== ERROR HANDLING ===== */
/**
 * Global error handling for better user experience
 * Provides graceful degradation when features fail
 */
function initializeErrorHandling() {
    window.addEventListener('error', function(e) {
        console.error('Application error:', e.error);
        // Optionally show user-friendly error message
        showNotification('Something went wrong. Please refresh the page.', 'error');
    });
    
    // Handle uncaught promise rejections
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        e.preventDefault(); // Prevent the default handling
    });
}

/* ===== MAIN INITIALIZATION FUNCTION ===== */
/**
 * Initialize all website functionality
 * Called when the DOM is fully loaded
 */
function initializeWebsite() {
    try {
        // Core functionality
        initializeSmoothScrolling();
        initializeScrollAnimations();
        initializeNavbarEffects();
        initializeMobileMenu();
        initializeHoverEffects();
        initializeStaggeredAnimations();
        
        // Enhanced features
        initializeImageHandling();
        initializeScrollProgress();
        initializeAccessibility();
        initializeErrorHandling();
        
        // Performance optimizations
        preloadResources();
        
        console.log('✅ Portfolio website initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing website:', error);
        showNotification('Some features may not work properly.', 'error');
    }
}

/* ===== EVENT LISTENERS ===== */
/**
 * Set up all event listeners when DOM is ready
 * Ensures all elements are available before attaching events
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page loading effect
    initializePageLoading();
    
    // Initialize all website functionality
    initializeWebsite();
    
    // Add a small delay for staggered animations to work properly
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 200);
});

/* ===== UTILITY FUNCTIONS ===== */
/**
 * Utility function to debounce function calls
 * Useful for optimizing scroll and resize events
 */
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

/**
 * Utility function to check if element is in viewport
 * Useful for triggering animations and lazy loading
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/* ===== GLOBAL FUNCTIONS ===== */
// Make functions globally available for HTML onclick events
window.downloadResume = downloadResume;
window.showNotification = showNotification;

/* ===== END OF SCRIPT ===== */
console.log('📄 Portfolio JavaScript loaded successfully - Linoy Pappachan Malakkaran');

document.addEventListener('DOMContentLoaded', function () {
  // Set your start date here (e.g., January 2011)
  const startDate = new Date(2012, 2); // Year, Month (0 = January)
  const now = new Date();

  // Calculate months difference
  const months =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth());

  // Convert to years with one decimal
  const years = (months / 12).toFixed(1);

  // Update the description
  document.getElementById('experience-description').textContent =
    `Solution Consultant with ${years}+ years driving enterprise digital transformation across global markets. Expert in cloud-native architecture design using Microsoft Azure with proven track record improving system efficiency by 40% and reducing operational costs by 30%.`;
});