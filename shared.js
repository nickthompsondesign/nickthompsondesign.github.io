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
if (document.readyState === 'complete') { dismissPreloader(); } 
else { window.addEventListener('load', dismissPreloader); setTimeout(dismissPreloader, 6000); }

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
    const overlapAmount = isMobile ? 40 : (metaBox.offsetHeight / 2);
    
    // Position the meta box
    metaBox.style.marginTop = `-${overlapAmount}px`;

    // Sync Background Height to the Hero Content
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
  
  // Initial run
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

  // Close when a nav link is clicked
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── Interactive Bubble (Desktop Only) ──
if (window.innerWidth >= 1024) {
  const interBubble = document.querySelector('.interactive');
  if (interBubble) {
    let curX=0, curY=0, tgX=0, tgY=0;
    const move = () => {
      curX += (tgX-curX)/25; curY += (tgY-curY)/25;
      interBubble.style.transform = `translate(${Math.round(curX)}px,${Math.round(curY)}px)`;
      requestAnimationFrame(move);
    };
    window.addEventListener('mousemove', e => { tgX=e.clientX; tgY=e.clientY; }, { passive: true });
    move();
  }
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