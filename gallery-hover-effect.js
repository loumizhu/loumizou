/**
 * Gallery Image Hover Effect
 * Animated swipe overlay with image name reveal
 */

// ============================================
// ANIMATION PARAMETERS - Adjust these values
// ============================================
const HOVER_CONFIG = {
    // Swipe line animation
    swipeDuration: 600,        // Duration of swipe animation in milliseconds
    swipeDelay: 150,           // Delay before second line starts (milliseconds)
    swipeEasing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Ease in-out curve
    swipeHeight: '4px',        // Height of swipe lines
    swipeGradientOpacity: 0.6, // Opacity of gradient overlay (0-1)
    
    // Image name reveal
    nameRevealDuration: 400,   // Duration of text slide animation (milliseconds)
    nameRevealDelay: 200,     // Delay before text starts animating (milliseconds)
    nameBackgroundOpacity: 0.85, // Background opacity for name (0-1)
    namePadding: '8px 16px',   // Padding for name container
    nameFontSize: '14px',      // Font size for name
    nameColor: '#ffffff',      // Text color
    nameBackgroundColor: 'rgba(0, 0, 0, 0.85)', // Fallback background color
    
    // Color extraction
    colorSampleSize: 5,        // Size of area to sample color from (pixels)
    colorSamplePosition: {    // Position to sample color (top-left area)
        x: 0.1,                // 10% from left
        y: 0.1                 // 10% from top
    }
};

