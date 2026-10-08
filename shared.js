/* =============================================
   Nick Thompson Design — shared.js
   ============================================= */

const IS_INDEX = document.body.classList.contains('index-page');
const IS_SUB   = document.body.classList.contains('sub-page');

// ── Preloader ──
const minPreloaderTime = 1800;
const initTime = Date.now();

function dismissPreloader() {
  const remaining = Math.max(0, minPreloaderTime - (Date.now() - initTime));
  setTimeout(() => {
    const pre = document.getElementById('preloader');
    if(pre) pre.classList.add('fade-out');
    document.body.classList.add('loaded');
  }, remaining);
}

const navType = performance.getEntriesByType('navigation')[0]?.type 
  ?? performance.navigation?.type;

// PERF: show the full 1.8s intro once per browser session; later pages fade straight in
let seenIntro = false;
try { seenIntro = sessionStorage.getItem('ntdIntroSeen') === '1'; sessionStorage.setItem('ntdIntroSeen', '1'); } catch (e) {}

const skipPreloader = 
  new URLSearchParams(window.location.search).has('ref') ||
  navType === 'back_forward' ||
  navType === 2 ||
  seenIntro;


// ── Ref Link Transition ──
document.querySelectorAll('a[href*="?ref="]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || link.target === '_blank') return;
    e.preventDefault();

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:radial-gradient(circle at center,#01042d 0%,#000113 100%);opacity:0;z-index:99999;transition:opacity 0.2s ease;pointer-events:none;';
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      setTimeout(() => { window.location = href; }, 200);
    });
  });
});


if (skipPreloader) {
  const pre = document.getElementById('preloader');
  if (pre) pre.style.display = 'none';
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  document.body.classList.add('loaded');
  requestAnimationFrame(() => {
    setTimeout(() => { document.body.style.opacity = '1'; }, 50);
  });
} else {
  if (document.readyState === 'complete') { dismissPreloader(); }
  else { window.addEventListener('load', dismissPreloader); setTimeout(dismissPreloader, 6000); }
}

// ── Header & Layout Logic ──
const header = document.querySelector('header');

if (IS_INDEX) {
  const getHeroH = () => document.querySelector('.hero-wrapper')?.offsetHeight || 800;
  const updateHeader = () => {
    const y = window.scrollY;
    if (y < 20) {
      header.classList.remove('scrolled','scrolled-dark','scrolled-light');
    } else if (y < getHeroH() - 80) {
      header.classList.add('scrolled','scrolled-dark');
      header.classList.remove('scrolled-light');
    } else {
      header.classList.add('scrolled','scrolled-light');
      header.classList.remove('scrolled-dark');
    }
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}

if (IS_SUB) {
  const heroBg = document.querySelector('.hero-bg-wrapper');
  const projectHero = document.querySelector('.project-hero');
  const metaBox = document.querySelector('.project-meta-light');

function adjustSubPageLayout() {
    if (!projectHero || !metaBox) return;

    const isMobile = window.innerWidth < 1024;

    if (isMobile) {
      projectHero.style.paddingBottom = '';
      metaBox.style.marginTop = '-40px';
    } else {
      const halfMeta = metaBox.offsetHeight / 2;
      projectHero.style.paddingBottom = `${halfMeta}px`;
      metaBox.style.marginTop = `-${halfMeta}px`;
    }

    if (heroBg) {
      heroBg.style.height = `${projectHero.offsetHeight}px`;
    }
  }

  const updateHeaderSub = () => {
    const y = window.scrollY;
    const threshold = heroBg ? heroBg.offsetHeight - 80 : 300;
    if (y < 20) {
      header.classList.remove('scrolled-dark','scrolled-light');
    } else if (y < threshold) {
      header.classList.add('scrolled-dark');
      header.classList.remove('scrolled-light');
    } else {
      header.classList.add('scrolled-light');
      header.classList.remove('scrolled-dark');
    }
  };

  window.addEventListener('scroll', updateHeaderSub, { passive: true });
  window.addEventListener('resize', adjustSubPageLayout);
  window.addEventListener('load', () => {
    adjustSubPageLayout();
    updateHeaderSub();
  });
  
  adjustSubPageLayout();
  setTimeout(adjustSubPageLayout, 200);
}

// ── Hamburger ──
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── Safari Detection ──
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// ── Interactive Bubble (Desktop Only) ──
// PERF: the loop now sleeps once the bubble has caught up with the mouse,
// and while the hero is off-screen, instead of running 60x a second forever.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let heroVisible = true;

if (window.innerWidth >= 1024 && !reduceMotion) {
  const interBubble = document.querySelector('.interactive');
  if (interBubble) {

    // Force toned-down styles on Safari via inline — overrides all CSS
    if (isSafari) {
      interBubble.style.mixBlendMode = 'screen';
      interBubble.style.opacity = '0.2';
    }

    let curX = 0, curY = 0, tgX = 0, tgY = 0;
    let bubbleRafId = null;

    const moveBubble = () => {
      curX += (tgX - curX) / 25;
      curY += (tgY - curY) / 25;
      interBubble.style.transform = `translate(${Math.round(curX)}px,${Math.round(curY)}px)`;
      if (Math.abs(tgX - curX) < 0.5 && Math.abs(tgY - curY) < 0.5) { bubbleRafId = null; return; }
      bubbleRafId = requestAnimationFrame(moveBubble);
    };

    window.startBubble = () => {
      if (bubbleRafId === null && heroVisible && !document.hidden) bubbleRafId = requestAnimationFrame(moveBubble);
    };

    window.addEventListener('mousemove', e => { tgX = e.clientX; tgY = e.clientY; window.startBubble(); }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && bubbleRafId !== null) { cancelAnimationFrame(bubbleRafId); bubbleRafId = null; }
      else window.startBubble();
    });
  }
}

