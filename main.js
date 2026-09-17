/**
 * High-Performance Smooth Scroll Frame Animation & Interactive Portfolio Engine
 * Aditya Govindwad Portfolio — Professional Photographer & Cinematic Video Editor
 */

(function () {
  'use strict';

  // ==========================================
  // 1. CONFIGURATION & STATE
  // ==========================================
  const TOTAL_FRAMES = 240;
  const FRAME_BASE_PATH = 'video_frames_24fps_png/frame_';
  const LERP_DAMPING = 0.12; // Butter-smooth damping factor
  const CONCURRENT_LOAD_LIMIT = 8; // Concurrency limit for background image preloading

  function getFrameUrl(index) {
    const padded = String(index).padStart(5, '0');
    return `${FRAME_BASE_PATH}${padded}.png`;
  }

  // DOM Elements - Animation
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const loaderBar = document.getElementById('loader-bar');
  const loaderBarContainer = document.getElementById('loader-bar-container');
  const currentFrameNum = document.getElementById('current-frame-num');

  // DOM Elements - UI & Interactivity
  const accordionItems = document.querySelectorAll('.service-item');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section, footer');
  const backToTopBtn = document.getElementById('back-to-top');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  // Animation Engine State
  const images = new Array(TOTAL_FRAMES + 1);
  const loadedStatus = new Uint8Array(TOTAL_FRAMES + 1); // 1 = loaded, 0 = pending
  let loadedCount = 0;
  let targetFrame = 1;
  let currentFrame = 1;
  let renderedFrame = -1;
  let isInitialFrameDrawn = false;

  // ==========================================
  // 2. CANVAS RESPONSIVE & COVER ENGINE
  // ==========================================
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);

    if (renderedFrame > 0) {
      drawFrame(renderedFrame);
    }
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });

  function drawCoverImage(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

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
    let img = images[frameIndex];

    if (img && loadedStatus[frameIndex]) {
      drawCoverImage(img);
      return;
    }

    // Smart nearest-loaded fallback to avoid blank screen or flickering
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
  // 3. 60FPS / 120FPS LERP RENDER LOOP
  // ==========================================
  function updateAnimation() {
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
    if (maxScroll <= 0) return;

    const scrollRatio = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    targetFrame = 1 + scrollRatio * (TOTAL_FRAMES - 1);

    // Dynamic Navigation Highlighting
    let currentActiveId = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
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
  // 5. PROGRESSIVE ASSET PRELOADER
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
        console.warn(`[Preloader] Failed to load frame ${index}`);
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
    // 1. Instant First Frame
    await loadImage(1);

    // 2. High-priority Initial Chunk (frames 2 to 24)
    const priorityChunk = [];
    for (let i = 2; i <= Math.min(24, TOTAL_FRAMES); i++) {
      priorityChunk.push(loadImage(i));
    }
    await Promise.all(priorityChunk);

    // 3. Progressive Background Queue (frames 25 to 240) in throttled concurrent pools
    const remainingIndices = [];
    for (let i = 25; i <= TOTAL_FRAMES; i++) {
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
  // 6. SERVICES ACCORDION INTERACTION
  // ==========================================
  function initAccordion() {
    accordionItems.forEach((item) => {
      item.addEventListener('click', () => {
        const isAlreadyActive = item.classList.contains('active');

        // Close all items
        accordionItems.forEach((other) => other.classList.remove('active'));

        // If clicked item wasn't active, activate it
        if (!isAlreadyActive) {
          item.classList.add('active');
        }
      });
    });
  }

  // ==========================================
  // 7. SMOOTH NAVIGATION & UTILITIES
  // ==========================================
  function initNavigation() {
    // Back to top
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Mobile menu toggle
    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
      });
    }

    // Close mobile menu on link click
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (navMenu && navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
        }
      });
    });
  }

  // ==========================================
  // 8. PORTFOLIO FILTERING, HOVER PREVIEWS & MODAL
  // ==========================================
  function initPortfolio() {
    // Category Filtering
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

    // Muted Live Video Preview on Card Hover
    document.querySelectorAll('.project-media-wrap[data-type="video"]').forEach((wrap) => {
      const cardVideo = wrap.querySelector('video');
      if (!cardVideo) return;

      wrap.addEventListener('mouseenter', () => {
        cardVideo.currentTime = 0;
        const playPromise = cardVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay prevented or aborted
          });
        }
      });

      wrap.addEventListener('mouseleave', () => {
        cardVideo.pause();
        cardVideo.currentTime = 0;
      });
    });

    // Cinematic Lightbox Modal
    const modal = document.getElementById('media-modal');
    const modalTitle = document.getElementById('modal-media-title');
    const modalContainer = document.getElementById('modal-media-container');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    function openModal(src, title, type) {
      if (!modal || !modalContainer) return;

      modalContainer.innerHTML = '';
      modalTitle.textContent = title || 'Cinematic Showcase';

      if (type === 'video') {
        const video = document.createElement('video');
        video.className = 'modal-video-player';
        video.src = src;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        modalContainer.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.className = 'modal-image-view';
        img.src = src;
        img.alt = title || 'Photography Work';
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
        modalContainer.innerHTML = ''; // Stops audio and video playback
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

    // Card Trigger Clicks
    document.querySelectorAll('.project-media-wrap').forEach((wrap) => {
      wrap.addEventListener('click', () => {
        const src = wrap.getAttribute('data-src');
        const title = wrap.getAttribute('data-title');
        const type = wrap.getAttribute('data-type');
        openModal(src, title, type);
      });
    });

    document.querySelectorAll('.project-play-pill').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const src = btn.getAttribute('data-src');
        const title = btn.getAttribute('data-title');
        const isPhoto = src.endsWith('.jpg') || src.endsWith('.png');
        openModal(src, title, isPhoto ? 'image' : 'video');
      });
    });

    // Hero Showreel Button trigger
    const heroShowreelBtn = document.querySelector('.hero-actions-row .btn-primary-gold');
    if (heroShowreelBtn) {
      heroShowreelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('Ditya 00.mp4', 'Ditya Turns One — 1st Birthday Cinematic Celebration', 'video');
      });
    }
  }

  // ==========================================
  // 9. BOOTSTRAP
  // ==========================================
  function init() {
    resizeCanvas();
    initAccordion();
    initNavigation();
    initPortfolio();
    requestAnimationFrame(updateAnimation);
    loadAllFrames();
    onScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