(function() {
    'use strict';
    
    /**
     * Convert RGB/RGBA color to RGBA with specified opacity
     */
    function toRgba(color, opacity) {
        if (color.includes('rgba')) {
            return color.replace(/[\d.]+\)$/, `${opacity})`);
        } else if (color.includes('rgb')) {
            return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
        }
        // Fallback for hex or named colors
        return `rgba(0, 0, 0, ${opacity})`;
    }
    
    /**
     * Extract filename from image path
     */
    function getImageName(imageSrc) {
        const filename = imageSrc.split('/').pop();
        // Remove numbered prefix (e.g., "01_", "02_", etc.)
        const nameWithoutPrefix = filename.replace(/^\d+_/, '');
        // Remove file extension
        const nameWithoutExt = nameWithoutPrefix.replace(/\.[^/.]+$/, '');
        // Replace underscores and hyphens with spaces, capitalize words
        return nameWithoutExt
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    /**
     * Get dominant color from image
     */
    function getImageColor(img, callback) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        
        try {
            ctx.drawImage(img, 0, 0);
            
            // Sample color from specified position
            const x = Math.floor(canvas.width * HOVER_CONFIG.colorSamplePosition.x);
            const y = Math.floor(canvas.height * HOVER_CONFIG.colorSamplePosition.y);
            const size = HOVER_CONFIG.colorSampleSize;
            
            const imageData = ctx.getImageData(x, y, size, size);
            const data = imageData.data;
            
            // Calculate average color
            let r = 0, g = 0, b = 0, count = 0;
            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
            }
            
            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);
            
            callback(`rgb(${r}, ${g}, ${b})`);
        } catch (e) {
            // Fallback to default color if extraction fails
            callback(HOVER_CONFIG.nameBackgroundColor);
        }
    }
    
    /**
     * Create hover overlay elements
     */
    function createHoverOverlay(item, imageName, imageColor) {
        // Create container
        const overlay = document.createElement('div');
        overlay.className = 'gallery-hover-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 1;
        `;
        
        // Create first swipe line
        const swipeLine1 = document.createElement('div');
        swipeLine1.className = 'gallery-swipe-line gallery-swipe-line-1';
        swipeLine1.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: ${HOVER_CONFIG.swipeHeight};
            background: linear-gradient(to bottom, 
                rgba(255, 255, 255, 0) 0%,
                ${toRgba(imageColor, HOVER_CONFIG.swipeGradientOpacity)} 50%,
                rgba(255, 255, 255, 0) 100%
            );
            transform: translateY(-100%);
            transition: transform ${HOVER_CONFIG.swipeDuration}ms ${HOVER_CONFIG.swipeEasing};
        `;
        
        // Create second swipe line
        const swipeLine2 = document.createElement('div');
        swipeLine2.className = 'gallery-swipe-line gallery-swipe-line-2';
        swipeLine2.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: ${HOVER_CONFIG.swipeHeight};
            background: linear-gradient(to bottom, 
                rgba(255, 255, 255, 0) 0%,
                ${toRgba(imageColor, HOVER_CONFIG.swipeGradientOpacity * 0.7)} 50%,
                rgba(255, 255, 255, 0) 100%
            );
            transform: translateY(-100%);
            transition: transform ${HOVER_CONFIG.swipeDuration}ms ${HOVER_CONFIG.swipeEasing};
            transition-delay: ${HOVER_CONFIG.swipeDelay}ms;
        `;
        
        // Create name container
        const nameContainer = document.createElement('div');
        nameContainer.className = 'gallery-hover-name';
        nameContainer.textContent = imageName;
        nameContainer.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: ${HOVER_CONFIG.namePadding};
            background: ${toRgba(imageColor, HOVER_CONFIG.nameBackgroundOpacity)};
            color: ${HOVER_CONFIG.nameColor};
            font-size: ${HOVER_CONFIG.nameFontSize};
            font-weight: 500;
            transform: translateX(-100%);
            transition: transform ${HOVER_CONFIG.nameRevealDuration}ms ${HOVER_CONFIG.swipeEasing};
            transition-delay: ${HOVER_CONFIG.nameRevealDelay}ms;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        
        overlay.appendChild(swipeLine1);
        overlay.appendChild(swipeLine2);
        overlay.appendChild(nameContainer);
        
        return overlay;
    }
    
    /**
     * Initialize hover effects for gallery items
     */
    function initHoverEffects() {
        const galleryItems = document.querySelectorAll('.vce-image-masonry-gallery-item');
        
        galleryItems.forEach(item => {
            const img = item.querySelector('img');
            if (!img) return;
            
            // Make item position relative
            item.style.position = 'relative';
            
            // Get image name
            const imageSrc = img.src || img.getAttribute('src');
            const imageName = getImageName(imageSrc);
            
            // Wait for image to load to extract color
            if (img.complete && img.naturalWidth > 0) {
                getImageColor(img, (color) => {
                    setupHoverEffect(item, imageName, color);
                });
            } else {
                img.addEventListener('load', function() {
                    getImageColor(img, (color) => {
                        setupHoverEffect(item, imageName, color);
                    });
                }, { once: true });
            }
        });
    }
    
    /**
     * Setup hover effect for a single item
     */
    function setupHoverEffect(item, imageName, imageColor) {
        const overlay = createHoverOverlay(item, imageName, imageColor);
        item.appendChild(overlay);
        
        // Handle hover
        item.addEventListener('mouseenter', function() {
            const swipeLine1 = overlay.querySelector('.gallery-swipe-line-1');
            const swipeLine2 = overlay.querySelector('.gallery-swipe-line-2');
            const nameContainer = overlay.querySelector('.gallery-hover-name');
            
            // Animate swipe lines from top to bottom
            requestAnimationFrame(() => {
                const itemHeight = item.offsetHeight;
                swipeLine1.style.transform = `translateY(${itemHeight}px)`;
                swipeLine2.style.transform = `translateY(${itemHeight}px)`;
                nameContainer.style.transform = 'translateX(0)';
            });
        });
        
        item.addEventListener('mouseleave', function() {
            const swipeLine1 = overlay.querySelector('.gallery-swipe-line-1');
            const swipeLine2 = overlay.querySelector('.gallery-swipe-line-2');
            const nameContainer = overlay.querySelector('.gallery-hover-name');
            
            // Reset animations
            swipeLine1.style.transform = 'translateY(-100%)';
            swipeLine2.style.transform = 'translateY(-100%)';
            swipeLine2.style.transitionDelay = '0ms';
            nameContainer.style.transform = 'translateX(-100%)';
            
            // Reset delay for next hover
            setTimeout(() => {
                swipeLine2.style.transitionDelay = `${HOVER_CONFIG.swipeDelay}ms`;
            }, 50);
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHoverEffects);
    } else {
        initHoverEffects();
    }
    
    // Re-initialize if new content is loaded (for dynamic galleries)
    const observer = new MutationObserver(function(mutations) {
        let shouldReinit = false;
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && (
                        node.classList.contains('vce-image-masonry-gallery-item') ||
                        node.querySelector('.vce-image-masonry-gallery-item')
                    )) {
                        shouldReinit = true;
                    }
                });
            }
        });
        if (shouldReinit) {
            initHoverEffects();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();

