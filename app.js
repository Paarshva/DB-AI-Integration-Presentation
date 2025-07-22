// X Bank AI Presentation - Slide Navigation
class PresentationController {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = document.querySelectorAll('.slide').length;
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.slideCounter = document.getElementById('slideCounter');
        
        this.init();
    }
    
    init() {
        // Initialise event listeners
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Initialise display
        this.updateDisplay();
        
        // Add touch/swipe support for mobile
        this.initTouchEvents();
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.currentSlide++;
            this.updateDisplay();
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateDisplay();
        }
    }
    
    goToSlide(slideIndex) {
        if (slideIndex >= 0 && slideIndex < this.totalSlides) {
            this.currentSlide = slideIndex;
            this.updateDisplay();
        }
    }
    
    updateDisplay() {
        // Hide all slides
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if (index === this.currentSlide) {
                slide.classList.add('active');
            }
        });
        
        // Update counter
        this.slideCounter.textContent = `${this.currentSlide + 1} / ${this.totalSlides}`;
        
        // Update button states
        this.prevBtn.disabled = this.currentSlide === 0;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
        
        // Add visual feedback for button states
        if (this.currentSlide === 0) {
            this.prevBtn.style.opacity = '0.5';
        } else {
            this.prevBtn.style.opacity = '1';
        }
        
        if (this.currentSlide === this.totalSlides - 1) {
            this.nextBtn.style.opacity = '0.5';
        } else {
            this.nextBtn.style.opacity = '1';
        }
        
        // Announce slide change for accessibility
        this.announceSlideChange();
    }
    
    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowRight':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                this.nextSlide();
                break;
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                this.previousSlide();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides - 1);
                break;
            case 'Escape':
                // Could add fullscreen toggle or presentation mode
                break;
        }
    }
    
    initTouchEvents() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        const presentationContainer = document.querySelector('.presentation-container');
        
        presentationContainer.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
            startY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        presentationContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].screenX;
            endY = e.changedTouches[0].screenY;
            this.handleSwipe();
        }, { passive: true });
        
        const handleSwipe = () => {
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 50;
            
            // Only process horizontal swipes
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    // Swipe right - go to previous slide
                    this.previousSlide();
                } else {
                    // Swipe left - go to next slide
                    this.nextSlide();
                }
            }
        };
        
        this.handleSwipe = handleSwipe;
    }
    
    announceSlideChange() {
        // Create or update screen reader announcement
        let announcement = document.getElementById('slide-announcement');
        if (!announcement) {
            announcement = document.createElement('div');
            announcement.id = 'slide-announcement';
            announcement.className = 'sr-only';
            announcement.setAttribute('aria-live', 'polite');
            document.body.appendChild(announcement);
        }
        
        const currentSlideElement = this.slides[this.currentSlide];
        const slideTitle = currentSlideElement.querySelector('h1, h2')?.textContent || `Slide ${this.currentSlide + 1}`;
        announcement.textContent = `${slideTitle}. Slide ${this.currentSlide + 1} of ${this.totalSlides}`;
    }
    
    // Method to add slide progress indicators (optional enhancement)
    addProgressIndicators() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'slide-progress';
        progressContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            z-index: 1000;
        `;
        
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'progress-dot';
            dot.style.cssText = `
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: none;
                background: rgba(10, 77, 140, 0.3);
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            dot.addEventListener('click', () => this.goToSlide(i));
            progressContainer.appendChild(dot);
        }
        
        document.body.appendChild(progressContainer);
        this.progressDots = progressContainer.querySelectorAll('.progress-dot');
        
        // Update progress dots in updateDisplay method
        const originalUpdateDisplay = this.updateDisplay.bind(this);
        this.updateDisplay = () => {
            originalUpdateDisplay();
            if (this.progressDots) {
                this.progressDots.forEach((dot, index) => {
                    if (index === this.currentSlide) {
                        dot.style.background = '#0a4d8c';
                    } else {
                        dot.style.background = 'rgba(10, 77, 140, 0.3)';
                    }
                });
            }
        };
    }
    
    // Method to enable presentation mode (fullscreen)
    enterPresentationMode() {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
        
        // Hide cursor after inactivity in presentation mode
        let mouseTimer;
        document.addEventListener('mousemove', () => {
            document.body.style.cursor = 'default';
            clearTimeout(mouseTimer);
            mouseTimer = setTimeout(() => {
                document.body.style.cursor = 'none';
            }, 3000);
        });
    }
    
    // Method to export slides as PDF-friendly format
    preparePrintVersion() {
        // Add print-specific styles
        const printStyles = document.createElement('style');
        printStyles.textContent = `
            @media print {
                .slide-nav { display: none !important; }
                .slide { 
                    display: block !important; 
                    page-break-after: always;
                    min-height: auto;
                }
                .slide:last-child { page-break-after: avoid; }
            }
        `;
        document.head.appendChild(printStyles);
        
        // Trigger print dialog
        window.print();
    }
}