// ── Pause hero gradients when scrolled out of view ──
const heroArea = document.querySelector('.hero-bg-wrapper, .hero-container');
if (heroArea && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    document.body.classList.toggle('hero-paused', !heroVisible);
    if (heroVisible && window.startBubble) window.startBubble();
  }).observe(heroArea);
}

// ── Scroll Reveal ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));



const gradient = document.querySelector('.gradient-bg');
const heroContainer = document.querySelector('.hero-container');

if (gradient && heroContainer) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      gradient.style.display = entry.isIntersecting ? 'block' : 'none';
    });
  }, { threshold: 0.1 });

  observer.observe(heroContainer);
}

// ── Square Box Tilt ──
if (window.innerWidth >= 1024 && !('ontouchstart' in window)) {
  const box = document.querySelector('.square-box');
  if (box) {
     
   window.addEventListener('load', () => {
     box.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
   });
        
    let rafId = null;

    box.addEventListener('mousemove', e => {
      const rect = box.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        box.style.transition = 'transform 0.1s ease-out';
        box.style.transform  = `perspective(1000px) rotateX(${y * -12}deg) rotateY(${x * 12}deg)`;
        rafId = null;
      });
    }, { passive: true });

    box.addEventListener('mouseleave', () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      box.style.transition = 'transform 0.6s var(--ease-smooth)';
      box.style.transform  = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  }
}

// Drag-to-scroll on all flow scroll wraps
document.querySelectorAll('.flow-scroll-wrap').forEach(el => {
  let isDown = false, startX, scrollLeft;

  el.addEventListener('mousedown', e => {
    e.preventDefault();
    isDown = true;
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
  });

  el.addEventListener('mouseleave', () => { isDown = false; });
  el.addEventListener('mouseup', () => { isDown = false; });

  el.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    el.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });
});


// Lightbox Grid
document.addEventListener('DOMContentLoaded', function() {
  var lightbox = document.getElementById('lightbox');
  // Only run if the lightbox exists on the current page
  if (!lightbox) return; 

  var video = document.getElementById('lightbox-video');
  var image = document.getElementById('lightbox-image');
  var caption = document.getElementById('lightbox-caption');
  var prevBtn = document.getElementById('lightbox-prev');
  var nextBtn = document.getElementById('lightbox-next');

  var currentTiles = [];
  var currentIndex = 0;

  function showSlide(index) {
    if (!currentTiles.length) return;
    currentIndex = (index + currentTiles.length) % currentTiles.length;
    var tile = currentTiles[currentIndex];
    var type = tile.getAttribute('data-type');
    var src = tile.getAttribute('data-src');
    var label = tile.getAttribute('data-label') || '';

    if (type === 'image') {
      if(video) { video.pause(); video.removeAttribute('src'); video.style.display = 'none'; }
      if(image) { image.src = src; image.alt = label; image.style.display = 'block'; }
    } else {
      if(image) { image.style.display = 'none'; }
      if(video) { video.style.display = 'block'; video.src = src; video.setAttribute('aria-label', label); video.play(); }
    }
    
    if(caption) caption.textContent = label;

    // Show or hide arrows depending on if we have multiple items
    var multiple = currentTiles.length > 1;
    if(prevBtn) prevBtn.style.display = multiple ? 'flex' : 'none';
    if(nextBtn) nextBtn.style.display = multiple ? 'flex' : 'none';
  }

  function openLightbox(tiles, startIndex) {
    currentTiles = tiles;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    showSlide(startIndex);
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    if(video) { video.pause(); video.removeAttribute('src'); video.load(); }
    if(image) { image.removeAttribute('src'); }
  }

  // Find all tiles and bind the click event
  document.querySelectorAll('.tile[data-src]').forEach(function (tile) {
    tile.addEventListener('click', function () {
      // Check if tile is part of a grid. If yes, grab all tiles in that grid. If no, just use this one tile.
      var grid = tile.closest('.masonry-grid, .zone-grid, .project-compare-grid');
      var tiles = grid ? Array.prototype.slice.call(grid.querySelectorAll('.tile[data-src]')) : [tile];
      var startIndex = tiles.indexOf(tile) > -1 ? tiles.indexOf(tile) : 0;
      
      openLightbox(tiles, startIndex);
    });
  });

  // Bind Arrows
  if(prevBtn) prevBtn.addEventListener('click', function () { showSlide(currentIndex - 1); });
  if(nextBtn) nextBtn.addEventListener('click', function () { showSlide(currentIndex + 1); });

  // Bind Close Buttons
  lightbox.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', closeLightbox);
  });

  // Keyboard controls
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight' && currentTiles.length > 1) showSlide(currentIndex + 1);
    if (e.key === 'ArrowLeft' && currentTiles.length > 1) showSlide(currentIndex - 1);
  });
});

