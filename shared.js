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

// Old custom cursor elements are still in the HTML of each page — remove them
// so the normal system cursor is used everywhere.
document.addEventListener('DOMContentLoaded', () => {
  ['cursorDot', 'cursorOutline'].forEach(id => { const el = document.getElementById(id); if (el) el.remove(); });
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
    var frame = document.createElement('span');
    frame.className = 'card-frame';
    frame.appendChild(mask);
    card.appendChild(frame);

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

})();

/* =============================================
   Homepage hero H1: ink-bleed effect
   An SVG turbulence filter roughens the letter edges like ink soaking into
   paper; the text "bleeds" in on load, then settles to a very subtle texture.
   ============================================= */
(function () {
  var h1 = document.querySelector('.hero-text h1');
  if (!h1) return;
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.innerHTML =
    '<filter id="ntd-ink" x="-10%" y="-20%" width="120%" height="140%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="0">' +
        '<animate attributeName="scale" values="22;6;1.5" keyTimes="0;0.6;1" dur="2.4s" fill="freeze" begin="indefinite" id="ntd-ink-anim"/>' +
      '</feDisplacementMap>' +
    '</filter>' +
    '<filter id="ntd-ink-rest" x="-5%" y="-10%" width="110%" height="120%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="7" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="1.5"/>' +
    '</filter>';
  document.body.appendChild(svg);
  var start = function () {
    h1.classList.add('ink-ready');
    var a = document.getElementById('ntd-ink-anim');
    if (a && a.beginElement) { try { a.beginElement(); } catch (e) {} }
    setTimeout(function () { h1.classList.add('ink-done'); }, 2900);
  };
  if (document.body.classList.contains('loaded')) start();
  else new MutationObserver(function (m, o) {
    if (document.body.classList.contains('loaded')) { o.disconnect(); start(); }
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();

/* Tiles: wrap the image layers in a notched frame (inside a wrapper that draws
   the border), leaving the round play/eye button outside so it isn't outlined. */
document.querySelectorAll('.tile').forEach(function (tile) {
  if (tile.querySelector('.tile-frame')) return;
  var wrap = document.createElement('span');
  wrap.className = 'tile-frame-wrap';
  var frame = document.createElement('span');
  frame.className = 'tile-frame';
  Array.prototype.slice.call(tile.children).forEach(function (child) {
    if (!child.classList.contains('tile-play-roundel')) frame.appendChild(child);
  });
  wrap.appendChild(frame);
  tile.insertBefore(wrap, tile.firstChild);
});