// Utility functions for enhanced presentation features
class PresentationUtils {
    static getSlideNotes(slideIndex) {
        // Could return presenter notes for each slide
        const notes = {
            0: "Welcome everyone. I'm excited to share insights on AI integration for our Coverage team.",
            1: "The data shows AI adoption is accelerating across investment banking. The Bank has strong foundations to build on.",
            2: "Here's how AI can enhance our existing workflow without replacing human judgment and relationships.",
            3: "These time savings translate directly to revenue opportunities and competitive advantages.",
            4: "Real examples from peer institutions show the practical benefits we can achieve.",
            5: "Conservative estimates show significant ROI potential with manageable implementation costs.",
            6: "Proposed phased approach allows us to learn and scale systematically.",
            7: "Thank you for your time. I'd welcome your feedback and insights on these proposals."
        };
        return notes[slideIndex] || "";
    }
    
    static trackPresentationAnalytics(slideIndex, timeSpent) {
        // Could track how long is spent on each slide for optimization
        console.log(`Slide ${slideIndex}: ${timeSpent}ms`);
    }
    
    static validateSlideContent() {
        // Check for common presentation issues
        const slides = document.querySelectorAll('.slide');
        const issues = [];
        
        slides.forEach((slide, index) => {
            const textContent = slide.textContent;
            if (textContent.length > 1500) {
                issues.push(`Slide ${index + 1}: Might have too much text`);
            }
            
            const images = slide.querySelectorAll('img');
            images.forEach(img => {
                if (!img.alt) {
                    issues.push(`Slide ${index + 1}: Missing alt text for image`);
                }
            });
        });
        
        return issues;
    }
}

// Initialise presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const presentation = new PresentationController();
    
    // Add optional progress indicators
    // presentation.addProgressIndicators();
    
    // Add keyboard shortcuts info (could be displayed in a help modal)
    const shortcuts = {
        'Arrow Keys': 'Navigate slides',
        'Space/Page Down': 'Next slide',
        'Page Up': 'Previous slide',
        'Home': 'First slide',
        'End': 'Last slide',
        'Escape': 'Exit fullscreen'
    };
    
    // Store reference globally for debugging or external control
    window.presentation = presentation;
    window.presentationUtils = PresentationUtils;
    
    // Log presentation readiness
    console.log('X Bank AI Presentation loaded successfully');
    console.log(`Total slides: ${presentation.totalSlides}`);
    
    // Validate content
    const contentIssues = PresentationUtils.validateSlideContent();
    if (contentIssues.length > 0) {
        console.warn('Content validation issues:', contentIssues);
    }
});

// Handle window resize to ensure proper display
window.addEventListener('resize', () => {
    // Force redraw of current slide if needed
    const activeSlide = document.querySelector('.slide.active');
    if (activeSlide) {
        // Trigger any responsive adjustments
        activeSlide.style.display = 'none';
        activeSlide.offsetHeight; // Force reflow
        activeSlide.style.display = 'block';
    }
});

// Add error handling for presentation
window.addEventListener('error', (e) => {
    console.error('Presentation error:', e.error);
    // Could implement fallback or error reporting
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PresentationController, PresentationUtils };
}