// Mouse effect
// PERF: positions with transform (no layout recalculation), stops the loop when
// the trail has settled, and never starts on touch screens.
document.addEventListener('DOMContentLoaded', () => {
  const dot = document.getElementById('cursorDot');
  const outline = document.getElementById('cursorOutline');
  if (!dot || !outline) return;

  if (window.matchMedia('(pointer: coarse)').matches) {
    dot.style.display = 'none';
    outline.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let outlineX = 0, outlineY = 0;
  let cursorRafId = null;

  const TRAIL_LENGTH = reduceMotion ? 0 : 10;
  const trailDots = [];
  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const el = document.createElement('div');
    el.className = 'trail-dot';
    el.style.opacity = (1 - i / TRAIL_LENGTH) * 0.5;
    document.body.appendChild(el);
    trailDots.push({ el, x: 0, y: 0, scale: 1 - i / TRAIL_LENGTH });
  }

  const place = (el, x, y, scale = 1) => {
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
  };

  function animate() {
    outlineX += (mouseX - outlineX) * 0.18;
    outlineY += (mouseY - outlineY) * 0.18;
    place(outline, outlineX, outlineY);

    let prevX = mouseX, prevY = mouseY;
    let moving = Math.abs(mouseX - outlineX) > 0.3 || Math.abs(mouseY - outlineY) > 0.3;
    trailDots.forEach((t) => {
      t.x += (prevX - t.x) * 0.3;
      t.y += (prevY - t.y) * 0.3;
      place(t.el, t.x, t.y, t.scale);
      if (Math.abs(prevX - t.x) > 0.3 || Math.abs(prevY - t.y) > 0.3) moving = true;
      prevX = t.x;
      prevY = t.y;
    });

    cursorRafId = moving ? requestAnimationFrame(animate) : null;
  }

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    place(dot, mouseX, mouseY);
    if (cursorRafId === null) cursorRafId = requestAnimationFrame(animate);
  }, { passive: true });

  document.querySelectorAll('.hoverable').forEach((el) => {
    el.addEventListener('mouseenter', () => outline.classList.add('hovering'));
    el.addEventListener('mouseleave', () => outline.classList.remove('hovering'));
  });
});



/* =============================================
   Nick Thompson Design — DESIGN UPGRADE (Oct 2026, rev 2)
   Everything from here to the end of the file is the design upgrade.
   ============================================= */
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>';

  // 1. Portfolio cards: wrap the image layers in a notched mask, add the arrow + spotlight
  document.querySelectorAll('.portfolio-card').forEach(function (card) {
    if (card.querySelector('.card-mask')) return;
    var mask = document.createElement('span');
    mask.className = 'card-mask';
    Array.prototype.slice.call(card.children).forEach(function (child) { mask.appendChild(child); });
    var glow = document.createElement('span');
    glow.className = 'card-glow';
    mask.appendChild(glow);
    card.appendChild(mask);

    var btn = document.createElement('span');
    btn.className = 'card-notch-btn';
    btn.setAttribute('aria-hidden', 'true');
    btn.innerHTML = ARROW;
    card.appendChild(btn);

    if (finePointer && !reduceMotion) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    }
  });

  // 2. Scroll progress bar (styled only where CSS scroll timelines are supported)
  if (!document.querySelector('.ntd-progress')) {
    var bar = document.createElement('div');
    bar.className = 'ntd-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
  }

  // 3. Case study overview card: hero-style tilt + a sheen that follows the cursor
  (function () {
    var card = document.querySelector('.project-meta-light');
    if (!card || !finePointer || reduceMotion) return;
    var raf = null;
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        card.classList.add('is-tilting');
        card.style.setProperty('--ry', ((x - 0.5) * 5).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - y) * 5).toFixed(2) + 'deg');
        card.style.setProperty('--sx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--sy', (y * 100).toFixed(1) + '%');
      });
    }, { passive: true });
    card.addEventListener('mouseleave', function () {
      if (raf) cancelAnimationFrame(raf);
      card.classList.remove('is-tilting');
      ['--rx', '--ry', '--sx', '--sy'].forEach(function (p) { card.style.removeProperty(p); });
    });
  })();
})();
