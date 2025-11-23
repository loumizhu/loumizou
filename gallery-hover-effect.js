/**
 * Gallery Image Hover Effect
 * Animated swipe overlay with image name reveal
 */

// ============================================
// ANIMATION PARAMETERS - Adjust these values
// ============================================
const HOVER_CONFIG = {
    // Swipe line animation
    swipeDuration: 300,        // Duration of swipe animation in milliseconds
    swipeDelay: 150,           // Delay before second line starts (milliseconds)
    swipeEasing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Ease in-out curve
    swipeHeight: '4px',        // Height of swipe lines
    swipeLineOpacity: 0.5,     // Opacity of white swipe lines (0-1)
    
    // Blue gradient box
    gradientBoxHeight: '200px', // Height of blue gradient box
    gradientBoxFadeDuration: 800, // Duration of gradient fade out (milliseconds)
    gradientBoxColor: 'rgba(53, 158, 255, 0.4)', // Blue gradient color (rgba)
    gradientBoxFadeDelay: 100, // Delay before gradient starts fading (milliseconds)
    
    // Image name reveal
    nameRevealDuration: 400,   // Duration of text slide animation (milliseconds)
    nameRevealDelay: 200,     // Delay before text starts animating (milliseconds)
    nameBackgroundOpacity: 0.85, // Background opacity for name (0-1)
    namePadding: '8px 16px',   // Padding for name container
    nameFontSize: '14px',      // Font size for name
    nameColor: '#ffffff',      // Text color
    nameBackgroundColor: 'rgba(79, 136, 243, 0.51)', // Fallback background color
    namePulsateDuration: 2000, // Duration of pulsate animation cycle (milliseconds)
    namePulsateIntensity: 0.15, // Pulsate intensity (0-1, how much opacity changes)
    
    // Right-to-left swipe line (vertical line)
    swipeLineRtlDuration: 500, // Duration of right-to-left line animation (milliseconds)
    swipeLineRtlDelay: 0,   // Delay before right-to-left line starts (same as top-to-bottom lines)
    swipeLineRtlWidth: '2px', // Width of vertical right-to-left swipe line
    swipeLineRtlColor: 'rgba(255, 255, 255, 0.3)', // Color of right-to-left swipe line
    
    // Color extraction
    colorSampleSize: 5,        // Size of area to sample color from (pixels)
    colorSamplePosition: {    // Position to sample color (top-left area)
        x: 0.1,                // 10% from left
        y: 0.1                 // 10% from top
    },
    
    // Image zoom effect
    zoomScale: 1.08,           // Zoom scale factor (1.08 = 8% zoom)
    zoomDuration: 400,         // Duration of zoom animation (milliseconds)
    zoomEasing: 'cubic-bezier(0.4, 0, 1, 1)' // Ease-in curve
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
        
        // Ensure overlay and its contents stay below menu (menu z-index: 999-1030)
        // The overlay should not create a new stacking context that goes above menu
        
        // Create first swipe line (white, half transparent)
        const swipeLine1 = document.createElement('div');
        swipeLine1.className = 'gallery-swipe-line gallery-swipe-line-1';
        swipeLine1.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: ${HOVER_CONFIG.swipeHeight};
            background: rgba(255, 255, 255, ${HOVER_CONFIG.swipeLineOpacity});
            transform: translateY(-100%);
            transition: transform ${HOVER_CONFIG.swipeDuration}ms ${HOVER_CONFIG.swipeEasing};
            z-index: 3;
        `;
        
        // Create second swipe line (white, half transparent)
        const swipeLine2 = document.createElement('div');
        swipeLine2.className = 'gallery-swipe-line gallery-swipe-line-2';
        swipeLine2.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: ${HOVER_CONFIG.swipeHeight};
            background: rgba(255, 255, 255, ${HOVER_CONFIG.swipeLineOpacity});
            transform: translateY(-100%);
            transition: transform ${HOVER_CONFIG.swipeDuration}ms ${HOVER_CONFIG.swipeEasing};
            transition-delay: ${HOVER_CONFIG.swipeDelay}ms;
            z-index: 3;
        `;
        
        // Create blue gradient box that follows the lines
        const gradientBox = document.createElement('div');
        gradientBox.className = 'gallery-gradient-box';
        gradientBox.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: ${HOVER_CONFIG.gradientBoxHeight};
            background: linear-gradient(to bottom, 
                ${HOVER_CONFIG.gradientBoxColor} 0%,
                ${HOVER_CONFIG.gradientBoxColor.replace(/[\d.]+\)$/, '0)')} 100%
            );
            transform: translateY(-100%);
            transition: transform ${HOVER_CONFIG.swipeDuration}ms ${HOVER_CONFIG.swipeEasing};
            opacity: 0;
            z-index: 2;
            pointer-events: none;
        `;
        
        // Create name container (width fits content)
        const nameContainer = document.createElement('div');
        nameContainer.className = 'gallery-hover-name';
        nameContainer.textContent = imageName;
        nameContainer.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: fit-content;
            max-width: 100%;
            padding: ${HOVER_CONFIG.namePadding};
            background: transparent;
            color: ${HOVER_CONFIG.nameColor};
            font-size: ${HOVER_CONFIG.nameFontSize};
            font-weight: 500;
            transform: translateX(-100%);
            transition: transform ${HOVER_CONFIG.nameRevealDuration}ms ${HOVER_CONFIG.swipeEasing};
            transition-delay: ${HOVER_CONFIG.nameRevealDelay}ms;
            white-space: nowrap;
            overflow: visible;
            text-overflow: ellipsis;
            z-index: 4;
        `;
        
        // Create pulsate background element
        const nameBackground = document.createElement('div');
        nameBackground.className = 'gallery-hover-name-bg';
        nameBackground.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: ${toRgba(imageColor, HOVER_CONFIG.nameBackgroundOpacity)};
            border-radius: 6px;
            z-index: -1;
            animation: pulsate ${HOVER_CONFIG.namePulsateDuration}ms ease-in-out infinite;
        `;
        
        // Add pulsate keyframes if not already added
        if (!document.getElementById('gallery-hover-keyframes')) {
            const style = document.createElement('style');
            style.id = 'gallery-hover-keyframes';
            style.textContent = `
                @keyframes pulsate {
                    0%, 100% {
                        opacity: ${HOVER_CONFIG.nameBackgroundOpacity};
                    }
                    50% {
                        opacity: ${HOVER_CONFIG.nameBackgroundOpacity * (1 - HOVER_CONFIG.namePulsateIntensity)};
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add background element to name container
        nameContainer.appendChild(nameBackground);
        
        // Create right-to-left swipe line container (vertical line)
        const rtlLineContainer = document.createElement('div');
        rtlLineContainer.className = 'gallery-rtl-line-container';
        rtlLineContainer.style.cssText = `
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            width: ${HOVER_CONFIG.swipeLineRtlWidth};
            height: 100%;
            background: ${HOVER_CONFIG.swipeLineRtlColor};
            transform: translateX(100%);
            transition: transform ${HOVER_CONFIG.swipeLineRtlDuration}ms ${HOVER_CONFIG.swipeEasing};
            transition-delay: ${HOVER_CONFIG.swipeLineRtlDelay}ms;
            z-index: 3;
        `;
        
        overlay.appendChild(gradientBox);
        overlay.appendChild(swipeLine1);
        overlay.appendChild(swipeLine2);
        overlay.appendChild(rtlLineContainer);
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
        
        // Get the image element and setup zoom effect
        const img = item.querySelector('img');
        if (img) {
            // Make sure the image container can handle overflow
            const imgParent = img.parentElement;
            if (imgParent && imgParent !== item) {
                imgParent.style.overflow = 'hidden';
            }
            item.style.overflow = 'hidden';
            
            // Ensure gallery items stay below the menu bar (menu z-index is typically 999-1030)
            // Set a lower z-index so zoomed images don't appear above the menu
            item.style.position = 'relative';
            item.style.zIndex = '1';
            
            // Store original transform if it exists
            const computedStyle = window.getComputedStyle(img);
            const originalTransform = computedStyle.transform;
            const hasOriginalTransform = originalTransform && originalTransform !== 'none' && originalTransform !== 'matrix(1, 0, 0, 1, 0, 0)';
            
            // Add transition to image for smooth zoom
            img.style.transition = `transform ${HOVER_CONFIG.zoomDuration}ms ${HOVER_CONFIG.zoomEasing}`;
            img.style.transformOrigin = 'center center';
            img.style.willChange = 'transform'; // Optimize for transform animations
            
            // Store original transform for later use
            if (hasOriginalTransform) {
                img.dataset.originalTransform = originalTransform;
            } else {
                img.dataset.originalTransform = 'none';
            }
            
            // Ensure the image can be transformed (override any conflicting styles)
            img.style.transform = originalTransform || 'none';
        }
        
        // Handle hover
        item.addEventListener('mouseenter', function() {
            const swipeLine1 = overlay.querySelector('.gallery-swipe-line-1');
            const swipeLine2 = overlay.querySelector('.gallery-swipe-line-2');
            const gradientBox = overlay.querySelector('.gallery-gradient-box');
            const nameContainer = overlay.querySelector('.gallery-hover-name');
            const rtlLineContainer = overlay.querySelector('.gallery-rtl-line-container');
            const img = item.querySelector('img');
            
            // Animate swipe lines and gradient box from top to bottom
            requestAnimationFrame(() => {
                const itemHeight = item.offsetHeight;
                
                // Zoom in the image
                if (img) {
                    const originalTransform = img.dataset.originalTransform || 'none';
                    // Always apply zoom, combining with existing transform if present
                    // Use !important to ensure it overrides any conflicting CSS
                    if (originalTransform !== 'none') {
                        // Combine transforms: apply scale, then original transform
                        // This ensures the scale is applied relative to the image center
                        img.style.setProperty('transform', `scale(${HOVER_CONFIG.zoomScale}) ${originalTransform}`, 'important');
                    } else {
                        img.style.setProperty('transform', `scale(${HOVER_CONFIG.zoomScale})`, 'important');
                    }
                }
                
                // Animate gradient box first (it follows the lines)
                gradientBox.style.opacity = '1';
                gradientBox.style.transition = `transform ${HOVER_CONFIG.swipeDuration}ms ${HOVER_CONFIG.swipeEasing}, opacity ${HOVER_CONFIG.gradientBoxFadeDuration}ms ease-out ${HOVER_CONFIG.gradientBoxFadeDelay}ms`;
                gradientBox.style.transform = `translateY(${itemHeight}px)`;
                
                // Start fading gradient box as it moves
                setTimeout(() => {
                    gradientBox.style.opacity = '0';
                }, HOVER_CONFIG.gradientBoxFadeDelay);
                
                // Animate swipe lines
                swipeLine1.style.transform = `translateY(${itemHeight}px)`;
                swipeLine2.style.transform = `translateY(${itemHeight}px)`;
                
                // Animate name container
                nameContainer.style.transform = 'translateX(0)';
                
                // Animate right-to-left vertical line at the same time as top-to-bottom lines
                requestAnimationFrame(() => {
                    // Wait a bit for name to be visible, then calculate position
                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            // Get the name container position
                            const nameRect = nameContainer.getBoundingClientRect();
                            const itemRect = item.getBoundingClientRect();
                            const nameLeft = nameRect.left - itemRect.left;
                            const itemWidth = itemRect.width;
                            
                            // Calculate distance from right edge to name start
                            const distanceToName = itemWidth - nameLeft;
                            
                            // Animate vertical line from right to left, stopping at name start
                            rtlLineContainer.style.transform = `translateX(-${distanceToName}px)`;
                        });
                    }, HOVER_CONFIG.nameRevealDelay + 50); // Small delay to ensure name is positioned
                });
            });
        });
        
        item.addEventListener('mouseleave', function() {
            const swipeLine1 = overlay.querySelector('.gallery-swipe-line-1');
            const swipeLine2 = overlay.querySelector('.gallery-swipe-line-2');
            const gradientBox = overlay.querySelector('.gallery-gradient-box');
            const nameContainer = overlay.querySelector('.gallery-hover-name');
            const rtlLineContainer = overlay.querySelector('.gallery-rtl-line-container');
            const img = item.querySelector('img');
            
            // Reset zoom on image
            if (img) {
                const originalTransform = img.dataset.originalTransform || 'none';
                if (originalTransform !== 'none') {
                    img.style.setProperty('transform', originalTransform, 'important');
                } else {
                    img.style.removeProperty('transform');
                }
            }
            
            // Reset animations
            swipeLine1.style.transform = 'translateY(-100%)';
            swipeLine2.style.transform = 'translateY(-100%)';
            swipeLine2.style.transitionDelay = '0ms';
            gradientBox.style.transform = 'translateY(-100%)';
            gradientBox.style.opacity = '0';
            gradientBox.style.transition = `transform ${HOVER_CONFIG.swipeDuration}ms ${HOVER_CONFIG.swipeEasing}, opacity 0ms`;
            nameContainer.style.transform = 'translateX(-100%)';
            rtlLineContainer.style.transform = 'translateX(100%)';
            rtlLineContainer.style.transitionDelay = '0ms';
            
            // Reset delay for next hover
            setTimeout(() => {
                swipeLine2.style.transitionDelay = `${HOVER_CONFIG.swipeDelay}ms`;
                gradientBox.style.transition = `transform ${HOVER_CONFIG.swipeDuration}ms ${HOVER_CONFIG.swipeEasing}, opacity ${HOVER_CONFIG.gradientBoxFadeDuration}ms ease-out ${HOVER_CONFIG.gradientBoxFadeDelay}ms`;
                rtlLineContainer.style.transitionDelay = `${HOVER_CONFIG.swipeLineRtlDelay}ms`;
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

