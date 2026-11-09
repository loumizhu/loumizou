/**
 * Gallery Image Hover Effect
 * Animated swipe overlay with image name reveal
 */

// ============================================
// ANIMATION PARAMETERS - Adjust these values
// ============================================
const HOVER_CONFIG = {
    // Swipe line animation
    swipeDuration: 660,        // Duration of swipe animation in milliseconds (Min: 0, Max: 5000; lower is faster)
    swipeDelay: 30,           // Delay before second line starts in milliseconds (Min: 0, Max: 5000; lower is faster/earlier)
    swipeOutDelay: 300,        // Delay between each swipe when animating out (bottom to top) in ms (Min: 0, Max: 5000; lower is faster)
    swipeEasing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Ease in-out curve
    swipeHeight: '4px',        // Height of swipe lines (e.g., '1px', '10px')
    swipeLineOpacity: 0.5,     // Opacity of white swipe lines (Min: 0.0, Max: 1.0)
    
    // Blue gradient box
    gradientBoxHeight: '200px', // Height of blue gradient box (e.g., '50px', '500px')
    gradientBoxFadeDuration: 800, // Duration of gradient fade out in milliseconds (Min: 0, Max: 5000; lower is faster)
    gradientBoxColor: 'rgba(59, 130, 246, 0.9)', // Blue gradient color (rgba format)
    gradientBoxFadeDelay: 300, // Delay before gradient starts fading in milliseconds (Min: 0, Max: 5000; lower is earlier)
    
    // Image name reveal
    nameRevealDuration: 400,   // Duration of text slide animation in milliseconds (Min: 0, Max: 5000; lower is faster)
    nameRevealDelay: 200,     // Delay before text starts animating in milliseconds (Min: 0, Max: 5000; lower is earlier)
    nameBackgroundOpacity: 0.85, // Background opacity for name (Min: 0.0, Max: 1.0)
    namePadding: '8px 16px',   // Padding for name container
    nameFontSize: '24px',      // Font size for name
    nameColor: '#35c4f0',      // Text color (hex or rgba)
    nameBackgroundColor: 'rgba(107, 110, 108, 0.25)', // Fallback background color
    namePulsateDuration: 2000, // Duration of pulsate animation cycle in milliseconds (Min: 100, Max: 10000; lower is faster)
    namePulsateIntensity: 0.15, // Pulsate intensity, how much opacity changes (Min: 0.0, Max: 1.0)
    
    // Right-to-left swipe line (vertical line)
    swipeLineRtlDuration: 500, // Duration of right-to-left line animation in milliseconds (Min: 0, Max: 5000; lower is faster)
    swipeLineRtlDelay: 0,   // Delay before right-to-left line starts in milliseconds (Min: 0, Max: 5000; lower is earlier)
    swipeLineRtlWidth: '2px', // Width of vertical right-to-left swipe line (e.g., '1px', '5px')
    swipeLineRtlColor: 'rgba(255, 255, 255, 0.3)', // Color of right-to-left swipe line
    
    // Color extraction
    colorSampleSize: 5,        // Size of area to sample color from in pixels (Min: 1, Max: 50)
    colorSamplePosition: {    // Position to sample color (top-left area)
        x: 0.1,                // Percentage from left (Min: 0.0, Max: 1.0, where 0.1 = 10%)
        y: 0.1                 // Percentage from top (Min: 0.0, Max: 1.0, where 0.1 = 10%)
    },
    
    // Image zoom effect
    zoomScale: 1.08,           // Zoom scale factor (Min: 1.0, Max: 2.0; 1.08 = 8% zoom)
    zoomDuration: 600,         // Duration of zoom animation in milliseconds (Min: 0, Max: 5000; lower is faster)
    zoomEasing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth ease-in-out curve
    
    // Pulsating border
    borderPulsateDuration: 1000, // Duration of border pulsate cycle in milliseconds (Min: 100, Max: 10000; lower is faster)
    borderPulsateIntensity: 0.5,  // Border opacity pulsate intensity (Min: 0.0, Max: 1.0)
    borderWidth: '4px',         // Border width (e.g., '1px', '10px')
    borderColor: 'rgba(53, 196, 240, 0.8)', // Border color
    
    // CRT Shader effects (applied to image, not overlays)
    crtScanlineOpacity: 0.12,  // Opacity of scanlines (Min: 0.0, Max: 1.0)
    crtScanlineHeight: '1px',  // Height of each scanline (e.g., '1px', '3px')
    crtScanlineGap: '2px',     // Gap between scanlines (e.g., '1px', '5px')
    crtGlitchIntensity: 3,      // Horizontal glitch displacement in pixels (Min: 0, Max: 50)
    
    // -- Horizontal Glitch Parameters --
    crtGlitchInterval: 3000,      // Time between each glitch check in milliseconds (Min: 16, Max: 2000; lower checks more frequently)
    crtGlitchChance: 1,       // Probability of a glitch occurring at each check (Min: 0.0, Max: 1.0; 0.25 = 25% chance)
    crtGlitchDuration: 100,      // Duration of the horizontal shift itself before resetting in ms (Min: 10, Max: 500; lower resets faster)
    // ------------------------------------
    
    crtChromaticAberration: 5, // Chromatic aberration offset in pixels (Min: 0, Max: 20)
    crtBrightness: 1.1,         // Brightness multiplier (Min: 1.0, Max: 2.0; 1.1 = +10%)
    crtContrast: 1.05,         // Contrast multiplier (Min: 1.0, Max: 2.0; 1.05 = +5%)
    crtSaturation: 1.1,         // Saturation multiplier (Min: 1.0, Max: 2.0; 1.1 = +10%)
    crtWarpBandHeight: '150px',   // Height of warping band (e.g., '50px', '300px')
    crtWarpBandSpeed: 1200,       // Speed of warp band animation in milliseconds (Min: 100, Max: 5000; lower is faster)
    crtWarpBandChance: 0.2,      // Chance of warp band appearing on hover (Min: 0.0, Max: 1.0)
    crtWarpIntensity: 1,        // Intensity of warp distortion in pixels (Min: 0, Max: 50)
    crtWarpBandOpacity: 0.8      // Opacity of the warp band overlay (Min: 0.0, Max: 1.0)
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
     * Start warp band animation (TV startup effect) - loops continuously while hovering
     */
    function startWarpBandAnimation(warpBandOverlay, item) {
        if (!warpBandOverlay) return;
        
        // Random chance to trigger warp band
        if (Math.random() > HOVER_CONFIG.crtWarpBandChance) {
            return;
        }
        
        const itemHeight = item.offsetHeight;
        const warpBandHeightNum = parseFloat(HOVER_CONFIG.crtWarpBandHeight);
        const img = item.querySelector('img');
        
        if (!img) return;
        
        // Store references for cleanup
        let waveInterval = null;
        let isActive = true;
        
        // Function to run one warp band cycle
        function runWarpCycle() {
            if (!isActive) return;
            
            // Reset position first
            warpBandOverlay.style.transition = 'none';
            warpBandOverlay.style.transform = 'translateY(100%)';
            warpBandOverlay.style.opacity = '0';
            
            // Force reflow
            warpBandOverlay.offsetHeight;
            
            // Show and animate warp band from bottom to top
            warpBandOverlay.style.transition = `transform ${HOVER_CONFIG.crtWarpBandSpeed}ms linear, opacity 150ms ease-in`;
            warpBandOverlay.style.opacity = '1';
            requestAnimationFrame(() => {
                if (!isActive) return;
                warpBandOverlay.style.transform = `translateY(-${itemHeight + warpBandHeightNum}px)`;
            });
            
            // Apply warping effect to image during band pass
            const warpAmount = HOVER_CONFIG.crtWarpIntensity;
            const baseTransform = img.dataset.originalTransform || 'none';
            const zoomTransform = baseTransform !== 'none' 
                ? `scale(${HOVER_CONFIG.zoomScale}) ${baseTransform}`
                : `scale(${HOVER_CONFIG.zoomScale})`;
            
            // Animate the wave during the band pass - create a more visible distortion
            let waveFrame = 0;
            const totalFrames = Math.ceil(HOVER_CONFIG.crtWarpBandSpeed / 16); // ~60fps
            waveInterval = setInterval(() => {
                if (!isActive) {
                    clearInterval(waveInterval);
                    return;
                }
                
                waveFrame++;
                const progress = waveFrame / totalFrames;
                if (progress > 1) {
                    clearInterval(waveInterval);
                    // Restore base filters at end of cycle
                    if (img.dataset.glitchInterval) {
                        img.style.setProperty('filter', `
                            brightness(${HOVER_CONFIG.crtBrightness}) 
                            contrast(${HOVER_CONFIG.crtContrast}) 
                            saturate(${HOVER_CONFIG.crtSaturation})
                        `, 'important');
                        img.style.setProperty('transform', zoomTransform, 'important');
                    }
                    // Reset band position and start next cycle
                    warpBandOverlay.style.opacity = '0';
                    warpBandOverlay.style.transform = 'translateY(100%)';
                    
                    // Start next cycle after a short delay
                    if (isActive) {
                        setTimeout(() => {
                            if (isActive) {
                                runWarpCycle();
                            }
                        }, 100); // Small gap between cycles
                    }
                    return;
                }
                
                // Create wave effect that follows the band - more intense distortion
                const waveFrequency = 8; // Number of waves across the band
                const waveAmplitude = warpAmount * (1 - progress * 0.5); // Less fade for more pronounced effect
                const waveAmount = Math.sin(progress * Math.PI * waveFrequency) * waveAmplitude;
                
                // Apply horizontal displacement
                img.style.setProperty('transform', `${zoomTransform} translateX(${waveAmount}px)`, 'important');
                
                // Add chromatic aberration that follows the wave - more pronounced
                const chromaOffset = Math.abs(waveAmount) * 0.5 + HOVER_CONFIG.crtChromaticAberration;
                img.style.setProperty('filter', `
                    brightness(${HOVER_CONFIG.crtBrightness}) 
                    contrast(${HOVER_CONFIG.crtContrast}) 
                    saturate(${HOVER_CONFIG.crtSaturation})
                    drop-shadow(${chromaOffset}px 0 0 rgba(255, 0, 0, 0.6))
                    drop-shadow(-${chromaOffset}px 0 0 rgba(0, 255, 255, 0.6))
                `, 'important');
            }, 16);
        }
        
        // Start the first cycle
        runWarpCycle();
        
        // Store cleanup function as a property (not in dataset, as dataset only stores strings)
        warpBandOverlay.dataset.warpActive = 'true';
        warpBandOverlay._warpCleanup = function() {
            isActive = false;
            if (waveInterval) {
                clearInterval(waveInterval);
                waveInterval = null;
            }
            warpBandOverlay.style.opacity = '0';
            warpBandOverlay.style.transform = 'translateY(100%)';
            warpBandOverlay.style.transition = 'none';
            if (img && img.dataset.glitchInterval) {
                const baseTransform = img.dataset.originalTransform || 'none';
                const zoomTransform = baseTransform !== 'none' 
                    ? `scale(${HOVER_CONFIG.zoomScale}) ${baseTransform}`
                    : `scale(${HOVER_CONFIG.zoomScale})`;
                img.style.setProperty('filter', `
                    brightness(${HOVER_CONFIG.crtBrightness}) 
                    contrast(${HOVER_CONFIG.crtContrast}) 
                    saturate(${HOVER_CONFIG.crtSaturation})
                `, 'important');
                img.style.setProperty('transform', zoomTransform, 'important');
            }
        };
    }
    
    /**
     * Start glitch effect on image
     */
    function startGlitchEffect(img) {
        if (img.dataset.glitchInterval) {
            return; // Already running
        }
        
        const glitchInterval = setInterval(() => {
            // Random glitch - apply subtle horizontal shift and chromatic aberration
            if (Math.random() < HOVER_CONFIG.crtGlitchChance) { 
                const glitchX = (Math.random() - 0.5) * HOVER_CONFIG.crtGlitchIntensity * 2;
                const chromaOffset = HOVER_CONFIG.crtChromaticAberration + Math.abs(glitchX) * 0.3;
                
                // Apply glitch using filter with chromatic aberration
                img.style.setProperty('filter', `
                    brightness(${HOVER_CONFIG.crtBrightness}) 
                    contrast(${HOVER_CONFIG.crtContrast}) 
                    saturate(${HOVER_CONFIG.crtSaturation})
                    drop-shadow(${chromaOffset}px 0 0 rgba(255, 0, 0, 0.25))
                    drop-shadow(-${chromaOffset}px 0 0 rgba(0, 255, 255, 0.25))
                `, 'important');
                
                // Apply subtle horizontal shift using transform (but preserve zoom)
                const baseTransform = img.dataset.originalTransform || 'none';
                const zoomTransform = baseTransform !== 'none' 
                    ? `scale(${HOVER_CONFIG.zoomScale}) ${baseTransform}`
                    : `scale(${HOVER_CONFIG.zoomScale})`;
                img.style.setProperty('transform', `${zoomTransform} translateX(${glitchX}px)`, 'important');
                
                // Reset after short delay
                setTimeout(() => {
                    if (img.dataset.glitchInterval) {
                        // Reset transform to just zoom
                        img.style.setProperty('transform', zoomTransform, 'important');
                        // Reset filter to base CRT filters
                        img.style.setProperty('filter', `
                            brightness(${HOVER_CONFIG.crtBrightness}) 
                            contrast(${HOVER_CONFIG.crtContrast}) 
                            saturate(${HOVER_CONFIG.crtSaturation})
                        `, 'important');
                    }
                }, HOVER_CONFIG.crtGlitchDuration);
            }
        }, HOVER_CONFIG.crtGlitchInterval);
        
        img.dataset.glitchInterval = glitchInterval.toString();
    }
    
    /**
     * Extract filename from image path
     */
    function getImageName(imageSrc) {
        let filename = imageSrc.split('/').pop();
        
        // Decode URI component to turn %20 and others into literal spaces
        try {
            filename = decodeURIComponent(filename);
        } catch (e) {}

        // Remove numbered prefix and any trailing spaces, underscores, or hyphens (e.g., "01_", "02 -", "12 ", etc.)
        const nameWithoutPrefix = filename.replace(/^\d+[\s\-_]*/, '');
        
        // Remove file extension
        const nameWithoutExt = nameWithoutPrefix.replace(/\.[^/.]+$/, '');
        
        // Replace underscores and hyphens with spaces, capitalize words
        return nameWithoutExt
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    /**
     * Calculate luminance (brightness) of a color
     * Returns a value between 0 (darkest) and 1 (brightest)
     */
    function getLuminance(r, g, b) {
        // Using relative luminance formula from WCAG
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }
    
    /**
     * Get darkest color from image palette
     * Samples the entire image to build a color palette, then returns the darkest color
     */
    function getImageColor(img, callback) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        
        try {
            ctx.drawImage(img, 0, 0);
            
            // Sample the entire image at regular intervals to build a palette
            // Use a step size to sample efficiently without processing every pixel
            const stepSize = Math.max(1, Math.floor(Math.min(canvas.width, canvas.height) / 50)); // Sample ~50x50 points
            
            const colorPalette = [];
            const colorMap = new Map(); // To count color frequencies
            
            // Sample pixels across the entire image
            for (let y = 0; y < canvas.height; y += stepSize) {
                for (let x = 0; x < canvas.width; x += stepSize) {
                    const imageData = ctx.getImageData(x, y, 1, 1);
                    const data = imageData.data;
                    const r = data[0];
                    const g = data[1];
                    const b = data[2];
                    const a = data[3];
                    
                    // Skip fully transparent pixels
                    if (a < 128) continue;
                    
                    // Create a color key for grouping similar colors
                    // Round to nearest 10 to group similar colors together
                    const colorKey = `${Math.floor(r / 10) * 10},${Math.floor(g / 10) * 10},${Math.floor(b / 10) * 10}`;
                    
                    if (!colorMap.has(colorKey)) {
                        colorMap.set(colorKey, { r, g, b, count: 1 });
                    } else {
                        const existing = colorMap.get(colorKey);
                        // Average the colors in this group
                        existing.r = Math.floor((existing.r * existing.count + r) / (existing.count + 1));
                        existing.g = Math.floor((existing.g * existing.count + g) / (existing.count + 1));
                        existing.b = Math.floor((existing.b * existing.count + b) / (existing.count + 1));
                        existing.count++;
                    }
                }
            }
            
            // Convert map to array and find the darkest color
            let darkestColor = null;
            let darkestLuminance = 1; // Start with brightest possible
            
            colorMap.forEach((color) => {
                const luminance = getLuminance(color.r, color.g, color.b);
                if (luminance < darkestLuminance) {
                    darkestLuminance = luminance;
                    darkestColor = color;
                }
            });
            
            if (darkestColor) {
                callback(`rgb(${darkestColor.r}, ${darkestColor.g}, ${darkestColor.b})`);
            } else {
                // Fallback if no colors found
                callback(HOVER_CONFIG.nameBackgroundColor);
            }
        } catch (e) {
            console.error('Error extracting image color:', e);
            // Fallback to default color if extraction fails
            callback(HOVER_CONFIG.nameBackgroundColor);
        }
    }
    
    /**
     * Escape HTML special characters
     */
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Mechanical cipher character set for kinetic garble animation
    const CIPHER_GLYPHS = ['/', '\\', '_', '-', '>', '+', '*', '#', '%', ':', '~', '^'];

    function getRandomGlyph() {
        return CIPHER_GLYPHS[Math.floor(Math.random() * CIPHER_GLYPHS.length)];
    }

    /**
     * Injects card styles if not already provided by external CSS
     */
    function injectHoverCardStyles() {
        if (document.getElementById('gallery-hover-card-style')) return;
        const style = document.createElement('style');
        style.id = 'gallery-hover-card-style';
        style.textContent = `
            .gallery-hover-card {
                position: absolute;
                bottom: 12px;
                left: 12px;
                box-sizing: border-box;
                width: max-content;
                max-width: min(340px, calc(100% - 24px));
                padding: 10px 14px 11px;
                background: rgba(3, 8, 15, 0.90);
                border: 1px solid rgba(53, 196, 240, 0.28);
                border-left: 3px solid #35c4f0;
                border-radius: 2px;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.70);
                z-index: 25;
                pointer-events: none;
                opacity: 0;
                transform: translateY(6px);
                transition: opacity 120ms cubic-bezier(0.16, 1, 0.3, 1), transform 120ms cubic-bezier(0.16, 1, 0.3, 1);
                will-change: opacity, transform;
            }
            .gallery-hover-card.is-active {
                opacity: 1;
                transform: translateY(0);
            }
            .gallery-hover-card .lz-hover-title {
                display: block;
                font-family: VT323, monospace;
                font-size: 24px;
                font-weight: 400;
                line-height: 1.1;
                color: #35c4f0;
                letter-spacing: 0.5px;
                margin: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .gallery-hover-card .lz-hover-desc {
                display: block;
                font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
                font-size: 13px;
                font-weight: 400;
                line-height: 1.45;
                color: #d8ecf5;
                margin-top: 5px;
                text-wrap: pretty;
            }
            .gallery-hover-card .lz-hover-cursor {
                display: inline-block;
                color: #35c4f0;
                font-weight: 700;
                margin-left: 2px;
                vertical-align: baseline;
                animation: lzCursorBlink 380ms steps(2, start) infinite;
            }
            .gallery-hover-card .lz-hover-cursor.is-settled {
                animation: none;
                opacity: 0;
                transition: opacity 120ms ease-out;
            }
            .gallery-hover-card .lz-hover-garble {
                display: inline-block;
                color: #8fdcf5;
                font-family: VT323, monospace;
                font-weight: 400;
            }
            @keyframes lzCursorBlink {
                to { visibility: hidden; }
            }
            @media (prefers-reduced-motion: reduce) {
                .gallery-hover-card {
                    transition: none !important;
                    transform: none !important;
                }
                .gallery-hover-card .lz-hover-cursor {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Motion Design Typing & Kinetic Garble Choreography
     * Total appearance timeline: Exactly 1.0 second (1000ms).
     * - Anticipation (0-40ms): Card snaps in, cursor wakes up
     * - Title Stream (40-320ms): Title decodes rapidly with dynamic garble character lead
     * - Baton Pass (320-360ms): Cursor shifts to description line
     * - Description Stream (360-930ms): Storyline decodes with kinetic cipher lead
     * - Settle & Resolution (930-1000ms): Cursor smoothly settles out, leaving crisp copy
     */
    function startCardAnimation(cardEl, titleEl, descEl, titleText, descText) {
        if (!cardEl || !titleEl) return null;

        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            cardEl.classList.add('is-active');
            titleEl.textContent = titleText;
            if (descEl) descEl.textContent = descText || '';
            return { cancel: function() {} };
        }

        cardEl.classList.add('is-active');
        titleEl.textContent = '';
        if (descEl) descEl.textContent = '';

        let isCancelled = false;
        let rafId = null;
        const startTime = performance.now();

        const TOTAL_MS = 1000; // Exactly 1.0s total choreography
        const TITLE_START = 40; // 40ms anticipation with blinking cursor
        const hasDesc = Boolean(descEl && descText && descText.trim().length > 0);

        const TITLE_DURATION = hasDesc 
            ? Math.min(300, Math.max(180, titleText.length * 14))
            : Math.min(700, Math.max(300, titleText.length * 24));
        const TITLE_END = TITLE_START + TITLE_DURATION;

        const DESC_START = TITLE_END + 40;
        const DESC_END = 930;
        const DESC_DURATION = Math.max(100, DESC_END - DESC_START);

        let lastGlyphTime = 0;
        let currentGlyph = getRandomGlyph();

        function tick(now) {
            if (isCancelled) return;
            const elapsed = now - startTime;

            // Cycle through energetic mechanical cipher glyphs every ~35ms
            if (now - lastGlyphTime > 35) {
                currentGlyph = getRandomGlyph();
                lastGlyphTime = now;
            }

            // PHASE 1: Anticipation (0ms -> TITLE_START)
            if (elapsed < TITLE_START) {
                titleEl.innerHTML = '<span class="lz-hover-cursor">▌</span>';
                if (descEl) descEl.innerHTML = '';
            }
            // PHASE 2: Title Typing with Kinetic Garble Lead (TITLE_START -> TITLE_END)
            else if (elapsed <= TITLE_END) {
                const progress = Math.min(1, (elapsed - TITLE_START) / TITLE_DURATION);
                const revealed = Math.floor(progress * titleText.length);
                const stable = titleText.slice(0, revealed);
                const hasLead = revealed < titleText.length;
                const leadHtml = hasLead ? `<span class="lz-hover-garble">${currentGlyph}</span>` : '';

                titleEl.innerHTML = `${escapeHtml(stable)}${leadHtml}<span class="lz-hover-cursor">▌</span>`;
                if (descEl) descEl.innerHTML = '';
            }
            // PHASE 3: Description Typing with Kinetic Garble Lead (TITLE_END -> DESC_END)
            else if (hasDesc && elapsed <= DESC_END) {
                titleEl.textContent = titleText; // Title 100% resolved and locked

                if (elapsed < DESC_START) {
                    descEl.innerHTML = '<span class="lz-hover-cursor">▌</span>';
                } else {
                    const descProgress = Math.min(1, (elapsed - DESC_START) / DESC_DURATION);
                    const revealed = Math.floor(descProgress * descText.length);
                    const stable = descText.slice(0, revealed);
                    const hasLead = revealed < descText.length;
                    const leadHtml = hasLead ? `<span class="lz-hover-garble">${currentGlyph}</span>` : '';

                    descEl.innerHTML = `${escapeHtml(stable)}${leadHtml}<span class="lz-hover-cursor">▌</span>`;
                }
            }
            // PHASE 4: Settle & Resolution (DESC_END -> TOTAL_MS)
            else if (elapsed <= TOTAL_MS) {
                titleEl.textContent = titleText;
                if (hasDesc) {
                    descEl.innerHTML = `${escapeHtml(descText)}<span class="lz-hover-cursor is-settled">▌</span>`;
                } else {
                    titleEl.innerHTML = `${escapeHtml(titleText)}<span class="lz-hover-cursor is-settled">▌</span>`;
                }
            }
            // COMPLETED (elapsed > TOTAL_MS)
            else {
                titleEl.textContent = titleText;
                if (hasDesc) descEl.textContent = descText;
                return;
            }

            rafId = requestAnimationFrame(tick);
        }

        rafId = requestAnimationFrame(tick);

        return {
            cancel: function() {
                isCancelled = true;
                if (rafId) cancelAnimationFrame(rafId);
            }
        };
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
        
        // Create motion design hover card (dark, semi-transparent, mechanical typography)
        const tipText = item.dataset.lzTip || '';
        const card = document.createElement('div');
        card.className = 'gallery-hover-card';

        const titleEl = document.createElement('strong');
        titleEl.className = 'lz-hover-title';

        const descEl = document.createElement('span');
        descEl.className = 'lz-hover-desc';

        card.appendChild(titleEl);
        if (tipText) {
            card.appendChild(descEl);
        }

        // Store element references on overlay for hover animation
        overlay._card = card;
        overlay._titleEl = titleEl;
        overlay._descEl = descEl;
        overlay._titleText = imageName;
        overlay._descText = tipText;

        // Create CRT scanlines overlay (subtle, doesn't obscure image)
        const scanlinesOverlay = document.createElement('div');
        scanlinesOverlay.className = 'gallery-crt-scanlines';
        scanlinesOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent ${HOVER_CONFIG.crtScanlineGap},
                rgba(0, 0, 0, ${HOVER_CONFIG.crtScanlineOpacity}) ${HOVER_CONFIG.crtScanlineGap},
                rgba(0, 0, 0, ${HOVER_CONFIG.crtScanlineOpacity}) calc(${HOVER_CONFIG.crtScanlineGap} + ${HOVER_CONFIG.crtScanlineHeight})
            );
            pointer-events: none;
            z-index: 5;
            opacity: 0;
            transition: opacity 200ms ease-in;
            mix-blend-mode: multiply;
        `;
        
        // Create warping band overlay (TV startup effect)
        const warpBandOverlay = document.createElement('div');
        warpBandOverlay.className = 'gallery-crt-warp-band';
        const warpBandHeightNum = parseFloat(HOVER_CONFIG.crtWarpBandHeight);
        warpBandOverlay.style.cssText = `
            position: absolute;
            left: 0;
            right: 0;
            width: 100%;
            height: ${HOVER_CONFIG.crtWarpBandHeight};
            background: linear-gradient(
                to bottom,
                rgba(255, 255, 255, ${HOVER_CONFIG.crtWarpBandOpacity * 0.3}) 0%,
                rgba(255, 255, 255, ${HOVER_CONFIG.crtWarpBandOpacity * 0.8}) 50%,
                rgba(255, 255, 255, ${HOVER_CONFIG.crtWarpBandOpacity * 0.3}) 100%
            );
            pointer-events: none;
            z-index: 6;
            opacity: 0;
            transform: translateY(100%);
            transition: transform ${HOVER_CONFIG.crtWarpBandSpeed}ms linear, opacity 150ms ease-in;
            filter: blur(2px);
            box-shadow: 
                0 0 ${HOVER_CONFIG.crtWarpIntensity * 1.5}px rgba(255, 255, 255, ${HOVER_CONFIG.crtWarpBandOpacity}),
                inset 0 0 ${HOVER_CONFIG.crtWarpIntensity * 2}px rgba(255, 255, 255, ${HOVER_CONFIG.crtWarpBandOpacity * 0.7});
        `;
        
        overlay.appendChild(swipeLine1);
        overlay.appendChild(swipeLine2);
        overlay.appendChild(card);
        overlay.appendChild(scanlinesOverlay);
        overlay.appendChild(warpBandOverlay);
        
        return overlay;
    }
    
    /**
     * Initialize hover effects for gallery items
     */
    function initHoverEffects() {
        // Expand galleries specifically to fill the whole viewport width
        const galleryWrappers = document.querySelectorAll('.vce-image-masonry-gallery');
        galleryWrappers.forEach(gallery => {
            const rowContainer = gallery.closest('.vce-row-container');
            if (rowContainer) {
                // Break out of the boxed limit layout restrictions and force full viewport width
                const updateWidth = () => {
                    // Use clientWidth to avoid horizontal scrollbars caused by 100vw
                    rowContainer.style.setProperty('width', document.documentElement.clientWidth + 'px', 'important');
                    rowContainer.style.setProperty('max-width', 'none', 'important');
                    rowContainer.style.setProperty('position', 'relative', 'important');
                    rowContainer.style.setProperty('left', '50%', 'important');
                    rowContainer.style.setProperty('transform', 'translateX(-50%)', 'important');
                    rowContainer.style.setProperty('padding', '0', 'important');
                };
                
                updateWidth();
                window.addEventListener('resize', updateWidth);
                
                const innerRow = rowContainer.querySelector('.vce-row');
                if (innerRow) {
                    innerRow.style.setProperty('padding-left', '0', 'important');
                    innerRow.style.setProperty('padding-right', '0', 'important');
                }
            }
        });

        const galleryItems = document.querySelectorAll('.vce-image-masonry-gallery-item');
        
        galleryItems.forEach(item => {
            const img = item.querySelector('img');
            if (!img) return;
            
            // Make item position relative
            item.style.position = 'relative';
            
            // Get image name
            const imageSrc = img.src || img.getAttribute('src');
            const imageName = item.dataset.lzTitle || getImageName(imageSrc);
            
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
            
            // Get image border-radius to match it
            const computedImgStyle = window.getComputedStyle(img);
            const imgBorderRadius = computedImgStyle.borderRadius || '0px';
            
            // Create pulsating border element on the image itself
            const pulsatingBorder = document.createElement('div');
            pulsatingBorder.className = 'gallery-pulsating-border';
            pulsatingBorder.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: ${HOVER_CONFIG.borderWidth} solid ${HOVER_CONFIG.borderColor};
                border-radius: ${imgBorderRadius};
                pointer-events: none;
                z-index: 11;
                opacity: 0;
                transition: opacity 200ms ease-in;
                box-sizing: border-box;
            `;
            
            // Add border pulsate keyframes if not already added
            if (!document.getElementById('gallery-border-pulsate-keyframes')) {
                const style = document.createElement('style');
                style.id = 'gallery-border-pulsate-keyframes';
                const baseOpacity = parseFloat(HOVER_CONFIG.borderColor.match(/[\d.]+(?=\)$)/)?.[0] || '0.8');
                style.textContent = `
                    @keyframes borderPulsate {
                        0%, 100% {
                            opacity: ${baseOpacity};
                        }
                        50% {
                            opacity: ${baseOpacity * (1 - HOVER_CONFIG.borderPulsateIntensity)};
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Append border to image parent (the <a> tag) - this is the image container
            const imgContainer = img.parentElement;
            if (imgContainer) {
                // Make container relative if not already
                const containerStyle = window.getComputedStyle(imgContainer);
                if (containerStyle.position === 'static') {
                    imgContainer.style.position = 'relative';
                }
                imgContainer.appendChild(pulsatingBorder);
            } else {
                // Fallback: append to item
                item.appendChild(pulsatingBorder);
            }
            
            // Store original transform for later use
            if (hasOriginalTransform) {
                img.dataset.originalTransform = originalTransform;
            } else {
                img.dataset.originalTransform = 'none';
            }
            
            // Ensure the image can be transformed (override any conflicting styles)
            img.style.transform = originalTransform || 'none';
            // Suppress native browser title tooltip from conflicting with custom hover card
            if (img.hasAttribute('title')) {
                img.removeAttribute('title');
            }
        }
        
        let cardAnim = null;

        // Handle hover
        item.addEventListener('mouseenter', function() {
            const swipeLine1 = overlay.querySelector('.gallery-swipe-line-1');
            const swipeLine2 = overlay.querySelector('.gallery-swipe-line-2');
            const scanlinesOverlay = overlay.querySelector('.gallery-crt-scanlines');
            const warpBandOverlay = overlay.querySelector('.gallery-crt-warp-band');
            const img = item.querySelector('img');
            
            // Find pulsating border - it might be in image parent or item
            let pulsatingBorder = null;
            const imgParent = img ? img.parentElement : null;
            if (imgParent && imgParent !== item) {
                pulsatingBorder = imgParent.querySelector('.gallery-pulsating-border');
            }
            if (!pulsatingBorder) {
                pulsatingBorder = item.querySelector('.gallery-pulsating-border');
            }
            
            // Bring hovered item above other elements
            item.style.zIndex = '100';
            item.style.position = 'relative';
            
            // Animate swipe lines and trigger effects
            requestAnimationFrame(() => {
                const itemHeight = item.offsetHeight;
                
                // Show pulsating border with animation
                if (pulsatingBorder) {
                    pulsatingBorder.style.opacity = '1';
                    pulsatingBorder.style.animation = `borderPulsate ${HOVER_CONFIG.borderPulsateDuration}ms ease-in-out infinite`;
                }
                
                // Zoom in the image and apply CRT effects
                if (img) {
                    const originalTransform = img.dataset.originalTransform || 'none';
                    img.style.transition = `transform ${HOVER_CONFIG.zoomDuration}ms ${HOVER_CONFIG.zoomEasing}`;
                    if (originalTransform !== 'none') {
                        img.style.setProperty('transform', `scale(${HOVER_CONFIG.zoomScale}) ${originalTransform}`, 'important');
                    } else {
                        img.style.setProperty('transform', `scale(${HOVER_CONFIG.zoomScale})`, 'important');
                    }
                    
                    // Apply CRT filters to image
                    img.style.setProperty('filter', `
                        brightness(${HOVER_CONFIG.crtBrightness}) 
                        contrast(${HOVER_CONFIG.crtContrast}) 
                        saturate(${HOVER_CONFIG.crtSaturation})
                    `, 'important');
                    
                    // Start glitch animation
                    startGlitchEffect(img);
                }
                
                // Explicitly set the transition delay for entering
                swipeLine2.style.transitionDelay = `${HOVER_CONFIG.swipeDelay}ms`;
                
                // Animate swipe lines
                swipeLine1.style.transform = `translateY(${itemHeight}px)`;
                swipeLine2.style.transform = `translateY(${itemHeight}px)`;
                
                // Show scanlines
                scanlinesOverlay.style.opacity = '1';
                
                // Start warp band animation (randomly)
                startWarpBandAnimation(warpBandOverlay, item);

                // Start motion design card typing animation (1.0s choreographed timeline)
                if (cardAnim) {
                    cardAnim.cancel();
                }
                cardAnim = startCardAnimation(overlay._card, overlay._titleEl, overlay._descEl, overlay._titleText, overlay._descText);
            });
        });
        
        item.addEventListener('mouseleave', function() {
            const swipeLine1 = overlay.querySelector('.gallery-swipe-line-1');
            const swipeLine2 = overlay.querySelector('.gallery-swipe-line-2');
            const scanlinesOverlay = overlay.querySelector('.gallery-crt-scanlines');
            const warpBandOverlay = overlay.querySelector('.gallery-crt-warp-band');
            const img = item.querySelector('img');
            
            // Find pulsating border - it's in the image container (parent of img)
            let pulsatingBorder = null;
            if (img) {
                const imgContainer = img.parentElement;
                if (imgContainer) {
                    pulsatingBorder = imgContainer.querySelector('.gallery-pulsating-border');
                }
            }
            if (!pulsatingBorder) {
                pulsatingBorder = item.querySelector('.gallery-pulsating-border');
            }
            
            // Reset z-index
            item.style.zIndex = '1';
            
            // Hide pulsating border and stop animation
            if (pulsatingBorder) {
                pulsatingBorder.style.opacity = '0';
                pulsatingBorder.style.animation = 'none';
            }
            
            // Stop glitch animation
            if (img && img.dataset.glitchInterval) {
                clearInterval(parseInt(img.dataset.glitchInterval));
                delete img.dataset.glitchInterval;
            }
            
            // Stop warp band animation
            if (warpBandOverlay && warpBandOverlay._warpCleanup) {
                warpBandOverlay._warpCleanup();
                delete warpBandOverlay.dataset.warpActive;
                delete warpBandOverlay._warpCleanup;
            }
            
            // Reset zoom and filters on image
            if (img) {
                const originalTransform = img.dataset.originalTransform || 'none';
                if (originalTransform !== 'none') {
                    img.style.setProperty('transform', originalTransform, 'important');
                } else {
                    img.style.removeProperty('transform');
                }
                // Reset filters
                img.style.removeProperty('filter');
                // Reset any glitch transform
                img.style.clipPath = '';
            }

            // Stop card animation and exit
            if (cardAnim) {
                cardAnim.cancel();
                cardAnim = null;
            }
            if (overlay._card) {
                overlay._card.classList.remove('is-active');
                setTimeout(() => {
                    if (overlay._card && !overlay._card.classList.contains('is-active')) {
                        overlay._titleEl.textContent = '';
                        if (overlay._descEl) overlay._descEl.textContent = '';
                    }
                }, 130);
            }
            
            // Reset animations (animating out from bottom to top)
            swipeLine1.style.transform = 'translateY(-100%)';
            swipeLine2.style.transitionDelay = `${HOVER_CONFIG.swipeOutDelay}ms`;
            swipeLine2.style.transform = 'translateY(-100%)';
            
            // Hide scanlines and warp band
            scanlinesOverlay.style.opacity = '0';
            warpBandOverlay.style.opacity = '0';
            warpBandOverlay.style.transform = 'translateY(100%)';
            
            // Reset delay for next hover (after transition is fully done)
            setTimeout(() => {
                swipeLine2.style.transitionDelay = `${HOVER_CONFIG.swipeDelay}ms`;
            }, Math.max(50, HOVER_CONFIG.swipeOutDelay + HOVER_CONFIG.swipeDuration + 50));
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

