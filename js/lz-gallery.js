/* Lightbox side card: turns PhotoSwipe's caption into a scrollable info card. */
(function () {
  function setup() {
    var pswp = document.querySelector('.pswp');
    if (!pswp || pswp.dataset.lzReady) return !!pswp;
    pswp.dataset.lzReady = '1';
    pswp.classList.add('pswp--lz');
    // If PhotoSwipe already measured the full-width viewport, make it re-measure with the card in place.
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 0);
    var caption = pswp.querySelector('.pswp__caption:not(.pswp__caption--fake)');
    if (caption) {
      // Clicks, drags and scrolls inside the card must not close or swipe the lightbox.
      ['pointerdown', 'mousedown', 'touchstart', 'click', 'wheel'].forEach(function (type) {
        caption.addEventListener(type, function (e) { e.stopPropagation(); }, { passive: true });
      });
      // Start every new slide's card at the top.
      var center = caption.querySelector('.pswp__caption__center');
      if (center && window.MutationObserver) {
        new MutationObserver(function () { caption.scrollTop = 0; }).observe(center, { childList: true });
      }
    }
    return true;
  }
  if (!setup()) {
    // PhotoSwipe adds its template on first open: watch for it.
    var obs = new MutationObserver(function () { if (setup()) obs.disconnect(); });
    obs.observe(document.body, { childList: true, subtree: true });
  }
})();
