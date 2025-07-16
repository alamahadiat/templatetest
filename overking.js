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
        const trendingContainer = document.querySelector('.trending-posts');
        const posts = document.querySelectorAll('.trending-post');
        if (!trendingContainer || posts.length === 0) return;

        // Set width agar bisa geser
        trendingContainer.style.display = 'flex';
        trendingContainer.style.transition = `transform ${CONFIG.slideDuration}ms ease`;

        this.trendingSliderIndex = 0;

        this.trendingSliderInterval = setInterval(() => {
            this.slideTrending('next');
        }, CONFIG.autoSlideInterval); // // 🔄 auto geser // IMPORTANT
    }

    // SLIDE TRENDING POSTS
    slideTrending(direction) {
        const posts = document.querySelectorAll('.trending-post');
        const container = document.querySelector('.trending-posts');
        if (!container || posts.length === 0) return;

        if (direction === 'next') {
            this.trendingSliderIndex = (this.trendingSliderIndex + 1) % posts.length;
        } else if (direction === 'prev') {
            this.trendingSliderIndex = (this.trendingSliderIndex - 1 + posts.length) % posts.length;
        }

        const offset = -this.trendingSliderIndex * 100;
        container.style.transform = `translateX(${offset}%)`; // // Geser konten // IMPORTANT
    }

    // LOAD MORE POSTS
    async loadMorePosts() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (this.isLoading || !loadMoreBtn) return;

        this.isLoading = true;
        Utils.showLoading(loadMoreBtn); // // Tampilkan animasi loading // IMPORTANT

        try {
            const startIndex = this.currentPage * CONFIG.postsPerPage + 1;
            const url = `/feeds/posts/summary?alt=json&start-index=${startIndex}&max-results=${CONFIG.postsPerPage}`;
            const res = await fetch(url);
            const data = await res.json();
            const entries = data.feed.entry || [];

            if (entries.length > 0) {
                this.renderPosts(entries); // Panggil fungsi untuk render post // IMPORTANT
                this.currentPage++;
            } else {
                loadMoreBtn.style.display = 'none';
            }
        } catch (err) {
            console.error('Error loadMorePosts:', err);
        }

        Utils.hideLoading(loadMoreBtn);
        this.isLoading = false;
    }

    // RENDER POSTS KE .posts-grid
    renderPosts(entries) {
        const container = document.querySelector('.posts-grid');
        if (!container || !entries) return;

        entries.forEach(entry => {
            const title = entry.title?.$t || '';
            const link = entry.link.find(l => l.rel === 'alternate')?.href || '#';
            const date = Utils.formatDate(entry.published?.$t);
            const author = entry.author?.[0]?.name?.$t || 'Unknown';
            const content = entry.content?.$t || '';
            const summary = Utils.truncateText(content.replace(/<[^>]*>?/gm, ''), 120);

            const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
            const thumbnail = imgMatch ? imgMatch[1] : 'https://via.placeholder.com/300x200';

            const html = `
                <article class='post-card fade-in'>
                    <div class='post-image'>
                        <img src='${thumbnail}' alt='${title}' />
                    </div>
                    <div class='post-content'>
                        <h3 class='post-title'><a href='${link}'>${title}</a></h3>
                        <p class='post-excerpt'>${summary}</p>
                        <div class='post-meta'>
                            <span class='post-date'>${date}</span>
                            <span class='post-author'>By ${author}</span>
                        </div>
                    </div>
                </article>
            `;

            container.insertAdjacentHTML('beforeend', html);
        });
    }

    // SEARCH FUNCTIONALITY
    handleSearch(e) {
        e.preventDefault();
        const input = document.querySelector('.search-input');
        if (!input) return;

        const keyword = input.value.trim();
        if (keyword.length >= CONFIG.minSearchLength) {
            window.location.href = `/search?q=${encodeURIComponent(keyword)}`;
        }
    }

    handleSearchInput(e) {
        const keyword = e.target.value.trim();
        if (keyword.length >= CONFIG.minSearchLength) {
            // Implementasi opsional pencarian instan (fetch & render langsung)
        }
    }

    // SCROLL, RESIZE, PAGE LOAD HANDLER
    handleScroll() {
        // Bisa tambahkan efek sticky, back-to-top, dsb
    }

    handleResize() {
        // Recalculate jika slider lebar berubah
    }

    handlePageLoad() {
        // Tambah kelas loaded ke body untuk transisi animasi awal
        document.body.classList.add('loaded');
    }

    // ANIMASI FADE-IN
    initAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible'); // // Animasi fade-in // IMPORTANT
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    }

    // LAZY LOAD IMAGE (Optional)
    initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    io.unobserve(img);
                }
            });
        });

        images.forEach(img => io.observe(img));
    }

    // NAVIGASI AKTIF
    highlightActiveNavigation() {
        const links = document.querySelectorAll('.nav-link');
        const current = location.pathname;

        links.forEach(link => {
            if (link.getAttribute('href') === current) {
                link.classList.add('active'); // // Tambahkan class active pada menu aktif
            }
        });
    }

    // SOSIAL MEDIA
    setupSocialLinks() {
        document.querySelectorAll('.social-link.facebook').forEach(link => {
            link.href = CONFIG.socialLinks.facebook;
        });
        document.querySelectorAll('.social-link.twitter').forEach(link => {
            link.href = CONFIG.socialLinks.twitter;
        });
    }

    handleSocialClick(e) {
        const link = e.currentTarget;
        const url = link.href;
        window.open(url, '_blank');
    }

    handleCategoryFilter(e) {
        const label = e.target.textContent.trim();
        window.location.href = `/search/label/${encodeURIComponent(label)}`;
    }
}

// INISIALISASI SAAT DOKUMEN READY
document.addEventListener('DOMContentLoaded', () => {
    const app = new OverKingApp();
});