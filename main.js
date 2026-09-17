/**
 * CINEADDICT — Luxury Wedding Films & Photography
 * Interactive Engine & Conversion Systems
 * Location: Pune, Maharashtra, India
 */

(function () {
  'use strict';

  // ==========================================
  // 1. CONFIGURATION & STATE
  // ==========================================
  const TOTAL_FRAMES = 240;
  const FRAME_BASE_PATH = 'video_frames_24fps_png/frame_';
  const LERP_DAMPING = 0.12;
  const isMobileClient = window.innerWidth <= 768 || ('ontouchstart' in window);
  const CONCURRENT_LOAD_LIMIT = isMobileClient ? 4 : 8;
  const CINEADDICT_WHATSAPP = '917385229599'; // Primary Studio Booking Line (+91 73852 29599)

  function getFrameUrl(index) {
    const padded = String(index).padStart(5, '0');
    return `${FRAME_BASE_PATH}${padded}.png`;
  }

  // DOM Elements - Animation
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
  const loaderBar = document.getElementById('loader-bar');
  const loaderBarContainer = document.getElementById('loader-bar-container');
  const currentFrameNum = document.getElementById('current-frame-num');

  // DOM Elements - UI & Interactivity
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section, footer');
  const backToTopBtn = document.getElementById('back-to-top');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const mobileNavClose = document.getElementById('mobile-nav-close');
  const mobileStickyBar = document.querySelector('.mobile-sticky-action-bar');

  // Animation Engine State
  const images = new Array(TOTAL_FRAMES + 1);
  const loadedStatus = new Uint8Array(TOTAL_FRAMES + 1);
  let loadedCount = 0;
  let targetFrame = 1;
  let currentFrame = 1;
  let renderedFrame = -1;
  let isInitialFrameDrawn = false;

  // ==========================================
  // 2. CANVAS RESPONSIVE & COVER ENGINE
  // ==========================================
  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const isMobile = window.innerWidth <= 768;
    const maxDpr = isMobile ? 1.25 : 1.75;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);

    if (renderedFrame > 0) {
      drawFrame(renderedFrame);
    }
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 150);
  }, { passive: true });

  function drawCoverImage(img) {
    if (!img || !img.complete || img.naturalWidth === 0 || !ctx || !canvas) return;

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const cW = canvas.width;
    const cH = canvas.height;

    const imgRatio = imgW / imgH;
    const canvasRatio = cW / cH;

    let renderW, renderH, renderX, renderY;

    if (canvasRatio > imgRatio) {
      renderW = cW;
      renderH = Math.round(cW / imgRatio);
      renderX = 0;
      renderY = Math.round((cH - renderH) / 2);
    } else {
      renderH = cH;
      renderW = Math.round(cH * imgRatio);
      renderY = 0;
      renderX = Math.round((cW - renderW) / 2);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, renderX, renderY, renderW, renderH);
  }

  function drawFrame(frameIndex) {
    if (!ctx) return;
    let img = images[frameIndex];

    if (img && loadedStatus[frameIndex]) {
      drawCoverImage(img);
      return;
    }

    // Nearest-loaded fallback
    let bestFallback = null;
    for (let offset = 1; offset <= 24; offset++) {
      const prev = frameIndex - offset;
      if (prev >= 1 && loadedStatus[prev]) {
        bestFallback = images[prev];
        break;
      }
      const next = frameIndex + offset;
      if (next <= TOTAL_FRAMES && loadedStatus[next]) {
        bestFallback = images[next];
        break;
      }
    }

    if (bestFallback) {
      drawCoverImage(bestFallback);
    } else if (images[1] && loadedStatus[1]) {
      drawCoverImage(images[1]);
    }
  }

  // ==========================================
  // 3. SMOOTH LERP RENDER LOOP
  // ==========================================
  function updateAnimation() {
    if (!ctx) return;
    const delta = targetFrame - currentFrame;
    if (Math.abs(delta) > 0.001) {
      currentFrame += delta * LERP_DAMPING;
    } else {
      currentFrame = targetFrame;
    }

    const rounded = Math.round(currentFrame);
    const clampedFrame = Math.max(1, Math.min(TOTAL_FRAMES, rounded));

    if (clampedFrame !== renderedFrame) {
      drawFrame(clampedFrame);
      renderedFrame = clampedFrame;
      if (currentFrameNum) {
        currentFrameNum.textContent = String(clampedFrame).padStart(3, '0');
      }
    }

    requestAnimationFrame(updateAnimation);
  }

  // ==========================================
  // 4. SCROLL PROGRESS TRACKER
  // ==========================================
  function onScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      const scrollRatio = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      targetFrame = 1 + scrollRatio * (TOTAL_FRAMES - 1);
    }

    // Mobile Sticky Action Bar Visibility
    if (mobileStickyBar) {
      if (window.scrollY > 380) {
        mobileStickyBar.style.display = 'block';
      } else {
        mobileStickyBar.style.display = 'none';
      }
    }

    // Dynamic Navigation Highlighting
    let currentActiveId = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 140;
      const height = section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentActiveId = section.getAttribute('id');
      }
    });

    if (currentActiveId) {
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentActiveId}`);
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ==========================================
  // 5. ASSET PRELOADER
  // ==========================================
  function loadImage(index) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = getFrameUrl(index);

      img.onload = () => {
        images[index] = img;
        loadedStatus[index] = 1;
        loadedCount++;
        onProgressUpdate();
        resolve(img);
      };

      img.onerror = () => {
        loadedStatus[index] = 0;
        resolve(null);
      };
    });
  }

  function onProgressUpdate() {
    const percent = Math.round((loadedCount / TOTAL_FRAMES) * 100);
    if (loaderBar) {
      loaderBar.style.width = `${percent}%`;
    }

    if (!isInitialFrameDrawn && loadedStatus[1]) {
      isInitialFrameDrawn = true;
      resizeCanvas();
      drawFrame(1);
      renderedFrame = 1;
    }

    if (loadedCount === TOTAL_FRAMES && loaderBarContainer) {
      setTimeout(() => {
        loaderBarContainer.style.opacity = '0';
      }, 500);
    }
  }

  async function loadAllFrames() {
    if (!canvas) return;
    await loadImage(1);

    const priorityChunk = [];
    for (let i = 2; i <= Math.min(20, TOTAL_FRAMES); i++) {
      priorityChunk.push(loadImage(i));
    }
    await Promise.all(priorityChunk);

    const remainingIndices = [];
    for (let i = 21; i <= TOTAL_FRAMES; i++) {
      remainingIndices.push(i);
    }

    const activePool = [];
    for (const index of remainingIndices) {
      const promise = loadImage(index).then(() => {
        activePool.splice(activePool.indexOf(promise), 1);
      });
      activePool.push(promise);

      if (activePool.length >= CONCURRENT_LOAD_LIMIT) {
        await Promise.race(activePool);
      }
    }

    await Promise.all(activePool);
  }

  // ==========================================
  // 6. NAVIGATION & MOBILE DRAWER
  // ==========================================
  function initNavigation() {
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    function toggleMobileMenu(forceState) {
      if (!navMenu) return;
      const isOpen = forceState !== undefined ? forceState : !navMenu.classList.contains('open');

      navMenu.classList.toggle('open', isOpen);
      if (menuToggle) {
        menuToggle.classList.toggle('open', isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }
      if (mobileBackdrop) {
        mobileBackdrop.classList.toggle('open', isOpen);
      }
      document.body.classList.toggle('menu-open', isOpen);
    }

    if (menuToggle) {
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
      });
    }

    if (mobileNavClose) {
      mobileNavClose.addEventListener('click', () => toggleMobileMenu(false));
    }

    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', () => toggleMobileMenu(false));
    }

    navLinks.forEach((link) => {
      link.addEventListener('click', () => toggleMobileMenu(false));
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu && navMenu.classList.contains('open')) {
        toggleMobileMenu(false);
      }
    });
  }

  // ==========================================
  // 7. PORTFOLIO FILTERING & VIDEO MODAL
  // ==========================================
  function initPortfolio() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const workCards = document.querySelectorAll('.work-item');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const selectedFilter = btn.getAttribute('data-filter');

        workCards.forEach((card) => {
          const category = card.getAttribute('data-category');
          if (selectedFilter === 'all' || category === selectedFilter) {
            card.classList.remove('hide');
          } else {
            card.classList.add('hide');
          }
        });
      });
    });

    // Modal Player
    const modal = document.getElementById('media-modal');
    const modalTitle = document.getElementById('modal-media-title');
    const modalContainer = document.getElementById('modal-media-container');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    function openModal(src, title, type) {
      if (!modal || !modalContainer) return;

      modalContainer.innerHTML = '';
      modalTitle.textContent = title || 'CineAddict Film Showcase';

      if (type === 'video') {
        const video = document.createElement('video');
        video.className = 'modal-video-player';
        video.src = src;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
        video.setAttribute('disablePictureInPicture', 'true');
        video.oncontextmenu = (e) => { e.preventDefault(); return false; };
        modalContainer.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.className = 'modal-image-view';
        img.src = src;
        img.alt = title || 'Photography Frame';
        img.oncontextmenu = (e) => { e.preventDefault(); return false; };
        img.ondragstart = (e) => { e.preventDefault(); return false; };
        modalContainer.appendChild(img);
      }

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (modalContainer) {
        modalContainer.innerHTML = '';
      }
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
        closeModal();
      }
    });

    // Attach click triggers to all cards and featured video
    document.querySelectorAll('.project-media-wrap, .featured-video-wrap').forEach((wrap) => {
      wrap.addEventListener('click', () => {
        const src = wrap.getAttribute('data-src');
        const title = wrap.getAttribute('data-title');
        const type = wrap.getAttribute('data-type') || 'video';
        openModal(src, title, type);
      });
    });

    document.querySelectorAll('.play-action-btn, .btn-watch-film, .featured-play-center').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wrap = btn.closest('.project-media-wrap, .featured-video-wrap');
        if (wrap) {
          const src = wrap.getAttribute('data-src');
          const title = wrap.getAttribute('data-title');
          const type = wrap.getAttribute('data-type') || 'video';
          openModal(src, title, type);
        }
      });
    });
  }

  // ==========================================
  // 8. FAQ ACCORDION
  // ==========================================
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item) => {
      const questionBtn = item.querySelector('.faq-question-btn');
      const panel = item.querySelector('.faq-answer-panel');

      if (!questionBtn || !panel) return;

      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all items
        faqItems.forEach((other) => {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-question-btn');
          const otherPanel = other.querySelector('.faq-answer-panel');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherPanel) otherPanel.style.maxHeight = null;
        });

        // Toggle clicked
        if (!isActive) {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  }

  // ==========================================
  // 9. WHATSAPP & BOOKING FORM CONVERSION ENGINE
  // ==========================================
  function initEnquiryForm() {
    const form = document.getElementById('wedding-enquiry-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name')?.value.trim() || '';
      const partner = document.getElementById('form-partner-name')?.value.trim() || '';
      const date = document.getElementById('form-date')?.value || '';
      const location = document.getElementById('form-location')?.value.trim() || '';
      const events = document.getElementById('form-events')?.value.trim() || 'Wedding Celebrations';
      const whatsapp = document.getElementById('form-whatsapp')?.value.trim() || '';
      const service = document.getElementById('form-service')?.value || 'Photography + Film';

      // Build High-Conversion WhatsApp Pre-filled message
      const message = `Hello CineAddict Studios!\n\nI would like to check availability for our wedding date:\n• Couple: ${name} & ${partner}\n• Date: ${date}\n• Location: ${location}\n• Events Planned: ${events}\n• Looking For: ${service}\n• Contact: ${whatsapp}\n\nWe love your cinematic storytelling and would love to hear back!`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${CINEADDICT_WHATSAPP}?text=${encodedMessage}`;

      // Open WhatsApp chat directly
      window.open(whatsappUrl, '_blank');

      // Visual success confirmation on button
      const submitBtn = document.getElementById('submit-enquiry-btn');
      if (submitBtn) {
        const originalHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>REDIRECTING TO WHATSAPP... ✓</span>';
        setTimeout(() => {
          submitBtn.innerHTML = originalHtml;
          form.reset();
        }, 4000);
      }
    });
  }

  // ==========================================
  // 10. CONTENT PROTECTION & ANTI-THEFT SECURITY
  // ==========================================
  function initContentSecurity() {
    // 1. Create luxury protection toast
    let toast = document.getElementById('cine-protection-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cine-protection-toast';
      toast.className = 'cine-protection-toast';
      toast.innerHTML = `
        <span class="lock-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </span>
        <span class="toast-message">Protected Content · © CineAddict Studios</span>
      `;
      document.body.appendChild(toast);
    }

    let toastTimeout = null;
    function showProtectionToast(message) {
      if (!toast) return;
      const msgSpan = toast.querySelector('.toast-message');
      if (msgSpan && message) msgSpan.textContent = message;
      toast.classList.add('show');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    }

    // 2. Disable Right-Click Context Menu on media & portfolio
    document.addEventListener('contextmenu', (e) => {
      const isMediaTarget = e.target.closest('img, video, canvas, .project-card, .gallery-photo-item, .featured-film-card, #media-modal');
      if (isMediaTarget || e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO' || e.target.tagName === 'CANVAS') {
        e.preventDefault();
        showProtectionToast('🔒 Protected Work · Right-click downloading is disabled');
        return false;
      }
    });

    // 3. Disable Dragging of Images & Videos
    document.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO' || e.target.closest('.project-media-wrap, .gallery-photo-item, .featured-film-card')) {
        e.preventDefault();
        return false;
      }
    });

    // 4. Disable DevTools, Save, and Print Shortcuts
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        showProtectionToast('🔒 Developer inspection is restricted');
        return false;
      }

      // Cmd/Ctrl + Shift + I/J/C (DevTools)
      if (isCmdOrCtrl && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
        e.preventDefault();
        showProtectionToast('🔒 Source inspection is restricted');
        return false;
      }

      // Cmd/Ctrl + U (View Source)
      if (isCmdOrCtrl && key === 'u') {
        e.preventDefault();
        showProtectionToast('🔒 View source is restricted');
        return false;
      }

      // Cmd/Ctrl + S (Save Page)
      if (isCmdOrCtrl && key === 's') {
        e.preventDefault();
        showProtectionToast('🔒 Content saving is restricted · © CineAddict');
        return false;
      }

      // Cmd/Ctrl + P (Print)
      if (isCmdOrCtrl && key === 'p') {
        e.preventDefault();
        showProtectionToast('🔒 Printing is restricted · © CineAddict');
        return false;
      }

      // macOS Screenshot Shortcut Detection (Cmd + Shift + 3 / 4 / 5)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(key)) {
        triggerScreenshotShield();
      }
    });

    // 5. Windows PrintScreen Key Detection
    window.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen') {
        triggerScreenshotShield();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('');
        }
      }
    });

    // 6. Screenshot / Window Blur Protection
    let shieldTimer = null;
    function triggerScreenshotShield() {
      document.body.classList.add('screenshot-shield');
      showProtectionToast('🔒 Screenshot Protected · © CineAddict Studios');
      if (shieldTimer) clearTimeout(shieldTimer);
      shieldTimer = setTimeout(() => {
        document.body.classList.remove('screenshot-shield');
      }, 1200);
    }

    // Temporary protective blur when window loses focus during screenshot snippet
    window.addEventListener('blur', () => {
      document.body.classList.add('screenshot-shield');
    });

    window.addEventListener('focus', () => {
      document.body.classList.remove('screenshot-shield');
    });

    // 7. Enforce nodownload on all video tags in DOM
    document.querySelectorAll('video').forEach((vid) => {
      vid.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
      vid.setAttribute('disablePictureInPicture', 'true');
      vid.oncontextmenu = (e) => { e.preventDefault(); return false; };
    });
  }

  // ==========================================
  // 11. BOOTSTRAP
  // ==========================================
  function init() {
    resizeCanvas();
    initNavigation();
    initPortfolio();
    initFAQ();
    initEnquiryForm();
    initContentSecurity();
    if (ctx) {
      requestAnimationFrame(updateAnimation);
      loadAllFrames();
    }
    onScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
