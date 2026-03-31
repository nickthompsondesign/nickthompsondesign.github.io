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
const skipPreloader = new URLSearchParams(window.location.search).has('ref');


// ── Ref Link Transition ──
document.querySelectorAll('a[href*="?ref="]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || link.target === '_blank') return;
    e.preventDefault();

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:#000113;opacity:0;z-index:99999;transition:opacity 0.4s ease;pointer-events:none;';
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      setTimeout(() => { window.location = href; }, 400);
    });
  });
});


if (skipPreloader) {
  const pre = document.getElementById('preloader');
  if (pre) pre.style.display = 'none';
  document.body.classList.add('loaded');
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
if (window.innerWidth >= 1024) {
  const interBubble = document.querySelector('.interactive');
  if (interBubble) {

    // Force toned-down styles on Safari via inline — overrides all CSS
    if (isSafari) {
      interBubble.style.mixBlendMode = 'screen';
      interBubble.style.opacity = '0.2';
    }

    let curX = 0, curY = 0, tgX = 0, tgY = 0;
    let bubbleRafId;

    const moveBubble = () => {
      curX += (tgX - curX) / 25;
      curY += (tgY - curY) / 25;
      interBubble.style.transform = `translate(${Math.round(curX)}px,${Math.round(curY)}px)`;
      bubbleRafId = requestAnimationFrame(moveBubble);
    };

    window.addEventListener('mousemove', e => { tgX = e.clientX; tgY = e.clientY; }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(bubbleRafId);
      else bubbleRafId = requestAnimationFrame(moveBubble);
    });

    bubbleRafId = requestAnimationFrame(moveBubble);
  }
}

// ── Animated Blob Background ──
const canvas = document.getElementById('gradient-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');

  const FPS_CAP    = 30;
  const FRAME_MS   = 1000 / FPS_CAP;
  const isLowEnd   = (navigator.hardwareConcurrency || 4) <= 4;
  const BLOB_COUNT = isLowEnd ? 3 : 5;
  const BG_COLOR   = '#0a0a0a';

  let blobRafId;
  let lastFrameTime = 0;

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  const blobs = Array.from({ length: BLOB_COUNT }, (_, i) => ({
    x:      (canvas.width  / (BLOB_COUNT - 1)) * i,
    y:      (canvas.height / (BLOB_COUNT - 1)) * i,
    phaseX: Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    speedX: 0.15 + Math.random() * 0.15,
    speedY: 0.15 + Math.random() * 0.15,
    radiusX: canvas.width  * (0.25 + Math.random() * 0.2),
    radiusY: canvas.height * (0.25 + Math.random() * 0.2),
    color: [
      'rgba(99,  102, 241, 0.55)',
      'rgba(139,  92, 246, 0.50)',
      'rgba(59,  130, 246, 0.50)',
      'rgba(16,  185, 129, 0.45)',
      'rgba(236,  72, 153, 0.45)',
    ][i % 5],
    size: Math.min(canvas.width, canvas.height) * (isLowEnd ? 0.45 : 0.55),
  }));

  function drawFrame(timestamp) {
    blobRafId = requestAnimationFrame(drawFrame);

    const delta = timestamp - lastFrameTime;
    if (delta < FRAME_MS) return;
    lastFrameTime = timestamp - (delta % FRAME_MS);

    const t = timestamp * 0.001;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    blobs.forEach(blob => {
      const cx = blob.x + Math.sin(t * blob.speedX + blob.phaseX) * blob.radiusX;
      const cy = blob.y + Math.cos(t * blob.speedY + blob.phaseY) * blob.radiusY;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, blob.size);
      grad.addColorStop(0, blob.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, blob.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(blobRafId);
    } else {
      lastFrameTime = 0;
      blobRafId = requestAnimationFrame(drawFrame);
    }
  });

  blobRafId = requestAnimationFrame(drawFrame);
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

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Resume animation or set opacity to 1
      gradient.style.display = 'block';
    } else {
      // Kill the animation/rendering entirely when off-screen
      gradient.style.display = 'none';
    }
  });
}, { threshold: 0.1 });

observer.observe(document.querySelector('.hero-container'));



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
