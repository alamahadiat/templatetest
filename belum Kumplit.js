/* =============================================
   OVERKING BLOGGER TEMPLATE JAVASCRIPT
   Modern functionality for dark theme blog
   ============================================= */

// GLOBAL VARIABLES - BISA DIUBAH SESUAI KEBUTUHAN
const CONFIG = {
    // PAGINATION SETTINGS
    postsPerPage: 6,
    loadMoreDelay: 1000,
    
    // ANIMATION SETTINGS
    animationDuration: 300,
    scrollOffset: 100,
    
    // SEARCH SETTINGS
    searchDelay: 500,
    minSearchLength: 2,
    
    // TRENDING SLIDER SETTINGS
    autoSlideInterval: 5000,
    slideDuration: 500,
    
    // SOCIAL MEDIA LINKS - GANTI DENGAN LINK SEBENARNYA
    socialLinks: {
        facebook: 'https://facebook.com/overking',
        twitter: 'https://twitter.com/overking'
    }
};

// UTILITY FUNCTIONS
const Utils = {
    // DEBOUNCE FUNCTION UNTUK SEARCH
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // THROTTLE FUNCTION UNTUK SCROLL EVENTS
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // SMOOTH SCROLL FUNCTION
    smoothScroll: function(target, duration = 800) {
        const targetElement = document.querySelector(target);
        if (!targetElement) return;
        
        const targetPosition = targetElement.offsetTop - CONFIG.scrollOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        // EASING FUNCTION
        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
    },
    
    // FORMAT DATE FUNCTION
    formatDate: function(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('id-ID', options);
    },
    
    // TRUNCATE TEXT FUNCTION
    truncateText: function(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    },
    
    // SHOW LOADING ANIMATION
    showLoading: function(element) {
        element.classList.add('loading');
    },
    
    // HIDE LOADING ANIMATION
    hideLoading: function(element) {
        element.classList.remove('loading');
    }
};

// MAIN APPLICATION CLASS
class OverKingApp {
    constructor() {
        this.currentPage = 1;
        this.isLoading = false;
        this.trendingSliderIndex = 0;
        this.trendingSliderInterval = null;
        
        this.init();
    }
    
    // INITIALIZE APPLICATION
    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.setupSocialLinks();
        this.handlePageLoad();
    }
    
    // SETUP EVENT LISTENERS
    setupEventListeners() {
        // WINDOW EVENTS
        window.addEventListener('load', () => this.handlePageLoad());
        window.addEventListener('scroll', Utils.throttle(() => this.handleScroll(), 100));
        window.addEventListener('resize', Utils.throttle(() => this.handleResize(), 250));
        
        // SEARCH FUNCTIONALITY
        const searchForm = document.querySelector('.search-form');
        const searchInput = document.querySelector('.search-input');
        
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => this.handleSearch(e));
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', 
                Utils.debounce((e) => this.handleSearchInput(e), CONFIG.searchDelay)
            );
        }
        
        // LOAD MORE BUTTON
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMorePosts());
        }
        
        // TRENDING SLIDER ARROWS
        const prevArrow = document.querySelector('.nav-arrow.prev');
        const nextArrow = document.querySelector('.nav-arrow.next');
        
        if (prevArrow) {
            prevArrow.addEventListener('click', () => this.slideTrending('prev'));
        }
        
        if (nextArrow) {
            nextArrow.addEventListener('click', () => this.slideTrending('next'));
        }
        
        // CATEGORY FILTER
        const categoryTags = document.querySelectorAll('.category-tag');
        categoryTags.forEach(tag => {
            tag.addEventListener('click', (e) => this.handleCategoryFilter(e));
        });
        
        // SOCIAL MEDIA LINKS
        const socialLinks = document.querySelectorAll('.social-link, .social-btn');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleSocialClick(e));
        });
    }
    
    // INITIALIZE COMPONENTS
    initializeComponents() {
        this.initTrendingSlider();
        this.initAnimations();
        this.initLazyLoading();
        this.highlightActiveNavigation();
    }
    
    // TRENDING SLIDER INITIALIZATION
    initTrendingSlider() {
        const trendingPosts = document.querySelectorAll('.trending-post